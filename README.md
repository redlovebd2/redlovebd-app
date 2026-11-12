# RedLoveBD – Android অ্যাপ (Play Store-এর জন্য প্রস্তুত)

ওয়েবসাইটের মতোই: হোম, ডোনার খুঁজুন, ডোনার রেজিস্ট্রেশন, রক্তের অনুরোধ, অ্যাকাউন্ট ও যোগাযোগের অনুরোধ (গ্রহণের পরেই ফোন নম্বর দেখা যায়), বাংলা/English, অ্যাকাউন্ট মুছে ফেলা।

## ধাপ ১ – Firebase (বাধ্যতামূলক, ১০ মিনিট)
1. https://console.firebase.google.com → **Add project**।
2. **Build → Authentication → Sign-in method → Email/Password** চালু করুন।
3. **Build → Firestore Database → Create database** (Production mode, `asia-south1` বা কাছের অঞ্চল)।
4. Firestore → **Rules** ট্যাব → `firestore.rules`-এর লেখা পেস্ট করে **Publish**।
5. Project settings → **Your apps → Web (</>)** → অ্যাপ রেজিস্টার করে config কপি করুন → `src/firebase-config.js`-এ বসান।
6. (ঐচ্ছিক, প্রস্তাবিত) Firebase-এ Android অ্যাপও যোগ করুন: package `com.redlovebd.app`।

## ধাপ ২ – GitHub-এ আপলোড
নতুন repository খুলে এই ফোল্ডারের সব ফাইল push করুন (`.github` ফোল্ডারসহ)।

## ধাপ ৩ – প্রাইভেসি পলিসি পেজ চালু (Play Store-এ লাগবে)
1. `site/privacy.html` ও `site/delete-account.html`-এ `redlovebd2@gmail.com` বদলে আপনার ইমেইল দিন।
2. GitHub → Settings → **Pages → Source: GitHub Actions**।
3. Actions → **Publish privacy policy site** চালান। লিংক হবে `https://<ইউজারনেম>.github.io/<repo>/privacy.html`।
4. `src/main.js`-এর `PRIVACY_URL` লাইনে ওই লিংক বসান।

## ধাপ ৪ – Signing key (একবারই; **ফাইলটি হারাবেন না**)
কম্পিউটারে (Java থাকলে) চালান:
```
keytool -genkeypair -v -keystore redlovebd.jks -keyalg RSA -keysize 2048 -validity 10000 -alias redlovebd
```
তারপর `redlovebd.jks`-কে base64 করুন:
- Mac/Linux: `base64 -i redlovebd.jks | tr -d '\n'`
- Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("redlovebd.jks"))`

GitHub → Settings → Secrets and variables → Actions → **New repository secret**:
`KEYSTORE_BASE64` (উপরের লেখা), `KEYSTORE_PASSWORD`, `KEY_ALIAS` (`redlovebd`), `KEY_PASSWORD`।
`redlovebd.jks` ও পাসওয়ার্ড অন্তত দুই জায়গায় নিরাপদে রাখুন।

## ধাপ ৫ – Build
Actions → **Build Android** → Run workflow। শেষে Artifacts:
- **RedLoveBD-debug-apk** → ফোনে ইন্সটল করে টেস্ট করুন (বা Android Studio-তে চালান)।
- **RedLoveBD-PlayStore-AAB** → এটিই Play Console-এ আপলোড হবে।
প্রতিবার run নম্বরই versionCode হয়, তাই আপডেট দিতে শুধু আবার run করুন।

## ধাপ ৬ – Play Console
https://play.google.com/console → ডেভেলপার অ্যাকাউন্ট ($25 এককালীন) → Create app → `store/LISTING.md` দেখে সব ঘর পূরণ → Production (বা আগে Closed/Internal testing) → AAB আপলোড।
নতুন ব্যক্তিগত অ্যাকাউন্টে প্রকাশের আগে ন্যূনতম টেস্টার ও সময়ের শর্ত থাকতে পারে – Console-এ দেখে নিন।
**Play App Signing** চালু রাখুন (ডিফল্ট)।

## Android Studio-তে পরীক্ষা (ঐচ্ছিক)
```
npm install
npx vite build
npx cap add android
npx capacitor-assets generate --android --assetPath assets
npx cap sync android
npx cap open android
```

## গোপনীয়তা
- পাবলিক তালিকায় শুধু নাম, গ্রুপ, জেলা/উপজেলা; ফোন/ইমেইল নয়।
- ফোন কেবল তখনই দুই পক্ষ দেখে যখন প্রাপক অনুরোধ **গ্রহণ** করেন (Firestore rules দিয়ে বাধ্য করা)।

## এখনো নেই
Push notification, অ্যাডমিন প্যানেল, সব উপজেলার ড্রপডাউন।


## অ্যাডমিন (শুধু আপনি বিজ্ঞাপন দিতে পারবেন)
১. অ্যাপে `monjurhossen9536@gmail.com` ইমেইল দিয়ে নিজের অ্যাকাউন্ট খুলুন (Sign up)।
২. Firebase Console → Authentication → Users → ওই ইমেইলের **User UID** কপি করুন।
৩. Firestore Database → Start collection → Collection ID: `admins` → Document ID: *(ওই UID পেস্ট)* → একটা ফিল্ড দিন `ok` = `true` → Save।
৪. Firestore → Rules ট্যাবে নতুন `firestore.rules` ফাইলের লেখা পেস্ট করে **Publish** করুন।
৫. এখন ওই ইমেইলে লগইন করলে হোম পেজে ডোনারদের আগের ফাঁকা জায়গায় "অ্যাডমিন: বিজ্ঞাপন" বক্স আসবে। অন্য কেউ এটা দেখবে না, Rules-ও অন্যদের লিখতে দেবে না।

## লাইভ চ্যাট
মেসেজ ২ মিনিট পর নিজে মুছে যায়। (ঐচ্ছিক) Firestore → TTL → collection group `messages`, field `expireAt` দিলে বাদ পড়া মেসেজও সার্ভার নিজে মুছবে।
