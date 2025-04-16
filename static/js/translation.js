/**
 * Translation system for multiple languages
 */

// Language translation objects
const translations = {
    ha: {
        // Navigation
        'Dashboard': 'Dashbod',
        'Courses': 'Darussan',
        'Assignments': 'Ayyukan',
        'Discussions': 'Tattaunawa',
        'Resources': 'Kayayyakin',
        'Profile': 'Bayani',
        'Settings': 'Saituna',
        'Logout': 'Fita',
        
        // General UI
        'Save': 'Ajiye',
        'Cancel': 'Soke',
        'Delete': 'Share',
        'Edit': 'Gyara',
        'View': 'Duba',
        'Search': 'Bincika',
        'Loading': 'Ana lodi...',
        'Submit': 'Tura',
        'Back': 'Koma',
        'Next': 'Na gaba',
        'Previous': 'Na baya',
        'Close': 'Rufe',
        
        // Course related
        'My Courses': 'Darussan Na',
        'Available Courses': 'Darussan da Aka Samu',
        'Enroll': 'Yi Rajista',
        'Course Code': 'Lambar Darasin',
        'Instructor': 'Malami',
        'Students': 'Dalibai',
        'Create Course': 'Kirkiri Darasin',
        'Join Course': 'Shiga Darasin',
        'Course Details': 'Bayanin Darasin',
        
        // Assignment related
        'Due Date': 'Kwanan Lokaci',
        'Submission': 'Aiken',
        'Grade': 'Daraja',
        'Points': 'Alamomi',
        'Late Submission': 'Aiken Makura',
        'On Time': 'A Lokaci',
        'Graded': 'An Kiyasta',
        'Ungraded': 'Ba a Kiyasta ba',
        
        // Discussion related
        'Post': 'Rubutu',
        'Reply': 'Amsa',
        'Comments': 'Ra\'ayoyi',
        'Announcements': 'Sanarwa',
        
        // Profile and Settings
        'Account': 'Asusun',
        'Password': 'Kalmar Sirri',
        'Email': 'Imel',
        'Name': 'Suna',
        'First Name': 'Sunan Farko',
        'Last Name': 'Sunan Karshe',
        'Profile Picture': 'Hoton Bayani',
        'Change Password': 'Canza Kalmar Sirri',
        'Language': 'Yare',
        'Theme': 'Jigo',
        'Light Mode': 'Farin Yanayi',
        'Dark Mode': 'Bakin Yanayi',
        'Notifications': 'Sanerwa',
        'Security': 'Tsaro',
        'Accessibility': 'Samuwa',
        
        // Messages
        'Successfully saved': 'An yi nasarar ajiye',
        'Changes applied': 'An yi canji',
        'An error occurred': 'Kuskure ya faru',
        'Please try again': 'Da fatan a sake gwadawa',
        'Are you sure?': 'Kana tabbata?',
        'This action cannot be undone': 'Ba za\'a iya janye wannan aiki ba',
        
        // Settings sections
        'General Settings': 'Saitunan Gaba Ɗaya',
        'Appearance Settings': 'Saitunan Kama',
        'Language Settings': 'Saitunan Yare',
        'Notification Settings': 'Saitunan Sanerwa',
        'Security Settings': 'Saitunan Tsaro',
        'Accessibility Settings': 'Saitunan Samuwa',
        
        // Specific to language settings
        'Display Language': 'Nuna Yare',
        'Date & Time Format': 'Tsarin Kwanan Wata & Lokaci',
        'Date Format': 'Tsarin Kwanan Wata',
        'Time Format': 'Tsarin Lokaci',
        'Hausa Language Support': 'Goyon Bayan Yaren Hausa',
        'Hausa language is currently in beta': 'Yaren Hausa yana cikin beta yanzu',
        'Some parts of the interface may still appear in English': 'Wasu sassan na iya faruwa a Ingilishi'
    },
    
    // You can add more languages here
    fr: {
        'Dashboard': 'Tableau de Bord',
        'Courses': 'Cours',
        'Assignments': 'Devoirs',
        // Add more French translations...
    },
    
    es: {
        'Dashboard': 'Panel',
        'Courses': 'Cursos',
        'Assignments': 'Tareas',
        // Add more Spanish translations...
    }
};

/**
 * Get translation for a specific text in the current language
 * @param {string} text - Original text to translate
 * @param {string} language - Language code (defaults to current language)
 * @returns {string} Translated text or original if no translation exists
 */
function translate(text, language = null) {
    const currentLang = language || localStorage.getItem('language') || 'en';
    
    // If not English and we have translations for this language
    if (currentLang !== 'en' && translations[currentLang]) {
        // Return the translation or the original text if no translation exists
        return translations[currentLang][text] || text;
    }
    
    return text;
}

/**
 * Apply translations to the current page
 * @param {string} language - Language code to apply
 */
function applyTranslations(language) {
    if (language === 'en') {
        // For English, we don't need to do anything as it's the default
        document.documentElement.setAttribute('lang', 'en');
        return;
    }
    
    // Store the language preference
    localStorage.setItem('language', language);
    
    // Set document language
    document.documentElement.setAttribute('lang', language);
    
    // Set direction for RTL languages
    if (['ar', 'he', 'fa', 'ur'].includes(language)) {
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');
    }
    
    // Walk through text nodes and translate them
    const textNodes = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = textNodes.nextNode()) {
        const text = node.nodeValue.trim();
        if (text && translations[language] && translations[language][text]) {
            node.nodeValue = node.nodeValue.replace(text, translations[language][text]);
        }
    }
    
    // Translate attributes like placeholders and titles
    const elements = document.querySelectorAll('[placeholder], [title], [aria-label]');
    elements.forEach(el => {
        if (el.hasAttribute('placeholder')) {
            const text = el.getAttribute('placeholder');
            if (translations[language] && translations[language][text]) {
                el.setAttribute('placeholder', translations[language][text]);
            }
        }
        
        if (el.hasAttribute('title')) {
            const text = el.getAttribute('title');
            if (translations[language] && translations[language][text]) {
                el.setAttribute('title', translations[language][text]);
            }
        }
        
        if (el.hasAttribute('aria-label')) {
            const text = el.getAttribute('aria-label');
            if (translations[language] && translations[language][text]) {
                el.setAttribute('aria-label', translations[language][text]);
            }
        }
    });
}

/**
 * Initialize language based on user preference
 * Call this during application startup
 */
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== 'en') {
        applyTranslations(savedLanguage);
    }
}