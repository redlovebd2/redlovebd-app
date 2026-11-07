# Play Console-এ যা কপি-পেস্ট করবেন

## App details
- **App name (30):** RedLoveBD – রক্তদাতা খুঁজুন
- **Default language:** Bangla (bn-BD) · চাইলে English (en-US) যোগ করুন
- **App or game:** App · **Free**
- **Category:** Medical (বা Health & Fitness) · **Tags:** Blood donation
- **Contact email / Website:** আপনার ইমেইল · প্রাইভেসি পলিসির লিংক (GitHub Pages)

## Short description (সর্বোচ্চ ৮০ অক্ষর)
বাংলাদেশে রক্তদাতা খুঁজুন, রক্তের অনুরোধ দিন – নিরাপদে, বিনামূল্যে।

## Full description
RedLoveBD বাংলাদেশের রক্তদাতা ও রক্তপ্রার্থীদের মধ্যে নিরাপদ সংযোগ ঘটানোর একটি স্বেচ্ছাসেবামূলক অ্যাপ। রক্ত দিন, জীবন বাঁচান।

🩸 ডোনার খুঁজুন – রক্তের গ্রুপ, জেলা ও উপজেলা দিয়ে খুঁজুন (অ্যাকাউন্ট ছাড়াই)
🩸 ডোনার হোন – নিজের রক্তের গ্রুপ ও এলাকা দিয়ে নিবন্ধন করুন, সর্বশেষ রক্তদানের তারিখ থেকে অ্যাপ বলে দেয় আপনি দিতে পারবেন কি না
🆘 রক্তের অনুরোধ – হাসপাতাল, ব্যাগ সংখ্যা ও সময় দিয়ে জরুরি অনুরোধ দিন
🔒 নিরাপদ যোগাযোগ – ফোন নম্বর কখনো প্রকাশ্য তালিকায় দেখানো হয় না। অনুরোধ গ্রহণ করলেই কেবল দুজন একে অপরের নম্বর দেখতে পান
🌐 বাংলা ও English
🗑 অ্যাপ থেকেই যেকোনো সময় অ্যাকাউন্ট ও সব তথ্য মুছে ফেলা যায়

কীভাবে কাজ করে: ১) ডোনার খুঁজুন ২) যোগাযোগের অনুরোধ পাঠান ৩) হাসপাতালের নির্দেশনা মানুন।

⚠️ চিকিৎসা-সংক্রান্ত সতর্কতা: RedLoveBD হাসপাতাল, ব্লাড ব্যাংক বা চিকিৎসকের বিকল্প নয়। রক্তদানের যোগ্যতা ও রক্তের নিরাপত্তা চিকিৎসা কর্মীরা নির্ধারণ করবেন। জরুরি অবস্থায় হাসপাতালে যোগাযোগ করুন।

## Graphics (এই ফোল্ডারে তৈরি)
- App icon 512×512: `app-icon-512.png`
- Feature graphic 1024×500: `feature-graphic-1024x500.png`
- Phone screenshots (1080×1920): `screenshots/`  (স্ক্রিনশটের ডেটা নমুনা)
  → ইচ্ছা হলে Firebase চালু করার পর আসল ফোন থেকে নতুন স্ক্রিনশট নিন।

## App content ঘোষণা (Policy → App content)
- **Privacy policy:** GitHub Pages-এর `…/privacy.html` লিংক
- **Ads:** না
- **App access:** অ্যাপের কিছু অংশে লগইন লাগে → Reviewer-এর জন্য একটি টেস্ট অ্যাকাউন্ট (ইমেইল/পাসওয়ার্ড) লিখে দিন। আগে অ্যাপে এই অ্যাকাউন্ট খুলে রাখুন
- **Target audience:** ১৮+
- **Content rating:** প্রশ্নমালায় সৎভাবে উত্তর দিন (সহিংসতা/জুয়া ইত্যাদি নেই; ব্যবহারকারী-তৈরি কনটেন্ট: হ্যাঁ, যোগাযোগের অনুরোধ)
- **Health apps declaration:** ফর্মে "Other health / medical info (blood donation)" বাছুন; ডায়াগনসিস/চিকিৎসা পরামর্শ দেয় না, এটা উল্লেখ করুন
- **Data deletion:** অ্যাপের ভেতরে আছে + ওয়েব লিংক `…/delete-account.html`

## Data safety ফর্ম (উত্তর)
| তথ্য | সংগ্রহ | শেয়ার | কেন | ঐচ্ছিক? |
|---|---|---|---|---|
| Name | হ্যাঁ | না* | App functionality, Account management | না |
| Email address | হ্যাঁ | না | Account management | না |
| Phone number | হ্যাঁ | না* | App functionality (অনুরোধ গৃহীত হলে অন্য ব্যবহারকারীকে দেখানো হয়) | না |
| Approximate location / Address (জেলা, উপজেলা, ব্যবহারকারীর লেখা এলাকার নাম) | হ্যাঁ | না | App functionality | না |
| Health info (রক্তের গ্রুপ, সর্বশেষ রক্তদান) | হ্যাঁ | না | App functionality | রক্তদান তারিখ ঐচ্ছিক |
| Other user-generated content (রক্তের অনুরোধ, বার্তা) | হ্যাঁ | না | App functionality | হ্যাঁ |

*অন্য ব্যবহারকারী দেখতে পায় – ফর্মে "Shared" বলতে হবে কি না Play Console-এর সংজ্ঞা অনুযায়ী দেখুন: ব্যবহারকারীর নিজের নির্দেশে অন্য ব্যবহারকারীকে দেখানো সাধারণত "sharing with third party" নয়, তবে সন্দেহ থাকলে "Shared" দিন।
- Data is **encrypted in transit:** হ্যাঁ (HTTPS/Firebase)
- **Users can request data deletion:** হ্যাঁ
- Security practices-এ "Data collection and sharing is not required to comply with…" নয়; Firebase (Google) সার্ভিস প্রোভাইডার হিসেবে ব্যবহার হয়।
