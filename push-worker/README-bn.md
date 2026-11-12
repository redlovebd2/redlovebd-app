# পুশ নোটিফিকেশন সেটআপ (অ্যাপ বন্ধ থাকলেও নোটিফিকেশন)

ক্রম মেনে করুন। **ধাপ ১ আর ২ শেষ না করে ধাপ ৪ করবেন না** (`src/push-config.js`-এ লিংক বসাবেন না), নইলে অ্যাপ ক্র্যাশ করতে পারে।

## ধাপ ১: Firebase-এ Android অ্যাপ যোগ + কী নামানো
1. Firebase Console → `redlovebd-123` → ওপরে ⚙️ **Project settings** → **General** ট্যাব।
2. নিচে "Your apps"-এ **Add app → Android (🤖)** চাপুন।
3. **Android package name:** `com.redlovebd.app` (হুবহু)। Nickname: RedLoveBD। SHA-1 এখন লাগবে না। **Register app** চাপুন।
4. **Download google-services.json** চাপুন। ফাইলটা নামান। বাকি ধাপ (Next, Continue) এড়িয়ে যান।
5. এই `google-services.json` GitHub রিপোর **একদম বাইরের ফোল্ডারে** (`package.json`-এর পাশে) আপলোড করুন।
6. **Project settings → Cloud Messaging** ট্যাবে "Firebase Cloud Messaging API (V1)" **Enabled** আছে কিনা দেখুন। না থাকলে Enable করুন।
7. **Project settings → Service accounts** ট্যাব → **Generate new private key → Generate key**। একটা `.json` ফাইল নামবে। **এটা গোপন রাখুন**: GitHub-এ তুলবেন না, কাউকে পাঠাবেন না।

## ধাপ ২: Cloudflare Worker বানানো
1. dash.cloudflare.com → **Workers & Pages → Create → Create Worker**।
2. নাম দিন `redlovebd-push` → **Deploy**।
3. **Edit code** চাপুন। আগের সব লেখা মুছে `push-worker/worker.js` ফাইলের পুরো লেখা পেস্ট করুন → **Deploy**।
4. Worker পেজে **Settings → Variables and Secrets → Add** দিয়ে দুটো যোগ করুন:
   - Type **Text**, Name `PROJECT_ID`, Value `redlovebd-123`
   - Type **Secret**, Name `SA_JSON`, Value: ধাপ ১-এর `.json` ফাইলটা নোটপ্যাডে খুলে **পুরো লেখা** কপি করে পেস্ট করুন
5. **Deploy** চাপুন। ওপরের লিংকটা (`https://redlovebd-push.xxxx.workers.dev`) কপি করে রাখুন।

## ধাপ ৩: Firebase Rules আবার Publish
`firestore.rules` ফাইলের নতুন লেখা Firestore → Rules ট্যাবে পেস্ট করে **Publish** করুন (ফোনের টোকেন রাখার নিয়ম যোগ হয়েছে)।

## ধাপ ৪: অ্যাপে লিংক বসানো
GitHub রিপোতে `src/push-config.js` খুলে ✏️ Edit করুন। এই লাইনটা বদলান:
```
export const PUSH_URL = 'https://redlovebd-push.xxxx.workers.dev';
```
(আপনার লিংক বসান, শেষে `/` দেবেন না) → **Commit changes**।

নতুন zip-এর বাকি সব ফাইলও GitHub-এ আপলোড করুন, তারপর Actions-এ বিল্ড শেষ হলে পুরনো অ্যাপ আনইনস্টল করে নতুন APK ইনস্টল করুন।

## ধাপ ৫: টেস্ট
1. দুটো ফোনে দুজন লগইন করুন। প্রথমবার "নোটিফিকেশন পাঠাতে দিন" জিজ্ঞেস করলে **Allow** দিন।
2. ফোন ২-এর অ্যাপ সম্পূর্ণ বন্ধ করুন (Recent apps থেকে সোয়াইপ করে)।
3. ফোন ১ থেকে ফোন ২-এর ডোনারকে "যোগাযোগের অনুরোধ" পাঠান।
4. ফোন ২-তে কয়েক সেকেন্ডে নোটিফিকেশন আসবে। ট্যাপ করলে অ্যাপ খুলে 🔔 লিস্ট দেখাবে।

## সমস্যা হলে
- **নোটিফিকেশন আসছে না:** Settings → Apps → RedLoveBD → Notifications চালু আছে কিনা দেখুন। Xiaomi/Oppo/Vivo/Samsung-এ ব্যাটারি সেটিংসে অ্যাপটাকে "No restrictions" ও Auto-start দিন।
- **Worker ঠিক আছে কিনা:** Cloudflare Worker পেজের **Logs/Observability** ট্যাবে দেখুন। `unknown key`/`forbidden` ধরনের লেখা থাকলে আমাকে পাঠান।
- ধাপ ১-এ `google-services.json` না দিয়ে লিংক বসালে বিল্ড ঠিক হলেও পুশ চলবে না।
