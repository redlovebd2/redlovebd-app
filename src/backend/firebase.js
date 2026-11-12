import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, deleteDoc, updateDoc, collection, getDocs, query, where, orderBy, limit, addDoc, onSnapshot, writeBatch, getCountFromServer } from 'firebase/firestore';
import { firebaseConfig } from '../firebase-config.js';
import { matchDonor } from '../data.js';
import { PUSH_URL } from '../push-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
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
  async signOut() { try { await backend.removeDeviceToken(); } catch {} await signOut(auth); },
  /* ---- push (FCM token + relay call) ---- */
  async saveDeviceToken(token) {
    const u = auth.currentUser; if (!u || !token) return;
    backend._tok = token;
    await setDoc(doc(db, 'users', u.uid, 'devices', token), { token, platform: 'android', updatedAt: Date.now() });
  },
  async removeDeviceToken() { const u = auth.currentUser; if (u && backend._tok) await deleteDoc(doc(db, 'users', u.uid, 'devices', backend._tok)); },
  async pushNow(notifId) {
    if (!PUSH_URL || !notifId || !auth.currentUser) return;
    try {
      const idt = await auth.currentUser.getIdToken();
      await fetch(PUSH_URL.replace(/\/$/, '') + '/push', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + idt }, body: JSON.stringify({ id: notifId }) });
    } catch (e) { console.warn('push failed', e); }
  },
  async resetPassword(email) { await sendPasswordResetEmail(auth, email.trim()); },
  async updateProfile(id, data) {
    await updateDoc(doc(db, 'users', id), data);
    if (profileCache) Object.assign(profileCache, data);
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
    try { (await getDocs(collection(db, 'users', id, 'devices'))).forEach(d => refs.push(d.ref)); } catch {}
    const ns = await getDocs(query(collection(db, 'notifications'), where('toUid', '==', id)));
    ns.forEach(d => refs.push(d.ref));
    refs.push(doc(db, 'donors', id), doc(db, 'users', id));
    for (let i = 0; i < refs.length; i += 400) {
      const b = writeBatch(db); refs.slice(i, i + 400).forEach(r => b.delete(r)); await b.commit();
    }
    await deleteUser(u);
  },
  /* ---- admin & ads ---- */
  async isAdmin(uid) { try { return (await getDoc(doc(db, 'admins', uid))).exists(); } catch { return false; } },
  async getAd() { try { const s = await getDoc(doc(db, 'ads', 'current')); return s.exists() ? s.data() : null; } catch { return null; } },
  async saveAd(ad) { await setDoc(doc(db, 'ads', 'current'), { ...ad, updatedAt: Date.now() }); },
  async deleteAd() { await deleteDoc(doc(db, 'ads', 'current')); },
  /* ---- notifications ---- */
  watchNotifications(uid, cb) {
    return onSnapshot(query(collection(db, 'notifications'), where('toUid', '==', uid)),
      (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt).slice(0, 50)), () => {});
  },
  async markNotifsRead(ids) {
    if (!ids.length) return; const b = writeBatch(db);
    ids.forEach(i => b.update(doc(db, 'notifications', i), { read: true })); await b.commit();
  },
  /* ---- live chat: messages vanish after 2 minutes ---- */
  openChat(me, otherUid, cb) {
    const pair = [me.uid, otherUid].sort().join('_');
    const col = collection(db, 'chats', pair, 'messages');
    const unsub = onSnapshot(query(col, orderBy('createdAt', 'desc'), limit(60)), (snap) => {
      const now = Date.now(); const live = [];
      snap.docs.forEach(d => { const m = { id: d.id, ...d.data() }; if (m.expireAt > now) live.push(m); else deleteDoc(d.ref).catch(() => {}); });
      cb(live.sort((a, b) => a.createdAt - b.createdAt));
    }, () => {});
    return {
      send: (text) => addDoc(col, { from: me.uid, text: text.slice(0, 500), createdAt: Date.now(), expireAt: Date.now() + 120000 }),
      close: unsub
    };
  },
  async listDonors({ group, district, upazila, address }) {
    const cons = [];
    if (group) cons.push(where('group', '==', group));
    if (district) cons.push(where('district', '==', district));
    const snap = await getDocs(query(collection(db, 'donors'), ...cons));
    return snap.docs.map(d => d.data()).filter(d => matchDonor(d, { upazila, address }));
  },
  async recentDonors(n) {
    const snap = await getDocs(query(collection(db, 'donors'), orderBy('updatedAt', 'desc'), limit(n)));
    return snap.docs.map(d => d.data());
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
    // best-effort: the request itself must never fail because of the notification
    try { const nr = await addDoc(collection(db, 'notifications'), { toUid, fromUid: me.uid, kind: 'request', fromName: me.name, label: label || '', createdAt: Date.now(), read: false }); backend.pushNow(nr.id); } catch (e) { console.warn('notify failed', e); }
  },
  async listContacts(me) {
    const [a, b] = await Promise.all([
      getDocs(query(collection(db, 'contactRequests'), where('toUid', '==', me.uid))),
      getDocs(query(collection(db, 'contactRequests'), where('fromUid', '==', me.uid)))
    ]);
    const m = s => s.docs.map(d => ({ id: d.id, ...d.data() })).sort((x, y) => y.createdAt - x.createdAt);
    return { incoming: m(a), outgoing: m(b) };
  },
  async respond(me, c, accept) {
    const ref = doc(db, 'contactRequests', c.id);
    const batch = writeBatch(db);
    batch.update(ref, { status: accept ? 'accepted' : 'declined', respondedAt: Date.now() });
    if (accept) batch.set(doc(ref, 'private', 'donor'), { name: me.name, phone: me.phone, email: me.email });
    await batch.commit();
    try { const nr = await addDoc(collection(db, 'notifications'), { toUid: c.fromUid, fromUid: me.uid, kind: accept ? 'accepted' : 'declined', fromName: me.name, label: c.label || '', createdAt: Date.now(), read: false }); backend.pushNow(nr.id); } catch (e) { console.warn('notify failed', e); }
  },
  async getReveal(me, c) {
    if (c.status !== 'accepted') return null;
    const which = c.toUid === me.uid ? 'requester' : 'donor';
    const s = await getDoc(doc(db, 'contactRequests', c.id, 'private', which));
    return s.exists() ? s.data() : null;
  }
};
