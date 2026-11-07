export const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// [english key, bangla]
export const DISTRICTS = [
['Dhaka','ঢাকা'],['Gazipur','গাজীপুর'],['Narayanganj','নারায়ণগঞ্জ'],['Narsingdi','নরসিংদী'],['Munshiganj','মুন্সীগঞ্জ'],['Manikganj','মানিকগঞ্জ'],['Tangail','টাঙ্গাইল'],['Kishoreganj','কিশোরগঞ্জ'],['Faridpur','ফরিদপুর'],['Gopalganj','গোপালগঞ্জ'],['Madaripur','মাদারীপুর'],['Rajbari','রাজবাড়ী'],['Shariatpur','শরীয়তপুর'],
['Chattogram','চট্টগ্রাম'],["Cox's Bazar",'কক্সবাজার'],['Cumilla','কুমিল্লা'],['Feni','ফেনী'],['Brahmanbaria','ব্রাহ্মণবাড়িয়া'],['Noakhali','নোয়াখালী'],['Chandpur','চাঁদপুর'],['Lakshmipur','লক্ষ্মীপুর'],['Khagrachhari','খাগড়াছড়ি'],['Rangamati','রাঙ্গামাটি'],['Bandarban','বান্দরবান'],
['Rajshahi','রাজশাহী'],['Bogura','বগুড়া'],['Pabna','পাবনা'],['Sirajganj','সিরাজগঞ্জ'],['Natore','নাটোর'],['Naogaon','নওগাঁ'],['Chapainawabganj','চাঁপাইনবাবগঞ্জ'],['Joypurhat','জয়পুরহাট'],
['Khulna','খুলনা'],['Jashore','যশোর'],['Satkhira','সাতক্ষীরা'],['Bagerhat','বাগেরহাট'],['Kushtia','কুষ্টিয়া'],['Chuadanga','চুয়াডাঙ্গা'],['Meherpur','মেহেরপুর'],['Jhenaidah','ঝিনাইদহ'],['Magura','মাগুরা'],['Narail','নড়াইল'],
['Barishal','বরিশাল'],['Bhola','ভোলা'],['Patuakhali','পটুয়াখালী'],['Pirojpur','পিরোজপুর'],['Jhalokathi','ঝালকাঠি'],['Barguna','বরগুনা'],
['Sylhet','সিলেট'],['Moulvibazar','মৌলভীবাজার'],['Habiganj','হবিগঞ্জ'],['Sunamganj','সুনামগঞ্জ'],
['Rangpur','রংপুর'],['Dinajpur','দিনাজপুর'],['Kurigram','কুড়িগ্রাম'],['Gaibandha','গাইবান্ধা'],['Nilphamari','নীলফামারী'],['Lalmonirhat','লালমনিরহাট'],['Thakurgaon','ঠাকুরগাঁও'],['Panchagarh','পঞ্চগড়'],
['Mymensingh','ময়মনসিংহ'],['Jamalpur','জামালপুর'],['Netrokona','নেত্রকোণা'],['Sherpur','শেরপুর']
];
export const districtName = (key, lang) => {
  const d = DISTRICTS.find(x => x[0] === key);
  return d ? (lang === 'bn' ? d[1] : d[0]) : key;
};
// A donor can usually donate again 90+ days after the last donation.
export const isAvailable = (lastDonation) => {
  if (!lastDonation) return true;
  const days = (Date.now() - new Date(lastDonation).getTime()) / 86400000;
  return days >= 90;
};

/* ---------- Upazilas & city corporations (English|Bangla) ---------- */
const U = (s) => s.split(',');
const UPAZILA = {
  'Dhaka': U('Savar|সাভার,Dhamrai|ধামরাই,Keraniganj|কেরানীগঞ্জ,Nawabganj|নবাবগঞ্জ,Dohar|দোহার'),
  'Gazipur': U('Gazipur Sadar|গাজীপুর সদর,Kaliakair|কালিয়াকৈর,Kaliganj|কালীগঞ্জ,Kapasia|কাপাসিয়া,Sreepur|শ্রীপুর'),
  'Narayanganj': U('Narayanganj Sadar|নারায়ণগঞ্জ সদর,Araihazar|আড়াইহাজার,Bandar|বন্দর,Rupganj|রূপগঞ্জ,Sonargaon|সোনারগাঁও'),
  'Narsingdi': U('Narsingdi Sadar|নরসিংদী সদর,Belabo|বেলাবো,Monohardi|মনোহরদী,Palash|পলাশ,Raipura|রায়পুরা,Shibpur|শিবপুর'),
  'Munshiganj': U('Munshiganj Sadar|মুন্সীগঞ্জ সদর,Gazaria|গজারিয়া,Lohajang|লৌহজং,Sirajdikhan|সিরাজদিখান,Sreenagar|শ্রীনগর,Tongibari|টংগীবাড়ী'),
  'Manikganj': U('Manikganj Sadar|মানিকগঞ্জ সদর,Daulatpur|দৌলতপুর,Ghior|ঘিওর,Harirampur|হরিরামপুর,Saturia|সাটুরিয়া,Shivalaya|শিবালয়,Singair|সিংগাইর'),
  'Tangail': U('Tangail Sadar|টাঙ্গাইল সদর,Basail|বাসাইল,Bhuapur|ভূঞাপুর,Delduar|দেলদুয়ার,Dhanbari|ধনবাড়ী,Ghatail|ঘাটাইল,Gopalpur|গোপালপুর,Kalihati|কালিহাতী,Madhupur|মধুপুর,Mirzapur|মির্জাপুর,Nagarpur|নাগরপুর,Sakhipur|সখিপুর'),
  'Kishoreganj': U('Kishoreganj Sadar|কিশোরগঞ্জ সদর,Austagram|অষ্টগ্রাম,Bajitpur|বাজিতপুর,Bhairab|ভৈরব,Hossainpur|হোসেনপুর,Itna|ইটনা,Karimganj|করিমগঞ্জ,Katiadi|কটিয়াদী,Kuliarchar|কুলিয়ারচর,Mithamain|মিঠামইন,Nikli|নিকলী,Pakundia|পাকুন্দিয়া,Tarail|তাড়াইল'),
  'Faridpur': U('Faridpur Sadar|ফরিদপুর সদর,Alfadanga|আলফাডাঙ্গা,Bhanga|ভাঙ্গা,Boalmari|বোয়ালমারী,Charbhadrasan|চরভদ্রাসন,Madhukhali|মধুখালী,Nagarkanda|নগরকান্দা,Sadarpur|সদরপুর,Saltha|সালথা'),
  'Gopalganj': U('Gopalganj Sadar|গোপালগঞ্জ সদর,Kashiani|কাশিয়ানী,Kotalipara|কোটালীপাড়া,Muksudpur|মুকসুদপুর,Tungipara|টুঙ্গিপাড়া'),
  'Madaripur': U('Madaripur Sadar|মাদারীপুর সদর,Kalkini|কালকিনি,Rajoir|রাজৈর,Shibchar|শিবচর,Dasar|ডাসার'),
  'Rajbari': U('Rajbari Sadar|রাজবাড়ী সদর,Baliakandi|বালিয়াকান্দি,Goalandaghat|গোয়ালন্দ ঘাট,Kalukhali|কালুখালী,Pangsha|পাংশা'),
  'Shariatpur': U('Shariatpur Sadar|শরীয়তপুর সদর,Bhedarganj|ভেদরগঞ্জ,Damudya|ডামুড্যা,Gosairhat|গোসাইরহাট,Naria|নড়িয়া,Zajira|জাজিরা'),
  'Chattogram': U('Anwara|আনোয়ারা,Banshkhali|বাঁশখালী,Boalkhali|বোয়ালখালী,Chandanaish|চন্দনাইশ,Fatikchhari|ফটিকছড়ি,Hathazari|হাটহাজারী,Lohagara|লোহাগাড়া,Mirsharai|মীরসরাই,Patiya|পটিয়া,Rangunia|রাঙ্গুনিয়া,Raozan|রাউজান,Sandwip|সন্দ্বীপ,Satkania|সাতকানিয়া,Sitakunda|সীতাকুণ্ড'),
  "Cox's Bazar": U("Cox's Bazar Sadar|কক্সবাজার সদর,Chakaria|চকরিয়া,Kutubdia|কুতুবদিয়া,Maheshkhali|মহেশখালী,Pekua|পেকুয়া,Ramu|রামু,Teknaf|টেকনাফ,Ukhia|উখিয়া"),
  'Cumilla': U('Adarsha Sadar|আদর্শ সদর,Barura|বরুড়া,Brahmanpara|ব্রাহ্মণপাড়া,Burichang|বুড়িচং,Chandina|চান্দিনা,Chauddagram|চৌদ্দগ্রাম,Daudkandi|দাউদকান্দি,Debidwar|দেবিদ্বার,Homna|হোমনা,Laksam|লাকসাম,Lalmai|লালমাই,Meghna|মেঘনা,Monoharganj|মনোহরগঞ্জ,Muradnagar|মুরাদনগর,Nangalkot|নাঙ্গলকোট,Cumilla Sadar Dakshin|কুমিল্লা সদর দক্ষিণ,Titas|তিতাস'),
  'Feni': U('Feni Sadar|ফেনী সদর,Chhagalnaiya|ছাগলনাইয়া,Daganbhuiyan|দাগনভূঞা,Fulgazi|ফুলগাজী,Parshuram|পরশুরাম,Sonagazi|সোনাগাজী'),
  'Brahmanbaria': U('Brahmanbaria Sadar|ব্রাহ্মণবাড়িয়া সদর,Akhaura|আখাউড়া,Ashuganj|আশুগঞ্জ,Bancharampur|বাঞ্ছারামপুর,Bijoynagar|বিজয়নগর,Kasba|কসবা,Nabinagar|নবীনগর,Nasirnagar|নাসিরনগর,Sarail|সরাইল'),
  'Noakhali': U('Noakhali Sadar|নোয়াখালী সদর,Begumganj|বেগমগঞ্জ,Chatkhil|চাটখিল,Companiganj|কোম্পানীগঞ্জ,Hatiya|হাতিয়া,Kabirhat|কবিরহাট,Senbagh|সেনবাগ,Sonaimuri|সোনাইমুড়ী,Subarnachar|সুবর্ণচর'),
  'Chandpur': U('Chandpur Sadar|চাঁদপুর সদর,Faridganj|ফরিদগঞ্জ,Haimchar|হাইমচর,Haziganj|হাজীগঞ্জ,Kachua|কচুয়া,Matlab Dakshin|মতলব দক্ষিণ,Matlab Uttar|মতলব উত্তর,Shahrasti|শাহরাস্তি'),
  'Lakshmipur': U('Lakshmipur Sadar|লক্ষ্মীপুর সদর,Kamalnagar|কমলনগর,Raipur|রায়পুর,Ramganj|রামগঞ্জ,Ramgati|রামগতি'),
  'Khagrachhari': U('Khagrachhari Sadar|খাগড়াছড়ি সদর,Dighinala|দীঘিনালা,Lakshmichhari|লক্ষ্মীছড়ি,Mahalchhari|মহালছড়ি,Manikchhari|মানিকছড়ি,Matiranga|মাটিরাঙ্গা,Panchhari|পানছড়ি,Ramgarh|রামগড়,Guimara|গুইমারা'),
  'Rangamati': U('Rangamati Sadar|রাঙ্গামাটি সদর,Baghaichhari|বাঘাইছড়ি,Barkal|বরকল,Belaichhari|বিলাইছড়ি,Juraichhari|জুরাছড়ি,Kaptai|কাপ্তাই,Kawkhali|কাউখালী,Langadu|লংগদু,Naniarchar|নানিয়ারচর,Rajasthali|রাজস্থলী'),
  'Bandarban': U('Bandarban Sadar|বান্দরবান সদর,Alikadam|আলীকদম,Lama|লামা,Naikhongchhari|নাইক্ষ্যংছড়ি,Rowangchhari|রোয়াংছড়ি,Ruma|রুমা,Thanchi|থানচি'),
  'Rajshahi': U('Bagha|বাঘা,Bagmara|বাগমারা,Charghat|চারঘাট,Durgapur|দুর্গাপুর,Godagari|গোদাগাড়ী,Mohanpur|মোহনপুর,Paba|পবা,Puthia|পুঠিয়া,Tanore|তানোর'),
  'Bogura': U('Bogura Sadar|বগুড়া সদর,Adamdighi|আদমদীঘি,Dhunat|ধুনট,Dhupchanchia|দুপচাঁচিয়া,Gabtali|গাবতলী,Kahaloo|কাহালু,Nandigram|নন্দীগ্রাম,Sariakandi|সারিয়াকান্দি,Shajahanpur|শাজাহানপুর,Sherpur|শেরপুর,Shibganj|শিবগঞ্জ,Sonatala|সোনাতলা'),
  'Pabna': U('Pabna Sadar|পাবনা সদর,Atgharia|আটঘরিয়া,Bera|বেড়া,Bhangura|ভাঙ্গুড়া,Chatmohar|চাটমোহর,Faridpur|ফরিদপুর,Ishwardi|ঈশ্বরদী,Santhia|সাঁথিয়া,Sujanagar|সুজানগর'),
  'Sirajganj': U('Sirajganj Sadar|সিরাজগঞ্জ সদর,Belkuchi|বেলকুচি,Chauhali|চৌহালি,Kamarkhanda|কামারখন্দ,Kazipur|কাজীপুর,Raiganj|রায়গঞ্জ,Shahjadpur|শাহজাদপুর,Tarash|তাড়াশ,Ullahpara|উল্লাপাড়া'),
  'Natore': U('Natore Sadar|নাটোর সদর,Bagatipara|বাগাতিপাড়া,Baraigram|বড়াইগ্রাম,Gurudaspur|গুরুদাসপুর,Lalpur|লালপুর,Singra|সিংড়া,Naldanga|নলডাঙ্গা'),
  'Naogaon': U('Naogaon Sadar|নওগাঁ সদর,Atrai|আত্রাই,Badalgachhi|বদলগাছী,Dhamoirhat|ধামইরহাট,Manda|মান্দা,Mahadebpur|মহাদেবপুর,Niamatpur|নিয়ামতপুর,Patnitala|পত্নীতলা,Porsha|পোরশা,Raninagar|রাণীনগর,Sapahar|সাপাহার'),
  'Chapainawabganj': U('Chapainawabganj Sadar|চাঁপাইনবাবগঞ্জ সদর,Bholahat|ভোলাহাট,Gomastapur|গোমস্তাপুর,Nachole|নাচোল,Shibganj|শিবগঞ্জ'),
  'Joypurhat': U('Joypurhat Sadar|জয়পুরহাট সদর,Akkelpur|আক্কেলপুর,Kalai|কালাই,Khetlal|ক্ষেতলাল,Panchbibi|পাঁচবিবি'),
  'Khulna': U('Batiaghata|বটিয়াঘাটা,Dacope|দাকোপ,Dighalia|দিঘলিয়া,Dumuria|ডুমুরিয়া,Koyra|কয়রা,Paikgachha|পাইকগাছা,Phultala|ফুলতলা,Rupsa|রূপসা,Terokhada|তেরখাদা'),
  'Jashore': U('Jashore Sadar|যশোর সদর,Abhaynagar|অভয়নগর,Bagherpara|বাঘারপাড়া,Chaugachha|চৌগাছা,Jhikargachha|ঝিকরগাছা,Keshabpur|কেশবপুর,Manirampur|মণিরামপুর,Sharsha|শার্শা'),
  'Satkhira': U('Satkhira Sadar|সাতক্ষীরা সদর,Assasuni|আশাশুনি,Debhata|দেবহাটা,Kalaroa|কলারোয়া,Kaliganj|কালিগঞ্জ,Shyamnagar|শ্যামনগর,Tala|তালা'),
  'Bagerhat': U('Bagerhat Sadar|বাগেরহাট সদর,Chitalmari|চিতলমারী,Fakirhat|ফকিরহাট,Kachua|কচুয়া,Mollahat|মোল্লাহাট,Mongla|মোংলা,Morrelganj|মোড়েলগঞ্জ,Rampal|রামপাল,Sarankhola|শরণখোলা'),
  'Kushtia': U('Kushtia Sadar|কুষ্টিয়া সদর,Bheramara|ভেড়ামারা,Daulatpur|দৌলতপুর,Khoksa|খোকসা,Kumarkhali|কুমারখালী,Mirpur|মিরপুর'),
  'Chuadanga': U('Chuadanga Sadar|চুয়াডাঙ্গা সদর,Alamdanga|আলমডাঙ্গা,Damurhuda|দামুড়হুদা,Jibannagar|জীবননগর'),
  'Meherpur': U('Meherpur Sadar|মেহেরপুর সদর,Gangni|গাংনী,Mujibnagar|মুজিবনগর'),
  'Jhenaidah': U('Jhenaidah Sadar|ঝিনাইদহ সদর,Harinakunda|হরিণাকুণ্ডু,Kaliganj|কালীগঞ্জ,Kotchandpur|কোটচাঁদপুর,Maheshpur|মহেশপুর,Shailkupa|শৈলকুপা'),
  'Magura': U('Magura Sadar|মাগুরা সদর,Mohammadpur|মহম্মদপুর,Shalikha|শালিখা,Sreepur|শ্রীপুর'),
  'Narail': U('Narail Sadar|নড়াইল সদর,Kalia|কালিয়া,Lohagara|লোহাগড়া'),
  'Barishal': U('Barishal Sadar|বরিশাল সদর,Agailjhara|আগৈলঝাড়া,Babuganj|বাবুগঞ্জ,Bakerganj|বাকেরগঞ্জ,Banaripara|বানারীপাড়া,Gournadi|গৌরনদী,Hizla|হিজলা,Mehendiganj|মেহেন্দিগঞ্জ,Muladi|মুলাদী,Wazirpur|উজিরপুর'),
  'Bhola': U('Bhola Sadar|ভোলা সদর,Burhanuddin|বোরহানউদ্দিন,Char Fasson|চরফ্যাশন,Daulatkhan|দৌলতখান,Lalmohan|লালমোহন,Manpura|মনপুরা,Tazumuddin|তজুমদ্দিন'),
  'Patuakhali': U('Patuakhali Sadar|পটুয়াখালী সদর,Bauphal|বাউফল,Dashmina|দশমিনা,Dumki|দুমকি,Galachipa|গলাচিপা,Kalapara|কলাপাড়া,Mirzaganj|মির্জাগঞ্জ,Rangabali|রাঙ্গাবালী'),
  'Pirojpur': U('Pirojpur Sadar|পিরোজপুর সদর,Bhandaria|ভান্ডারিয়া,Kawkhali|কাউখালী,Mathbaria|মঠবাড়িয়া,Nazirpur|নাজিরপুর,Nesarabad|নেছারাবাদ,Zianagar|জিয়ানগর'),
  'Jhalokathi': U('Jhalokathi Sadar|ঝালকাঠি সদর,Kathalia|কাঁঠালিয়া,Nalchity|নলছিটি,Rajapur|রাজাপুর'),
  'Barguna': U('Barguna Sadar|বরগুনা সদর,Amtali|আমতলী,Bamna|বামনা,Betagi|বেতাগী,Patharghata|পাথরঘাটা,Taltali|তালতলী'),
  'Sylhet': U('Sylhet Sadar|সিলেট সদর,Balaganj|বালাগঞ্জ,Beanibazar|বিয়ানীবাজার,Bishwanath|বিশ্বনাথ,Companiganj|কোম্পানীগঞ্জ,Dakshin Surma|দক্ষিণ সুরমা,Fenchuganj|ফেঞ্চুগঞ্জ,Golapganj|গোলাপগঞ্জ,Gowainghat|গোয়াইনঘাট,Jaintiapur|জৈন্তাপুর,Kanaighat|কানাইঘাট,Osmani Nagar|ওসমানীনগর,Zakiganj|জকিগঞ্জ'),
  'Moulvibazar': U('Moulvibazar Sadar|মৌলভীবাজার সদর,Barlekha|বড়লেখা,Juri|জুড়ী,Kamalganj|কমলগঞ্জ,Kulaura|কুলাউড়া,Rajnagar|রাজনগর,Sreemangal|শ্রীমঙ্গল'),
  'Habiganj': U('Habiganj Sadar|হবিগঞ্জ সদর,Ajmiriganj|আজমিরীগঞ্জ,Bahubal|বাহুবল,Baniachong|বানিয়াচং,Chunarughat|চুনারুঘাট,Lakhai|লাখাই,Madhabpur|মাধবপুর,Nabiganj|নবীগঞ্জ,Shayestaganj|শায়েস্তাগঞ্জ'),
  'Sunamganj': U('Sunamganj Sadar|সুনামগঞ্জ সদর,Bishwamvarpur|বিশ্বম্ভরপুর,Chhatak|ছাতক,Dakshin Sunamganj|দক্ষিণ সুনামগঞ্জ,Derai|দিরাই,Dharampasha|ধর্মপাশা,Dowarabazar|দোয়ারাবাজার,Jagannathpur|জগন্নাথপুর,Jamalganj|জামালগঞ্জ,Sullah|শাল্লা,Tahirpur|তাহিরপুর'),
  'Rangpur': U('Rangpur Sadar|রংপুর সদর,Badarganj|বদরগঞ্জ,Gangachara|গংগাচড়া,Kaunia|কাউনিয়া,Mithapukur|মিঠাপুকুর,Pirgachha|পীরগাছা,Pirganj|পীরগঞ্জ,Taraganj|তারাগঞ্জ'),
  'Dinajpur': U('Dinajpur Sadar|দিনাজপুর সদর,Birampur|বিরামপুর,Birganj|বীরগঞ্জ,Biral|বিরল,Bochaganj|বোচাগঞ্জ,Chirirbandar|চিরিরবন্দর,Fulbari|ফুলবাড়ী,Ghoraghat|ঘোড়াঘাট,Hakimpur|হাকিমপুর,Kaharole|কাহারোল,Khansama|খানসামা,Nawabganj|নবাবগঞ্জ,Parbatipur|পার্বতীপুর'),
  'Kurigram': U('Kurigram Sadar|কুড়িগ্রাম সদর,Bhurungamari|ভূরুঙ্গামারী,Char Rajibpur|চর রাজিবপুর,Chilmari|চিলমারী,Nageshwari|নাগেশ্বরী,Phulbari|ফুলবাড়ী,Rajarhat|রাজারহাট,Raumari|রৌমারী,Ulipur|উলিপুর'),
  'Gaibandha': U('Gaibandha Sadar|গাইবান্ধা সদর,Fulchhari|ফুলছড়ি,Gobindaganj|গোবিন্দগঞ্জ,Palashbari|পলাশবাড়ী,Sadullapur|সাদুল্লাপুর,Saghata|সাঘাটা,Sundarganj|সুন্দরগঞ্জ'),
  'Nilphamari': U('Nilphamari Sadar|নীলফামারী সদর,Dimla|ডিমলা,Domar|ডোমার,Jaldhaka|জলঢাকা,Kishoreganj|কিশোরগঞ্জ,Saidpur|সৈয়দপুর'),
  'Lalmonirhat': U('Lalmonirhat Sadar|লালমনিরহাট সদর,Aditmari|আদিতমারী,Hatibandha|হাতীবান্ধা,Kaliganj|কালীগঞ্জ,Patgram|পাটগ্রাম'),
  'Thakurgaon': U('Thakurgaon Sadar|ঠাকুরগাঁও সদর,Baliadangi|বালিয়াডাঙ্গী,Haripur|হরিপুর,Pirganj|পীরগঞ্জ,Ranisankail|রাণীশংকৈল'),
  'Panchagarh': U('Panchagarh Sadar|পঞ্চগড় সদর,Atwari|আটোয়ারী,Boda|বোদা,Debiganj|দেবীগঞ্জ,Tetulia|তেতুলিয়া'),
  'Mymensingh': U('Mymensingh Sadar|ময়মনসিংহ সদর,Bhaluka|ভালুকা,Dhobaura|ধোবাউড়া,Fulbaria|ফুলবাড়িয়া,Gaffargaon|গফরগাঁও,Gauripur|গৌরীপুর,Haluaghat|হালুয়াঘাট,Ishwarganj|ঈশ্বরগঞ্জ,Muktagachha|মুক্তাগাছা,Nandail|নান্দাইল,Phulpur|ফুলপুর,Tarakanda|তারাকান্দা,Trishal|ত্রিশাল'),
  'Jamalpur': U('Jamalpur Sadar|জামালপুর সদর,Bakshiganj|বকশীগঞ্জ,Dewanganj|দেওয়ানগঞ্জ,Islampur|ইসলামপুর,Madarganj|মাদারগঞ্জ,Melandaha|মেলান্দহ,Sarishabari|সরিষাবাড়ী'),
  'Netrokona': U('Netrokona Sadar|নেত্রকোণা সদর,Atpara|আটপাড়া,Barhatta|বারহাট্টা,Durgapur|দুর্গাপুর,Kalmakanda|কলমাকান্দা,Kendua|কেন্দুয়া,Khaliajuri|খালিয়াজুরী,Madan|মদন,Mohanganj|মোহনগঞ্জ,Purbadhala|পূর্বধলা'),
  'Sherpur': U('Sherpur Sadar|শেরপুর সদর,Jhenaigati|ঝিনাইগাতী,Nakla|নকলা,Nalitabari|নালিতাবাড়ী,Sreebardi|শ্রীবরদী')
};
const CITYCORP = {
  'Dhaka': U('Dhaka North City Corporation|ঢাকা উত্তর সিটি করপোরেশন,Dhaka South City Corporation|ঢাকা দক্ষিণ সিটি করপোরেশন'),
  'Gazipur': U('Gazipur City Corporation|গাজীপুর সিটি করপোরেশন'),
  'Narayanganj': U('Narayanganj City Corporation|নারায়ণগঞ্জ সিটি করপোরেশন'),
  'Chattogram': U('Chattogram City Corporation|চট্টগ্রাম সিটি করপোরেশন'),
  'Cumilla': U('Cumilla City Corporation|কুমিল্লা সিটি করপোরেশন'),
  'Rajshahi': U('Rajshahi City Corporation|রাজশাহী সিটি করপোরেশন'),
  'Khulna': U('Khulna City Corporation|খুলনা সিটি করপোরেশন'),
  'Barishal': U('Barishal City Corporation|বরিশাল সিটি করপোরেশন'),
  'Sylhet': U('Sylhet City Corporation|সিলেট সিটি করপোরেশন'),
  'Rangpur': U('Rangpur City Corporation|রংপুর সিটি করপোরেশন'),
  'Mymensingh': U('Mymensingh City Corporation|ময়মনসিংহ সিটি করপোরেশন')
};
const parse = (arr, cc) => (arr || []).map(s => { const [v, bn] = s.split('|'); return { v, bn, cc }; });
// city corporations first, then upazilas
export const areasFor = (district) => [...parse(CITYCORP[district], true), ...parse(UPAZILA[district], false)];
export const areaName = (district, value, lang) => {
  const a = areasFor(district).find(x => x.v === value);
  return a ? (lang === 'bn' ? a.bn : a.v) : (value || '');
};
export const shortId = (uid) => String(uid || '').slice(-6).toUpperCase();
// client-side filter for area/address (used by both backends)
export const matchDonor = (d, f) => {
  const hay = [d.upazila, areaName(d.district, d.upazila, 'bn'), d.address].join(' ').toLowerCase();
  if (f.upazila && !(d.upazila === f.upazila || hay.includes(f.upazila.toLowerCase()))) return false;
  if (f.address && !hay.includes(f.address.trim().toLowerCase())) return false;
  return true;
};
