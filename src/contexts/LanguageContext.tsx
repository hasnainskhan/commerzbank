import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'English' | 'Deutsch';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language texts for the entire application
const texts = {
  English: {
    // Header
    searchPlaceholder: 'Your search text',
    group: 'Group',
    profileSettings: 'Profile & Settings',
    privateCustomers: 'Private customers',
    businessCustomers: 'Business customers',
    home: 'Home',
    accountsCards: 'Accounts & Cards',
    depotOrder: 'Depot & Order',
    analysis: 'Analysis',
    service: 'Service',
    productsKnowledge: 'Products & Knowledge',
    
           // Login Page
           loginTitle: 'Login',
           onlineBankingRegistration: 'Online banking registration',
           username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    forgotPassword: 'Forgot Password?',
    invalidCredentials: 'You have entered an invalid combination of username/participant number and PIN. Please enter the authentication data again.',
    updatePhotoTAN: 'Update your photoTAN app',
    businessPortal: 'To login to the business customer portal',
    notDigitalCustomer: 'Not yet a Digital Banking customer?',
    applyDigitalAccess: 'Apply for digital access (with autoIDENT)',
    currentWarnings: 'Current warnings',
    warning1: 'Alleged bank employees asking for access data',
    warning2: 'Grandchild trick: Fraudsters use WhatsApp (police-advice.de)',
    forgotCredentials: 'Forgot participant number/PIN?',
    requestParticipantNumber: 'Request new participant number',
    forgotPIN: 'Forgot PIN',
    
    // Important Info Section
    importantInfo: 'Important information about Digital Banking',
    photoTANProblems: 'Problems with the photoTAN app or payment approvals? here for more information',
    noActiveTAN: 'No active TAN procedure?',
    activatePhotoTAN: 'Activate photoTAN (for logged-in customers)',
    photoTANHelp: 'Help with photoTAN',
    allAboutOnlineBanking: 'All about Online Banking',
    instructionsHelp: 'Instructions/Help',
    security: 'Security',
    
    // Footer
    pricesConditions: 'Prices & Conditions',
    imprint: 'Imprint',
    legalNotice: 'Legal Notice',
    consentSettings: 'Consent settings',
    privacyPolicy: 'Privacy Policy',
    
    // Info Page
    personalInfo: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    birthDate: 'Birth Date',
    phone: 'Phone Number',
    nextButton: 'Next',
    
    // Upload Page
    uploadTitle: 'Upload Document',
    uploadDescription: 'Please upload your document',
    uploadButton: 'Choose File',
    uploadNext: 'Continue',
    
    // Done Page
    doneTitle: 'Thank You',
    doneMessage: 'Your information has been submitted successfully',
    doneButton: 'Start Over'
  },
  Deutsch: {
    // Header
    searchPlaceholder: 'Ihr Suchtext',
    group: 'Gruppe',
    profileSettings: 'Profil & Einstellungen',
    privateCustomers: 'Privatkunden',
    businessCustomers: 'Geschäftskunden',
    home: 'Startseite',
    accountsCards: 'Konten & Karten',
    depotOrder: 'Depot & Order',
    analysis: 'Analyse',
    service: 'Service',
    productsKnowledge: 'Produkte & Wissen',
    
           // Login Page
           loginTitle: 'Anmeldung',
           onlineBankingRegistration: 'Online-Banking-Registrierung',
           username: 'Benutzername',
    password: 'Passwort',
    loginButton: 'Anmelden',
    forgotPassword: 'Passwort vergessen?',
    invalidCredentials: 'Sie haben eine ungültige Kombination aus Benutzername/Teilnehmernummer und PIN eingegeben. Bitte geben Sie die Authentifizierungsdaten erneut ein.',
    updatePhotoTAN: 'Aktualisieren Sie Ihre photoTAN-App',
    businessPortal: 'Zur Anmeldung im Firmenkundenportal',
    notDigitalCustomer: 'Noch kein Digital Banking Kunde?',
    applyDigitalAccess: 'Zugang digital beantragen (mit autoIDENT)',
    currentWarnings: 'Aktuelle Warnhinweise',
    warning1: 'Angebliche Bank-Mitarbeiter erfragen Zugangsdaten',
    warning2: 'Enkeltrick: Betrüger nutzen WhatsApp (polizei-beratung.de)',
    forgotCredentials: 'Teilnehmernummer/PIN vergessen?',
    requestParticipantNumber: 'Teilnehmernummer neu anfordern',
    forgotPIN: 'PIN vergessen',
    
    // Important Info Section
    importantInfo: 'Wichtige Infos zum Digital Banking',
    photoTANProblems: 'Haben Sie Probleme mit der PhotoTAN-App oder der Freigabe von Zahlungen? Dann finden Sie hier weitere Informationen.',
    noActiveTAN: 'Kein aktives TAN-Verfahren?',
    activatePhotoTAN: 'photoTAN aktivieren (für angemeldete Kunden)',
    photoTANHelp: 'Hilfe zur photoTAN',
    allAboutOnlineBanking: 'Alles rund ums Online Banking',
    instructionsHelp: 'Anleitung/Hilfe',
    security: 'Sicherheit',
    
    // Footer
    pricesConditions: 'Preise & Bedingungen',
    imprint: 'Impressum',
    legalNotice: 'Rechtliche Hinweise',
    consentSettings: 'Einwilligungseinstellungen',
    privacyPolicy: 'Datenschutz',
    
    // Info Page
    personalInfo: 'Persönliche Informationen',
    firstName: 'Vorname',
    lastName: 'Nachname',
    birthDate: 'Geburtsdatum',
    phone: 'Telefonnummer',
    nextButton: 'Weiter',
    
    // Upload Page
    uploadTitle: 'Dokument hochladen',
    uploadDescription: 'Bitte laden Sie Ihr Dokument hoch',
    uploadButton: 'Datei auswählen',
    uploadNext: 'Fortfahren',
    
    // Done Page
    doneTitle: 'Vielen Dank',
    doneMessage: 'Ihre Informationen wurden erfolgreich übermittelt',
    doneButton: 'Neu starten'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('English');
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = texts[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
