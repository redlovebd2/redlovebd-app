import './styles.css';
import { loadBackend } from './backend/index.js';
import { makeT } from './i18n.js';
import { GROUPS, DISTRICTS, districtName, isAvailable } from './data.js';

const PRIVACY_URL = 'https://redlovebd2.github.io/redlovebd-app/privacy.html'; 
const S = {
  tab: 'home', lang: localStorage.getItem('rl_lang') || 'bn', user: null, authMode: 'login',
  filters: { group: '', district: '', upazila: '' }, donors: null, requests: null, myDonor: null,
  contacts: null, reveals: {}, counts: { donors: 0, requests: 0 }, modal: null, toast: '', busy: false
};
let B, t = makeT(S.lang), toastTimer;
const $app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const digits = { '০':0,'১':1,'২':2,'৩':3,'৪':4,'৫':5,'৬':6,'৭':7,'৮':8,'৯':9 };
const normPhone = (p) => p.replace(/[০-৯]/g, d => digits[d]).replace(/[\s-]/g, '');
const validPhone = (p) => /^(\+?88)?01[3-9]\d{8}$/.test(normPhone(p));
const fmtDate = (ts) => new Date(ts).toLocaleString(S.lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

function toast(msg) { S.toast = msg; render(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { S.toast = ''; render(); }, 2600); }
function errMsg(e) {
  const c = (e && (e.code || e.message)) || '';
  if (/bad-credentials|invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)) return t('badCred');
  if (/email-exists|email-already-in-use/.test(c)) return t('emailExists');
  if (/already-sent/.test(c)) return t('already');
  if (/weak-password/.test(c)) return t('pw8');
  return t('error');
}
const go = (tab) => { S.tab = tab; render(); window.scrollTo(0, 0); if (tab === 'request') loadRequests(); if (tab === 'account') loadContacts(); if (tab === 'home') loadCounts(); if (tab === 'donate') loadMyDonor(); };

/* ---------- data loaders ---------- */
async function loadCounts() { try { S.counts = await B.counts(); render(); } catch {} }
async function loadRequests() { try { S.requests = await B.listBloodRequests(); render(); } catch { toast(t('error')); } }
async function loadMyDonor() { if (!S.user) return; try { S.myDonor = await B.getMyDonor(S.user.uid); render(); } catch {} }
async function loadContacts() {
  if (!S.user) return;
  try {
    S.contacts = await B.listContacts(S.user);
    S.reveals = {};
    for (const c of [...S.contacts.incoming, ...S.contacts.outgoing]) {
      if (c.status === 'accepted') { try { S.reveals[c.id] = await B.getReveal(S.user, c); } catch {} }
    }
    render();
  } catch { toast(t('error')); }
}
async function search() {
  S.busy = true; render();
  try { S.donors = await B.listDonors(S.filters); } catch { toast(t('error')); }
  S.busy = false; render();
}

/* ---------- views ---------- */
const opts = (list, sel, ph) => `<option value="">${esc(ph)}</option>` + list.map(([v, l]) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(l)}</option>`).join('');
const groupOpts = (sel, ph) => opts(GROUPS.map(g => [g, g]), sel, ph);
const distOpts = (sel, ph) => opts(DISTRICTS.map(d => [d[0], S.lang === 'bn' ? d[1] : d[0]]), sel, ph);

const vHome = () => `
  <div class="card hero"><h1>🩸 ${t('heroTitle')}</h1><p>${t('heroSub')}</p>
    <div class="row"><button class="btn light" data-go="find">${t('findDonors')} →</button><button class="btn sec" style="color:#fff;border-color:#fff;background:transparent" data-go="donate">${t('becomeDonor')} →</button></div></div>
  <div class="card"><div class="stats">
    <div class="stat"><b>${S.counts.donors}</b><span>${t('statDonors')}</span></div>
    <div class="stat"><b>${S.counts.requests}</b><span>${t('statReq')}</span></div>
    <div class="stat"><b>8</b><span>${t('statGroups')}</span></div>
    <div class="stat"><b>24/7</b><span>${t('statSupport')}</span></div></div></div>
  <div class="card steps"><h2>${t('how')}</h2>
    <div><i>1</i><p style="margin:0"><b>${t('how1')}</b><br><span class="small">${t('how1d')}</span></p></div>
    <div><i>2</i><p style="margin:0"><b>${t('how2')}</b><br><span class="small">${t('how2d')}</span></p></div>
    <div><i>3</i><p style="margin:0"><b>${t('how3')}</b><br><span class="small">${t('how3d')}</span></p></div></div>
  <div class="card"><p class="small" style="margin:0">⚕️ ${t('disclaimer')}</p></div>
  <p class="small" style="text-align:center">❤️ ${t('about')}</p>`;

const donorCard = (d) => {
  const av = isAvailable(d.lastDonation);
  return `<div class="card item"><div class="badge">${esc(d.group)}</div><div class="body">
    <h3>${esc(d.name)}</h3>
    <div class="meta">📍 ${esc(districtName(d.district, S.lang))}${d.upazila ? ', ' + esc(d.upazila) : ''}</div>
    <div><span class="tag ${av ? 'ok' : 'warn'}">${av ? t('available') : t('notAvailable')}</span></div>
    <div style="margin-top:8px"><button class="btn sm" data-contact-donor="${esc(d.uid)}">${t('contactReq')}</button></div></div></div>`;
};
const vFind = () => `
  <div class="card"><h2>🔎 ${t('findDonors')}</h2>
    <label>${t('bloodGroup')}</label><select data-filter="group">${groupOpts(S.filters.group, t('allGroups'))}</select>
    <label>${t('district')}</label><select data-filter="district">${distOpts(S.filters.district, t('allDistricts'))}</select>
    <label>${t('upazila')}</label><input data-filter="upazila" value="${esc(S.filters.upazila)}" />
    <div style="margin-top:14px"><button class="btn" data-search ${S.busy ? 'disabled' : ''}>${S.busy ? t('loading') : t('search')}</button></div></div>
  ${S.donors ? `<h2>${t('results')}: ${S.donors.length} ${t('persons')}</h2>` + (S.donors.length ? S.donors.map(donorCard).join('') : `<div class="card">${t('noResults')}</div>`) : ''}
  <p class="small">🔒 ${t('privacy')}</p>`;

const needLogin = () => `<div class="card"><p>${t('loginFirst')}</p><button class="btn" data-go="account">${t('login')} / ${t('newAccount')}</button></div>`;

const vDonate = () => {
  if (!S.user) return needLogin();
  const d = S.myDonor;
  return `<div class="card"><h2>🩸 ${t('donorReg')}</h2>
    ${d ? `<div class="reveal">✅ ${t('myDonorProfile')}: <b>${esc(d.group)}</b></div>` : ''}
    <form data-form="donor">
      <label>${t('fullName')}</label><input name="name" required value="${esc(d?.name || S.user.name)}" />
      <label>${t('bloodGroup')}</label><select name="group" required>${groupOpts(d?.group || '', t('chooseGroup'))}</select>
      <label>${t('district')}</label><select name="district" required>${distOpts(d?.district || '', t('chooseDistrict'))}</select>
      <label>${t('upazila')}</label><input name="upazila" required value="${esc(d?.upazila || '')}" />
      <label>${t('lastDonation')}</label><input type="date" name="lastDonation" max="${new Date().toISOString().slice(0, 10)}" value="${esc(d?.lastDonation || '')}" />
      <label class="chk"><input type="checkbox" name="consent" ${d ? 'checked' : ''} /><span>${t('consentDonor')}</span></label>
      <button class="btn" type="submit">${t('submitDonor')}</button>
    </form>
    ${d ? `<button class="link" data-remove-donor>${t('removeDonor')}</button>` : ''}
    <p class="small">🔒 ${t('privacy')}</p></div>`;
};

const reqCard = (r) => `<div class="card item"><div class="badge">${esc(r.group)}</div><div class="body">
  <h3>${esc(r.patient || '')} <span class="tag red">${esc(r.bags)} ${t('bags')}</span></h3>
  <div class="meta">🏥 ${esc(r.hospital)}</div>
  <div class="meta">📍 ${esc(districtName(r.district, S.lang))}</div>
  <div class="meta">🕒 ${esc(r.neededAt ? fmtDate(r.neededAt) : '')}</div>
  ${r.info ? `<div class="meta">${esc(r.info)}</div>` : ''}
  <div style="margin-top:8px">${S.user && r.uid === S.user.uid
    ? `<span class="tag gray">${t('mine')}</span> <button class="btn sm gray" data-close-req="${esc(r.id)}">${t('closeReq')}</button>`
    : `<button class="btn sm" data-contact-req="${esc(r.id)}">${t('canHelp')}</button>`}</div></div></div>`;

const vRequest = () => `
  <h2>🆘 ${t('activeReq')}</h2>
  ${S.requests === null ? `<div class="card">${t('loading')}</div>` : S.requests.length ? S.requests.map(reqCard).join('') : `<div class="card">${t('noReq')}</div>`}
  <div class="card" style="margin-top:16px"><h2>➕ ${t('postReq')}</h2>
  ${!S.user ? `<p>${t('loginFirst')}</p><button class="btn" data-go="account">${t('login')} / ${t('newAccount')}</button>` : `
    <form data-form="request">
      <label>${t('patient')}</label><input name="patient" required value="${esc(S.user.name)}" />
      <div class="row"><div><label>${t('bloodGroup')}</label><select name="group" required>${groupOpts('', t('chooseGroup'))}</select></div>
      <div><label>${t('bags')}</label><select name="bags"><option>1</option><option>2</option><option>3</option><option>4+</option></select></div></div>
      <label>${t('hospital')}</label><input name="hospital" required />
      <label>${t('district')}</label><select name="district" required>${distOpts('', t('chooseDistrict'))}</select>
      <label>${t('neededAt')}</label><input type="datetime-local" name="neededAt" required />
      <label>${t('info')}</label><textarea name="info" rows="2"></textarea>
      <label class="chk"><input type="checkbox" name="consent" /><span>${t('consentReq')}</span></label>
      <button class="btn" type="submit">${t('submitReq')}</button>
    </form>`}</div>`;

const statusTag = (s) => `<span class="tag ${s === 'accepted' ? 'ok' : s === 'declined' ? 'gray' : 'warn'}">${t(s)}</span>`;
const revealBox = (c) => {
  const r = S.reveals[c.id];
  if (c.status !== 'accepted' || !r) return '';
  return `<div class="reveal"><b>${t('contactInfo')}</b><br>👤 ${esc(r.name)}<br>📞 <a href="tel:${esc(normPhone(r.phone))}">${esc(r.phone)}</a>${r.email ? `<br>✉️ ${esc(r.email)}` : ''}
    <div style="margin-top:8px"><a class="btn sm ok" style="display:inline-block;text-decoration:none" href="tel:${esc(normPhone(r.phone))}">📞 ${t('call')}</a></div></div>`;
};
const contactCard = (c, incoming) => `<div class="card">
  <div><b>${incoming ? t('from') + ': ' + esc(c.fromName) : t('to') + ': ' + esc(c.toName)}</b> ${statusTag(c.status)}</div>
  <div class="meta">${c.label ? '🩸 ' + esc(c.label) + ' · ' : ''}${fmtDate(c.createdAt)}</div>
  ${c.message ? `<div class="meta">“${esc(c.message)}”</div>` : ''}
  ${incoming && c.status === 'pending' ? `<div class="row" style="margin-top:8px"><button class="btn sm ok" data-respond="${esc(c.id)}:1">${t('accept')}</button><button class="btn sm gray" data-respond="${esc(c.id)}:0">${t('decline')}</button></div>` : ''}
  ${!incoming && c.status === 'pending' ? `<div class="small">${t('waiting')}</div>` : ''}
  ${revealBox(c)}</div>`;

const vAccount = () => {
  if (!S.user) {
    const signup = S.authMode === 'signup';
    return `<div class="card"><h2>${signup ? t('newAccount') : t('login')}</h2>
      <form data-form="${signup ? 'signup' : 'login'}">
        ${signup ? `<label>${t('fullName')}</label><input name="name" required autocomplete="name" />
        <label>${t('phone')}</label><input name="phone" type="tel" required autocomplete="tel" placeholder="01XXXXXXXXX" />` : ''}
        <label>${t('email')}</label><input name="email" type="email" required autocomplete="email" />
        <label>${t('password')}</label><input name="password" type="password" required minlength="${signup ? 8 : 1}" autocomplete="${signup ? 'new-password' : 'current-password'}" />
        ${signup ? `<label class="chk"><input type="checkbox" name="consent" /><span>${t('consentAcc')}</span></label>` : '<div style="height:12px"></div>'}
        <button class="btn" type="submit">${signup ? t('createAccount') : t('login')}</button>
      </form>
      <button class="link" data-auth-mode="${signup ? 'login' : 'signup'}">${signup ? t('haveAccount') : t('noAccount')}</button></div><div><a class="link" href="${PRIVACY_URL}" target="_blank" rel="noopener">${t('privacyLink')}</a></div>`;
  }
  const c = S.contacts;
  return `<div class="card"><h2>👤 ${t('hello')}, ${esc(S.user.name)}</h2><div class="meta">${esc(S.user.email)}</div></div>
    <div class="row" style="margin-bottom:8px"><h2 style="flex:1;margin:0">🔔 ${t('incoming')}</h2><button class="btn sm sec" data-refresh>${t('refresh')}</button></div>
    ${!c ? `<div class="card">${t('loading')}</div>` : c.incoming.length ? c.incoming.map(x => contactCard(x, true)).join('') : `<div class="card small">${t('none')}</div>`}
    <h2>📤 ${t('outgoing')}</h2>
    ${!c ? '' : c.outgoing.length ? c.outgoing.map(x => contactCard(x, false)).join('') : `<div class="card small">${t('none')}</div>`}
    <div class="card"><h2>✏️ ${t('editProfile')}</h2>
      <form data-form="profile"><label>${t('fullName')}</label><input name="name" required value="${esc(S.user.name)}" />
        <label>${t('phone')}</label><input name="phone" type="tel" required value="${esc(S.user.phone)}" />
        <div style="height:12px"></div><button class="btn" type="submit">${t('save')}</button></form></div>
    <button class="btn sec" data-logout>${t('logout')}</button>
    <div style="text-align:center;margin-top:8px"><button class="link" style="color:#8b0000" data-delete-account>🗑 ${t('deleteAccount')}</button></div>
    <div style="text-align:center"><a class="link" href="${PRIVACY_URL}" target="_blank" rel="noopener">${t('privacyLink')}</a></div>`;
};

const vModal = () => !S.modal ? '' : S.modal.del ? `<div class="modal" data-modal-bg><div class="sheet">
  <h2>⚠️ ${t('deleteAccount')}</h2><p class="small">${t('deleteWarn')}</p>
  <label>${t('confirmPw')}</label><input id="delpw" type="password" autocomplete="current-password" />
  <div class="row" style="margin-top:14px"><button class="btn gray" data-modal-close>${t('cancel')}</button><button class="btn" style="background:#8b0000" data-del-confirm>${t('deleteAccount')}</button></div></div></div>` : vModalContact();
function vModalContact() { return `<div class="modal" data-modal-bg><div class="sheet">
  <h2>${t('contactReq')}: ${esc(S.modal.toName)}</h2>
  <label>${t('msgOpt')}</label><textarea id="msg" rows="3" placeholder="${esc(t('msgPh'))}"></textarea>
  <div class="row" style="margin-top:14px"><button class="btn gray" data-modal-close>${t('cancel')}</button><button class="btn" data-modal-send>${t('sendReq')}</button></div></div></div>`; }

const TABS = [['home', '🏠', 'home'], ['find', '🔎', 'find'], ['request', '🆘', 'request'], ['donate', '🩸', 'donate'], ['account', '👤', 'account']];
function render() {
  const view = { home: vHome, find: vFind, request: vRequest, donate: vDonate, account: vAccount }[S.tab]();
  const active = document.activeElement; const keep = active && active.id === 'msg';
  $app.innerHTML = `<header><div class="logo">❤️ RedLove<small>BD</small></div>
      <button class="lang" data-lang>${S.lang === 'bn' ? 'EN' : 'বাংলা'}</button></header>
    <main>${B.mode === 'demo' ? `<div class="banner">⚠️ ${t('demoBanner')}</div>` : ''}${view}</main>
    <nav>${TABS.map(([id, ic, k]) => `<button class="${S.tab === id ? 'on' : ''}" data-go="${id}"><span>${ic}</span>${t(k)}</button>`).join('')}</nav>
    ${vModal()}${S.toast ? `<div class="toast">${esc(S.toast)}</div>` : ''}`;
  if (keep) document.getElementById('msg')?.focus();
}

/* ---------- events ---------- */
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-go],[data-lang],[data-search],[data-auth-mode],[data-logout],[data-refresh],[data-contact-donor],[data-contact-req],[data-modal-close],[data-modal-send],[data-respond],[data-close-req],[data-remove-donor],[data-delete-account],[data-del-confirm]');
  if (!el) return;
  const d = el.dataset;
  try {
    if (d.go) return go(d.go);
    if (el.hasAttribute('data-lang')) { S.lang = S.lang === 'bn' ? 'en' : 'bn'; localStorage.setItem('rl_lang', S.lang); t = makeT(S.lang); document.documentElement.lang = S.lang; return render(); }
    if (el.hasAttribute('data-search')) return search();
    if (d.authMode) { S.authMode = d.authMode; return render(); }
    if (el.hasAttribute('data-logout')) { await B.signOut(); S.authMode = 'login'; S.contacts = null; S.myDonor = null; return go('home'); }
    if (el.hasAttribute('data-refresh')) return loadContacts();
    if (d.contactDonor || d.contactReq) {
      if (!S.user) { toast(t('loginFirst')); return go('account'); }
      if (d.contactDonor) {
        if (d.contactDonor === S.user.uid) return toast(t('cantSelf'));
        const dn = S.donors.find(x => x.uid === d.contactDonor);
        S.modal = { toUid: dn.uid, toName: dn.name, kind: 'donor', label: dn.group };
      } else {
        const r = S.requests.find(x => x.id === d.contactReq);
        S.modal = { toUid: r.uid, toName: r.patient || r.hospital, kind: 'request', label: r.group };
      }
      return render();
    }
    if (el.hasAttribute('data-modal-close')) { S.modal = null; return render(); }
    if (el.hasAttribute('data-modal-send')) {
      const m = S.modal; const message = document.getElementById('msg').value.trim();
      S.modal = null; await B.sendContact(S.user, { ...m, message }); toast(t('sent')); return;
    }
    if (el.hasAttribute('data-delete-account')) { S.modal = { del: true }; return render(); }
    if (el.hasAttribute('data-del-confirm')) {
      const pw = document.getElementById('delpw').value; if (!pw) return;
      await B.deleteAccount(S.user.uid, pw); S.modal = null; S.user = null; S.contacts = null; S.myDonor = null; S.authMode = 'login'; go('home'); return toast(t('deleted'));
    }
    if (d.respond) { const [id, a] = d.respond.split(':'); await B.respond(S.user, id, a === '1'); return loadContacts(); }
    if (d.closeReq) { await B.closeBloodRequest(d.closeReq); toast(t('closed')); return loadRequests(); }
    if (el.hasAttribute('data-remove-donor')) { await B.deleteDonor(S.user.uid); S.myDonor = null; toast(t('removed')); return render(); }
  } catch (err) { S.modal = null; toast(errMsg(err)); }
});
document.addEventListener('change', (e) => { const f = e.target.dataset?.filter; if (f) S.filters[f] = e.target.value; });
document.addEventListener('input', (e) => { if (e.target.dataset?.filter === 'upazila') S.filters.upazila = e.target.value; });
document.addEventListener('click', (e) => { if (e.target.matches('[data-modal-bg]')) { S.modal = null; render(); } });

document.addEventListener('submit', async (e) => {
  const form = e.target.closest('form[data-form]'); if (!form) return;
  e.preventDefault();
  const kind = form.dataset.form; const f = Object.fromEntries(new FormData(form).entries());
  const needConsent = ['signup', 'donor', 'request'].includes(kind);
  if (needConsent && !f.consent) return toast(t('consentNeeded'));
  if (f.phone !== undefined && !validPhone(f.phone)) return toast(t('phoneInvalid'));
  try {
    if (kind === 'signup') {
      if ((f.password || '').length < 8) return toast(t('pw8'));
      await B.signUp({ name: f.name.trim(), phone: normPhone(f.phone), email: f.email, password: f.password }); go('account');
    } else if (kind === 'login') { await B.signIn(f.email, f.password); go('account'); }
    else if (kind === 'profile') {
      await B.updateProfile(S.user.uid, { name: f.name.trim(), phone: normPhone(f.phone) });
      S.user = { ...S.user, name: f.name.trim(), phone: normPhone(f.phone) }; toast(t('saved'));
    } else if (kind === 'donor') {
      const data = { name: f.name.trim(), group: f.group, district: f.district, upazila: f.upazila.trim(), lastDonation: f.lastDonation || '' };
      await B.saveDonor(S.user.uid, data); S.myDonor = data; toast(t('saved'));
    } else if (kind === 'request') {
      await B.createBloodRequest(S.user.uid, { patient: f.patient.trim(), group: f.group, bags: f.bags, hospital: f.hospital.trim(), district: f.district, neededAt: new Date(f.neededAt).getTime(), info: (f.info || '').trim() });
      toast(t('saved')); loadRequests();
    }
  } catch (err) { toast(errMsg(err)); }
});

/* ---------- boot ---------- */
(async () => {
  B = await loadBackend();
  document.documentElement.lang = S.lang;
  B.onAuth((u) => { const first = S.user === null && u; S.user = u; if (first || !u) { S.contacts = null; } render(); if (u && S.tab === 'account') loadContacts(); });
  render(); loadCounts();
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.setBackgroundColor({ color: '#c91f3a' }); await StatusBar.setStyle({ style: 'DARK' });
  } catch {}
})();
