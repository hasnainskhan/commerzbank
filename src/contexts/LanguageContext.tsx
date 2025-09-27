import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'English' | 'Deutsch';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: any;
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
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    forgotPassword: 'Forgot Password?',
    updatePhotoTAN: 'Update your photoTAN app',
    businessPortal: 'To login to the business customer portal',
    notDigitalCustomer: 'Not yet a Digital Banking customer?',
    applyDigitalAccess: 'Apply for digital access (with autoIDENT)',
    currentWarnings: 'Current warnings',
    warning1: 'Alleged bank employees asking for access data',
    warning2: 'Grandchild trick: Fraudsters use WhatsApp (police-advice.de)',
    importantInfo: 'Important information about Digital Banking',
    photoTANProblems: 'Problems with the photoTAN app or payment approvals? here for more information',
    noActiveTAN: 'No active TAN procedure?',
    activatePhotoTAN: 'Activate photoTAN (for logged-in customers)',
    photoTANHelp: 'Help with photoTAN',
    forgotCredentials: 'Forgot participant number/PIN?',
    requestParticipantNumber: 'Request new participant number',
    forgotPIN: 'Forgot PIN',
    
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
    username: 'Benutzername',
    password: 'Passwort',
    loginButton: 'Anmelden',
    forgotPassword: 'Passwort vergessen?',
    updatePhotoTAN: 'Aktualisieren Sie Ihre photoTAN-App',
    businessPortal: 'Zur Anmeldung im Firmenkundenportal',
    notDigitalCustomer: 'Noch kein Digital Banking Kunde?',
    applyDigitalAccess: 'Zugang digital beantragen (mit autoIDENT)',
    currentWarnings: 'Aktuelle Warnhinweise',
    warning1: 'Angebliche Bank-Mitarbeiter erfragen Zugangsdaten',
    warning2: 'Enkeltrick: Betrüger nutzen WhatsApp (polizei-beratung.de)',
    importantInfo: 'Wichtige Infos zum Digital Banking',
    photoTANProblems: 'Probleme mit der photoTAN-App oder Zahlungsfreigaben? hier weitere Informationen',
    noActiveTAN: 'Kein aktives TAN-Verfahren?',
    activatePhotoTAN: 'photoTAN aktivieren (für angemeldete Kunden)',
    photoTANHelp: 'Hilfe zur photoTAN',
    forgotCredentials: 'Teilnehmernummer/PIN vergessen?',
    requestParticipantNumber: 'Teilnehmernummer neu anfordern',
    forgotPIN: 'PIN vergessen',
    
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
  const t = texts[language];

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
