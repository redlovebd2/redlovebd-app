// DEMO backend: everything is stored in localStorage on this device only.
import { matchDonor } from '../data.js';
const KEY = 'redlovebd_demo_v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const base = () => Object.assign({ users: {}, donors: {}, bloodRequests: {}, contactRequests: {}, notifications: {}, chats: {}, ad: null, session: null }, load());
const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));
const uid = () => 'u' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const hash = async (s) => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
};
let listeners = [];
const emit = () => { const u = currentUser(); listeners.forEach(f => f(u)); };
const sess = () => { try { return sessionStorage.getItem('rl_sess'); } catch { return null; } };
const setSess = (v) => { try { v ? sessionStorage.setItem('rl_sess', v) : sessionStorage.removeItem('rl_sess'); } catch {} };
const currentUser = () => { const db = base(); const s = sess(); return s && db.users[s] ? { uid: s, ...pub(db.users[s]) } : null; };
const pub = (u) => u ? { name: u.name, phone: u.phone, email: u.email, group: u.group || '', district: u.district || '', upazila: u.upazila || '', address: u.address || '' } : {};
const fail = (code) => { const e = new Error(code); e.code = code; throw e; };

export const backend = {
  mode: 'demo',
  onAuth(cb) { listeners.push(cb); cb(currentUser()); },
  async signUp({ name, phone, email, password }) {
    const db = base(); email = email.trim().toLowerCase();
    if (Object.values(db.users).some(u => u.email === email)) fail('email-exists');
    const id = uid();
    db.users[id] = { name, phone, email, pw: await hash(password) };
    setSess(id); save(db); emit();
  },
  async resetPassword(email) { const db = base(); if (!Object.values(db.users).some(u => u.email === email.trim().toLowerCase())) fail('user-not-found'); },
  async signIn(email, password) {
    const db = base(); email = email.trim().toLowerCase();
    const [id, u] = Object.entries(db.users).find(([, u]) => u.email === email) || [];
    if (!u || u.pw !== await hash(password)) fail('bad-credentials');
    setSess(id); save(db); emit();
  },
  async signOut() { setSess(null); emit(); },
  async updateProfile(id, data) {
    const db = base(); Object.assign(db.users[id], data); save(db); emit();
  },
  async deleteAccount(id) {
    const db = base();
    delete db.users[id]; delete db.donors[id];
    for (const [k, r] of Object.entries(db.bloodRequests)) if (r.uid === id) delete db.bloodRequests[k];
    for (const [k, c] of Object.entries(db.contactRequests)) if (c.fromUid === id || c.toUid === id) delete db.contactRequests[k];
    for (const [k, n] of Object.entries(db.notifications || {})) if (n.toUid === id) delete db.notifications[k];
    setSess(null); save(db); emit();
  },
  async listDonors({ group, district, upazila, address }) {
    let l = Object.values(base().donors);
    if (group) l = l.filter(d => d.group === group);
    if (district) l = l.filter(d => d.district === district);
    return l.filter(d => matchDonor(d, { upazila, address }));
  },
  async isAdmin(id) { const u = base().users[id]; return !!(u && u.admin); },
  async getAd() { return base().ad; },
  async saveAd(ad) { const db = base(); db.ad = { ...ad, updatedAt: Date.now() }; save(db); },
  async deleteAd() { const db = base(); db.ad = null; save(db); },
  watchNotifications(id, cb) {
    const run = () => cb(Object.entries(base().notifications).map(([k, n]) => ({ id: k, ...n })).filter(n => n.toUid === id).sort((a, b) => b.createdAt - a.createdAt));
    run(); const h = setInterval(run, 1500); return () => clearInterval(h);
  },
  async markNotifsRead(ids) { const db = base(); ids.forEach(i => { if (db.notifications[i]) db.notifications[i].read = true; }); save(db); },
  openChat(me, otherUid, cb) {
    const pair = [me.uid, otherUid].sort().join('_');
    const run = () => {
      const db = base(); const now = Date.now(); const list = (db.chats[pair] || []);
      const live = list.filter(m => m.expireAt > now);
      if (live.length !== list.length) { db.chats[pair] = live; save(db); }
      cb(live);
    };
    run(); const h = setInterval(run, 1000);
    return {
      send: async (text) => { const db = base(); (db.chats[pair] = db.chats[pair] || []).push({ id: uid(), from: me.uid, text: text.slice(0, 500), createdAt: Date.now(), expireAt: Date.now() + 120000 }); save(db); run(); },
      close: () => clearInterval(h)
    };
  },
  async recentDonors(n) { return Object.values(base().donors).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, n); },
  async getMyDonor(id) { return base().donors[id] || null; },
  async saveDonor(id, data) { const db = base(); db.donors[id] = { ...data, uid: id, updatedAt: Date.now() }; save(db); },
  async deleteDonor(id) { const db = base(); delete db.donors[id]; save(db); },
  async listBloodRequests() {
    return Object.entries(base().bloodRequests).map(([id, r]) => ({ id, ...r }))
      .filter(r => r.status === 'open').sort((a, b) => b.createdAt - a.createdAt);
  },
  async createBloodRequest(id, data) {
    const db = base(); const rid = uid();
    db.bloodRequests[rid] = { ...data, uid: id, status: 'open', createdAt: Date.now() }; save(db);
  },
  async closeBloodRequest(rid) { const db = base(); db.bloodRequests[rid].status = 'closed'; save(db); },
  async counts() {
    const db = base();
    return { donors: Object.keys(db.donors).length, requests: Object.values(db.bloodRequests).filter(r => r.status === 'open').length };
  },
  async sendContact(me, { toUid, toName, kind, label, message }) {
    const db = base();
    if (Object.values(db.contactRequests).some(c => c.fromUid === me.uid && c.toUid === toUid && c.status === 'pending')) fail('already-sent');
    const id = uid();
    db.contactRequests[id] = { fromUid: me.uid, fromName: me.name, toUid, toName, kind, label, message, status: 'pending', createdAt: Date.now(),
      _requester: { name: me.name, phone: me.phone, email: me.email } };
    db.notifications[uid()] = { toUid, fromUid: me.uid, kind: 'request', fromName: me.name, label: label || '', createdAt: Date.now(), read: false };
    save(db);
  },
  async listContacts(me) {
    const all = Object.entries(base().contactRequests).map(([id, c]) => ({ id, ...c, _requester: undefined }));
    const s = (a, b) => b.createdAt - a.createdAt;
    return { incoming: all.filter(c => c.toUid === me.uid).sort(s), outgoing: all.filter(c => c.fromUid === me.uid).sort(s) };
  },
  async respond(me, ci, accept) {
    const db = base(); const id = ci.id; const c = db.contactRequests[id];
    db.notifications[uid()] = { toUid: c.fromUid, fromUid: me.uid, kind: accept ? 'accepted' : 'declined', fromName: me.name, label: c.label || '', createdAt: Date.now(), read: false };
    c.status = accept ? 'accepted' : 'declined'; c.respondedAt = Date.now();
    if (accept) c._donor = { name: me.name, phone: me.phone, email: me.email };
    save(db);
  },
  // contact details of the OTHER person - only after acceptance
  async getReveal(me, c) {
    if (c.status !== 'accepted') return null;
    const raw = base().contactRequests[c.id];
    return c.toUid === me.uid ? raw._requester : raw._donor;
  }
};
