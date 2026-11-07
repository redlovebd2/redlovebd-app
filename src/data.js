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
