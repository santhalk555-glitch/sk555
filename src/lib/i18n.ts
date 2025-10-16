import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      
      // Account Settings
      accountSettings: 'Account Settings',
      security: 'Security',
      preferences: 'Preferences',
      privacyData: 'Privacy & Data',
      banList: 'Ban List',
      
      // Language & Theme
      notificationSettings: 'Notification Settings',
      enableNotifications: 'Enable Notifications',
      notificationDescription: 'Receive alerts for messages, friend requests, and updates',
      themeMode: 'Theme Mode',
      darkMode: 'Dark Mode',
      darkModeDescription: 'Toggle between light and dark themes',
      language: 'Language',
      selectLanguage: 'Select your preferred language',
      
      // Privacy
      profileVisibility: 'Profile Visibility',
      showInSearch: 'Show in Public Search',
      allowFriendRequests: 'Allow Friend Requests',
      allowMessagesNonFriends: 'Allow Messages from Non-Friends',
      dataManagement: 'Data Management',
      downloadData: 'Download My Data',
      deleteAccount: 'Delete Account',
      
      // Toasts
      success: 'Success',
      error: 'Error',
      languageChanged: 'Language changed successfully!',
      themeChanged: 'Theme changed successfully!',
      settingUpdated: 'Setting updated successfully!',
      accountDeleted: 'Your account has been permanently deleted.',
      deleteError: 'Failed to delete account. Please try again.',
      
      // Confirmation
      areYouSure: 'Are you absolutely sure?',
      deleteWarning: 'This action cannot be undone. This will permanently delete your account and remove all your data from our servers.',
      cancel: 'Cancel',
      confirm: 'Yes, Delete Forever',
      deleting: 'Deleting...',
    }
  },
  hi: {
    translation: {
      // Navigation
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
      
      // Account Settings
      accountSettings: 'खाता सेटिंग्स',
      security: 'सुरक्षा',
      preferences: 'प्राथमिकताएं',
      privacyData: 'गोपनीयता और डेटा',
      banList: 'प्रतिबंध सूची',
      
      // Language & Theme
      notificationSettings: 'सूचना सेटिंग्स',
      enableNotifications: 'सूचनाएं सक्षम करें',
      notificationDescription: 'संदेश, मित्र अनुरोध और अपडेट के लिए अलर्ट प्राप्त करें',
      themeMode: 'थीम मोड',
      darkMode: 'डार्क मोड',
      darkModeDescription: 'लाइट और डार्क थीम के बीच टॉगल करें',
      language: 'भाषा',
      selectLanguage: 'अपनी पसंदीदा भाषा चुनें',
      
      // Privacy
      profileVisibility: 'प्रोफ़ाइल दृश्यता',
      showInSearch: 'सार्वजनिक खोज में दिखाएं',
      allowFriendRequests: 'मित्र अनुरोध की अनुमति दें',
      allowMessagesNonFriends: 'गैर-मित्रों से संदेश की अनुमति दें',
      dataManagement: 'डेटा प्रबंधन',
      downloadData: 'मेरा डेटा डाउनलोड करें',
      deleteAccount: 'खाता हटाएं',
      
      // Toasts
      success: 'सफलता',
      error: 'त्रुटि',
      languageChanged: 'भाषा सफलतापूर्वक बदल गई!',
      themeChanged: 'थीम सफलतापूर्वक बदल गई!',
      settingUpdated: 'सेटिंग सफलतापूर्वक अपडेट की गई!',
      accountDeleted: 'आपका खाता स्थायी रूप से हटा दिया गया है।',
      deleteError: 'खाता हटाने में विफल। कृपया पुनः प्रयास करें।',
      
      // Confirmation
      areYouSure: 'क्या आप पूरी तरह से आश्वस्त हैं?',
      deleteWarning: 'इस क्रिया को पूर्ववत नहीं किया जा सकता। यह आपके खाते को स्थायी रूप से हटा देगा और हमारे सर्वर से आपका सभी डेटा हटा देगा।',
      cancel: 'रद्द करें',
      confirm: 'हां, हमेशा के लिए हटाएं',
      deleting: 'हटा रहे हैं...',
    }
  },
  mr: {
    translation: {
      // Navigation
      dashboard: 'डॅशबोर्ड',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्ज',
      logout: 'लॉगआउट',
      
      // Account Settings
      accountSettings: 'खाते सेटिंग्ज',
      security: 'सुरक्षा',
      preferences: 'प्राधान्ये',
      privacyData: 'गोपनीयता आणि डेटा',
      banList: 'प्रतिबंध यादी',
      
      // Language & Theme
      notificationSettings: 'सूचना सेटिंग्ज',
      enableNotifications: 'सूचना सक्षम करा',
      notificationDescription: 'संदेश, मित्र विनंत्या आणि अद्यतने साठी सूचना मिळवा',
      themeMode: 'थीम मोड',
      darkMode: 'डार्क मोड',
      darkModeDescription: 'लाइट आणि डार्क थीममध्ये बदला',
      language: 'भाषा',
      selectLanguage: 'तुमची पसंतीची भाषा निवडा',
      
      // Privacy
      profileVisibility: 'प्रोफाइल दृश्यमानता',
      showInSearch: 'सार्वजनिक शोधात दाखवा',
      allowFriendRequests: 'मित्र विनंत्यांना परवानगी द्या',
      allowMessagesNonFriends: 'गैर-मित्रांकडून संदेशांना परवानगी द्या',
      dataManagement: 'डेटा व्यवस्थापन',
      downloadData: 'माझा डेटा डाउनलोड करा',
      deleteAccount: 'खाते हटवा',
      
      // Toasts
      success: 'यश',
      error: 'त्रुटी',
      languageChanged: 'भाषा यशस्वीरित्या बदलली!',
      themeChanged: 'थीम यशस्वीरित्या बदलली!',
      settingUpdated: 'सेटिंग यशस्वीरित्या अद्यतनित केली!',
      accountDeleted: 'तुमचे खाते कायमस्वरूपी हटवले गेले आहे.',
      deleteError: 'खाते हटवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
      
      // Confirmation
      areYouSure: 'तुम्हाला पूर्णपणे खात्री आहे का?',
      deleteWarning: 'ही क्रिया पूर्ववत करता येणार नाही. हे तुमचे खाते कायमस्वरूपी हटवेल आणि आमच्या सर्व्हरवरून तुमचा सर्व डेटा काढून टाकेल.',
      cancel: 'रद्द करा',
      confirm: 'होय, कायमचे हटवा',
      deleting: 'हटवत आहे...',
    }
  },
  bn: {
    translation: {
      // Navigation
      dashboard: 'ড্যাশবোর্ড',
      profile: 'প্রোফাইল',
      settings: 'সেটিংস',
      logout: 'লগআউট',
      
      // Account Settings
      accountSettings: 'অ্যাকাউন্ট সেটিংস',
      security: 'নিরাপত্তা',
      preferences: 'পছন্দসমূহ',
      privacyData: 'গোপনীয়তা এবং ডেটা',
      banList: 'নিষিদ্ধ তালিকা',
      
      // Language & Theme
      notificationSettings: 'বিজ্ঞপ্তি সেটিংস',
      enableNotifications: 'বিজ্ঞপ্তি সক্ষম করুন',
      notificationDescription: 'বার্তা, বন্ধু অনুরোধ এবং আপডেটের জন্য সতর্কতা পান',
      themeMode: 'থিম মোড',
      darkMode: 'ডার্ক মোড',
      darkModeDescription: 'হালকা এবং অন্ধকার থিমের মধ্যে টগল করুন',
      language: 'ভাষা',
      selectLanguage: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
      
      // Privacy
      profileVisibility: 'প্রোফাইল দৃশ্যমানতা',
      showInSearch: 'সর্বজনীন অনুসন্ধানে দেখান',
      allowFriendRequests: 'বন্ধু অনুরোধ অনুমতি দিন',
      allowMessagesNonFriends: 'অ-বন্ধুদের থেকে বার্তা অনুমতি দিন',
      dataManagement: 'ডেটা ব্যবস্থাপনা',
      downloadData: 'আমার ডেটা ডাউনলোড করুন',
      deleteAccount: 'অ্যাকাউন্ট মুছুন',
      
      // Toasts
      success: 'সফলতা',
      error: 'ত্রুটি',
      languageChanged: 'ভাষা সফলভাবে পরিবর্তিত হয়েছে!',
      themeChanged: 'থিম সফলভাবে পরিবর্তিত হয়েছে!',
      settingUpdated: 'সেটিং সফলভাবে আপডেট করা হয়েছে!',
      accountDeleted: 'আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলা হয়েছে।',
      deleteError: 'অ্যাকাউন্ট মুছতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
      
      // Confirmation
      areYouSure: 'আপনি কি সম্পূর্ণরূপে নিশ্চিত?',
      deleteWarning: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। এটি আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলবে এবং আমাদের সার্ভার থেকে আপনার সমস্ত ডেটা সরিয়ে দেবে।',
      cancel: 'বাতিল করুন',
      confirm: 'হ্যাঁ, চিরতরে মুছুন',
      deleting: 'মুছে ফেলা হচ্ছে...',
    }
  },
  ta: {
    translation: {
      // Navigation
      dashboard: 'டாஷ்போர்டு',
      profile: 'சுயவிவரம்',
      settings: 'அமைப்புகள்',
      logout: 'வெளியேறு',
      
      // Account Settings
      accountSettings: 'கணக்கு அமைப்புகள்',
      security: 'பாதுகாப்பு',
      preferences: 'விருப்பத்தேர்வுகள்',
      privacyData: 'தனியுரிமை மற்றும் தரவு',
      banList: 'தடை பட்டியல்',
      
      // Language & Theme
      notificationSettings: 'அறிவிப்பு அமைப்புகள்',
      enableNotifications: 'அறிவிப்புகளை இயக்கு',
      notificationDescription: 'செய்திகள், நண்பர் கோரிக்கைகள் மற்றும் புதுப்பிப்புகளுக்கான எச்சரிக்கைகளைப் பெறுங்கள்',
      themeMode: 'தீம் பயன்முறை',
      darkMode: 'இருண்ட பயன்முறை',
      darkModeDescription: 'வெளிச்சம் மற்றும் இருண்ட தீம்களுக்கு இடையே மாற்றவும்',
      language: 'மொழி',
      selectLanguage: 'உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
      
      // Privacy
      profileVisibility: 'சுயவிவர காணக்கூடியது',
      showInSearch: 'பொது தேடலில் காட்டு',
      allowFriendRequests: 'நண்பர் கோரிக்கைகளை அனுமதிக்கவும்',
      allowMessagesNonFriends: 'நண்பர்கள் அல்லாதவர்களிடமிருந்து செய்திகளை அனுமதிக்கவும்',
      dataManagement: 'தரவு நிர்வாகம்',
      downloadData: 'எனது தரவைப் பதிவிறக்கவும்',
      deleteAccount: 'கணக்கை நீக்கு',
      
      // Toasts
      success: 'வெற்றி',
      error: 'பிழை',
      languageChanged: 'மொழி வெற்றிகரமாக மாற்றப்பட்டது!',
      themeChanged: 'தீம் வெற்றிகரமாக மாற்றப்பட்டது!',
      settingUpdated: 'அமைப்பு வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
      accountDeleted: 'உங்கள் கணக்கு நிரந்தரமாக நீக்கப்பட்டது.',
      deleteError: 'கணக்கை நீக்குவதில் தோல்வி. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      
      // Confirmation
      areYouSure: 'நீங்கள் முழுமையாக உறுதியாக இருக்கிறீர்களா?',
      deleteWarning: 'இந்த செயலை செயல்மீட்க முடியாது. இது உங்கள் கணக்கை நிரந்தரமாக நீக்கி, எங்கள் சேவையகங்களிலிருந்து உங்கள் அனைத்து தரவையும் அகற்றும்.',
      cancel: 'ரத்து செய்',
      confirm: 'ஆம், என்றென்றும் நீக்கு',
      deleting: 'நீக்குகிறது...',
    }
  },
  te: {
    translation: {
      // Navigation
      dashboard: 'డ్యాష్‌బోర్డ్',
      profile: 'ప్రొఫైల్',
      settings: 'సెట్టింగ్‌లు',
      logout: 'లాగ్అవుట్',
      
      // Account Settings
      accountSettings: 'ఖాతా సెట్టింగ్‌లు',
      security: 'భద్రత',
      preferences: 'ప్రాధాన్యతలు',
      privacyData: 'గోప్యత మరియు డేటా',
      banList: 'నిషేధ జాబితా',
      
      // Language & Theme
      notificationSettings: 'నోటిఫికేషన్ సెట్టింగ్‌లు',
      enableNotifications: 'నోటిఫికేషన్‌లను ప్రారంభించండి',
      notificationDescription: 'సందేశాలు, స్నేహితుల అభ్యర్థనలు మరియు నవీకరణల కోసం హెచ్చరికలను పొందండి',
      themeMode: 'థీమ్ మోడ్',
      darkMode: 'డార్క్ మోడ్',
      darkModeDescription: 'లైట్ మరియు డార్క్ థీమ్‌ల మధ్య టోగుల్ చేయండి',
      language: 'భాష',
      selectLanguage: 'మీకు ఇష్టమైన భాషను ఎంచుకోండి',
      
      // Privacy
      profileVisibility: 'ప్రొఫైల్ విజిబిలిటీ',
      showInSearch: 'పబ్లిక్ సెర్చ్‌లో చూపించు',
      allowFriendRequests: 'స్నేహితుల అభ్యర్థనలను అనుమతించండి',
      allowMessagesNonFriends: 'స్నేహితులు కాని వారి నుండి సందేశాలను అనుమతించండి',
      dataManagement: 'డేటా నిర్వహణ',
      downloadData: 'నా డేటాను డౌన్‌లోడ్ చేయండి',
      deleteAccount: 'ఖాతాను తొలగించండి',
      
      // Toasts
      success: 'విజయం',
      error: 'లోపం',
      languageChanged: 'భాష విజయవంతంగా మార్చబడింది!',
      themeChanged: 'థీమ్ విజయవంతంగా మార్చబడింది!',
      settingUpdated: 'సెట్టింగ్ విజయవంతంగా నవీకరించబడింది!',
      accountDeleted: 'మీ ఖాతా శాశ్వతంగా తొలగించబడింది.',
      deleteError: 'ఖాతాను తొలగించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
      
      // Confirmation
      areYouSure: 'మీరు పూర్తిగా ఖచ్చితంగా ఉన్నారా?',
      deleteWarning: 'ఈ చర్యను రద్దు చేయలేము. ఇది మీ ఖాతాను శాశ్వతంగా తొలగిస్తుంది మరియు మా సర్వర్‌ల నుండి మీ మొత్తం డేటాను తొలగిస్తుంది.',
      cancel: 'రద్దు చేయండి',
      confirm: 'అవును, ఎప్పటికీ తొలగించండి',
      deleting: 'తొలగిస్తోంది...',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('app-language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
