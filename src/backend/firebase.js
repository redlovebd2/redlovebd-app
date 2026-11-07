import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, updateDoc, collection, getDocs, query, where, addDoc, writeBatch, getCountFromServer } from 'firebase/firestore';
import { firebaseConfig } from '../firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const fail = (code) => { const e = new Error(code); e.code = code; throw e; };
let profileCache = null;

const loadProfile = async (u) => {
  const s = await getDoc(doc(db, 'users', u.uid));
  profileCache = s.exists() ? s.data() : { name: '', phone: '', email: u.email };
  return { uid: u.uid, ...profileCache };
};

export const backend = {
  mode: 'firebase',
  onAuth(cb) {
    onAuthStateChanged(auth, async (u) => cb(u ? await loadProfile(u) : null));
  },
  async signUp({ name, phone, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await setDoc(doc(db, 'users', cred.user.uid), { name, phone, email: email.trim() });
  },
  async signIn(email, password) { await signInWithEmailAndPassword(auth, email.trim(), password); },
  async signOut() { await signOut(auth); },
  async updateProfile(id, { name, phone }) {
    await updateDoc(doc(db, 'users', id), { name, phone });
    if (profileCache) Object.assign(profileCache, { name, phone });
  },
  async deleteAccount(id, password) {
    const u = auth.currentUser;
    try { await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, password)); }
    catch (e) { fail('bad-credentials'); }
    const refs = [];
    const reqs = await getDocs(query(collection(db, 'bloodRequests'), where('uid', '==', id)));
    reqs.forEach(d => refs.push(d.ref));
    for (const field of ['fromUid', 'toUid']) {
      const cs = await getDocs(query(collection(db, 'contactRequests'), where(field, '==', id)));
      for (const c of cs.docs) {
        for (const w of ['requester', 'donor']) refs.push(doc(c.ref, 'private', w));
        refs.push(c.ref);
      }
    }
    refs.push(doc(db, 'donors', id), doc(db, 'users', id));
    for (let i = 0; i < refs.length; i += 400) {
      const b = writeBatch(db); refs.slice(i, i + 400).forEach(r => b.delete(r)); await b.commit();
    }
    await deleteUser(u);
  },
  async listDonors({ group, district, upazila }) {
    const cons = [];
    if (group) cons.push(where('group', '==', group));
    if (district) cons.push(where('district', '==', district));
    const snap = await getDocs(query(collection(db, 'donors'), ...cons));
    let l = snap.docs.map(d => d.data());
    if (upazila) l = l.filter(d => (d.upazila || '').toLowerCase().includes(upazila.trim().toLowerCase()));
    return l;
  },
  async getMyDonor(id) { const s = await getDoc(doc(db, 'donors', id)); return s.exists() ? s.data() : null; },
  async saveDonor(id, data) { await setDoc(doc(db, 'donors', id), { ...data, uid: id, updatedAt: Date.now() }); },
  async deleteDonor(id) { await deleteDoc(doc(db, 'donors', id)); },
  async listBloodRequests() {
    const snap = await getDocs(query(collection(db, 'bloodRequests'), where('status', '==', 'open')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt);
  },
  async createBloodRequest(id, data) {
    await addDoc(collection(db, 'bloodRequests'), { ...data, uid: id, status: 'open', createdAt: Date.now() });
  },
  async closeBloodRequest(rid) { await updateDoc(doc(db, 'bloodRequests', rid), { status: 'closed' }); },
  async counts() {
    const [d, r] = await Promise.all([
      getCountFromServer(collection(db, 'donors')),
      getCountFromServer(query(collection(db, 'bloodRequests'), where('status', '==', 'open')))
    ]);
    return { donors: d.data().count, requests: r.data().count };
  },
  async sendContact(me, { toUid, toName, kind, label, message }) {
    const dup = await getDocs(query(collection(db, 'contactRequests'), where('fromUid', '==', me.uid)));
    if (dup.docs.some(d => d.data().toUid === toUid && d.data().status === 'pending')) fail('already-sent');
    const ref = doc(collection(db, 'contactRequests'));
    const batch = writeBatch(db);
    batch.set(ref, { fromUid: me.uid, fromName: me.name, toUid, toName, kind, label, message, status: 'pending', createdAt: Date.now() });
    batch.set(doc(ref, 'private', 'requester'), { name: me.name, phone: me.phone, email: me.email });
    await batch.commit();
  },
  async listContacts(me) {
    const [a, b] = await Promise.all([
      getDocs(query(collection(db, 'contactRequests'), where('toUid', '==', me.uid))),
      getDocs(query(collection(db, 'contactRequests'), where('fromUid', '==', me.uid)))
    ]);
    const m = s => s.docs.map(d => ({ id: d.id, ...d.data() })).sort((x, y) => y.createdAt - x.createdAt);
    return { incoming: m(a), outgoing: m(b) };
  },
  async respond(me, id, accept) {
    const ref = doc(db, 'contactRequests', id);
    const batch = writeBatch(db);
    batch.update(ref, { status: accept ? 'accepted' : 'declined', respondedAt: Date.now() });
    if (accept) batch.set(doc(ref, 'private', 'donor'), { name: me.name, phone: me.phone, email: me.email });
    await batch.commit();
  },
  async getReveal(me, c) {
    if (c.status !== 'accepted') return null;
    const which = c.toUid === me.uid ? 'requester' : 'donor';
    const s = await getDoc(doc(db, 'contactRequests', c.id, 'private', which));
    return s.exists() ? s.data() : null;
  }
};
