"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "fr" | "kyr";

export interface Translations {
  // Navigation
  navReportFound: string;
  navPostLost: string;
  navSearchItems: string;
  navPrivacyAccount: string;
  
  // Hero & General
  brandTitle: string;
  brandSubtitle: string;
  reportFoundBtn: string;
  postLostBtn: string;
  searchBtn: string;
  allListings: string;
  foundItems: string;
  lostBounties: string;
  
  // Search & Filters
  searchPlaceholder: string;
  allDistricts: string;
  allSectors: string;
  detectLocation: string;
  detectingLocation: string;
  locationDetected: string;
  resetFilters: string;
  
  // Categories
  catAll: string;
  catNationalId: string;
  catDriverLicense: string;
  catPassport: string;
  catWallet: string;
  catKeys: string;
  catOther: string;
  
  // Item Cards
  maskedIdLabel: string;
  protectedPreview: string;
  dualVerificationRequired: string;
  handoverSpot: string;
  claimAndVerify: string;
  provideMatchLead: string;
  shareWhatsApp: string;
  momoEscrowHandover: string;
  
  // Forms & Steps
  wizardStep: string;
  itemCategory: string;
  listingTitle: string;
  docNumberLabel: string;
  itemIdentifierLabel: string;
  locationSection: string;
  provinceLabel: string;
  districtLabel: string;
  sectorLabel: string;
  meetingPointLabel: string;
  rewardOrFeeLabel: string;
  secretPromptLabel: string;
  secretAnswerLabel: string;
  phoneLabel: string;
  uploadPhoto: string;
  termsAgreement: string;
  submitFoundBtn: string;
  submitLostBtn: string;
  submitting: string;
  
  // Verification Modal
  optionA: string;
  optionB: string;
  verifySecretAnswer: string;
  confirmVisualMatch: string;
  requestExtension: string;
  extensionGranted: string;
}

const translations: Record<Language, Translations> = {
  en: {
    navReportFound: "Report Found Item",
    navPostLost: "Post Lost Item",
    navSearchItems: "Search Items",
    navPrivacyAccount: "Privacy & Account",
    
    brandTitle: "Lost & Found",
    brandSubtitle: "Secure Community Registry",
    reportFoundBtn: "Report Found Item",
    postLostBtn: "Post Lost Item",
    searchBtn: "Search Items",
    allListings: "All Listings",
    foundItems: "Found Items",
    lostBounties: "Lost Bounties",
    
    searchPlaceholder: "Search keyword, document title, or masked ref...",
    allDistricts: "All Rwanda Districts",
    allSectors: "All Sectors",
    detectLocation: "Detect Location",
    detectingLocation: "Detecting...",
    locationDetected: "Location detected!",
    resetFilters: "Reset Filters",
    
    catAll: "All Items",
    catNationalId: "National ID",
    catDriverLicense: "Driver's License",
    catPassport: "Passport",
    catWallet: "Wallet",
    catKeys: "Keys",
    catOther: "Other Item",
    
    maskedIdLabel: "Masked ID",
    protectedPreview: "Protected Preview",
    dualVerificationRequired: "Dual Verification Required",
    handoverSpot: "Handover",
    claimAndVerify: "Claim & Verify Ownership",
    provideMatchLead: "Provide Match Lead",
    shareWhatsApp: "Share on WhatsApp",
    momoEscrowHandover: "MoMo Escrow & Handover QR",
    
    wizardStep: "Finder Registry Wizard",
    itemCategory: "Item Category",
    listingTitle: "Listing Title",
    docNumberLabel: "Full Document Number / Serial",
    itemIdentifierLabel: "Item Identifier / Distinct Markings (Optional)",
    locationSection: "Location in Rwanda",
    provinceLabel: "Province",
    districtLabel: "District",
    sectorLabel: "Sector",
    meetingPointLabel: "Safe Meeting Point (e.g. Police Post)",
    rewardOrFeeLabel: "Delivery Fee or Reward (RWF)",
    secretPromptLabel: "Secret Challenge Question (Option A)",
    secretAnswerLabel: "Secret Answer (Kept Hashed)",
    phoneLabel: "Contact Phone (MTN/Airtel)",
    uploadPhoto: "Upload Photo (Auto-Blurred)",
    termsAgreement: "I agree to the Terms of Service and verify that I am legally authorized to post this item.",
    submitFoundBtn: "Report Found Item",
    submitLostBtn: "Post Lost Item Bounty",
    submitting: "Submitting...",
    
    optionA: "Option A: Secret Challenge",
    optionB: "Option B: Visual Check",
    verifySecretAnswer: "Verify Secret Answer (Option A)",
    confirmVisualMatch: "Submit Visual Proof (Option B)",
    requestExtension: "Request 24-Hour Extension",
    extensionGranted: "24-Hour extension granted! Both parties notified via SMS.",
  },
  
  fr: {
    navReportFound: "Signaler un objet trouvé",
    navPostLost: "Publier un objet perdu",
    navSearchItems: "Rechercher des objets",
    navPrivacyAccount: "Confidentialité & Compte",
    
    brandTitle: "Objets Trouvés",
    brandSubtitle: "Registre Communautaire Sécurisé",
    reportFoundBtn: "Signaler un objet trouvé",
    postLostBtn: "Publier un objet perdu",
    searchBtn: "Rechercher des objets",
    allListings: "Toutes les annonces",
    foundItems: "Objets trouvés",
    lostBounties: "Primes d'objets perdus",
    
    searchPlaceholder: "Mot-clé, titre du document ou référence masquée...",
    allDistricts: "Tous les districts du Rwanda",
    allSectors: "Tous les secteurs",
    detectLocation: "Détecter ma position",
    detectingLocation: "Détection en cours...",
    locationDetected: "Position détectée !",
    resetFilters: "Réinitialiser",
    
    catAll: "Tous les objets",
    catNationalId: "Carte d'Identité",
    catDriverLicense: "Permis de Conduire",
    catPassport: "Passeport",
    catWallet: "Portefeuille",
    catKeys: "Clés",
    catOther: "Autre objet",
    
    maskedIdLabel: "ID Masqué",
    protectedPreview: "Aperçu Protégé",
    dualVerificationRequired: "Double vérification requise",
    handoverSpot: "Point de remise",
    claimAndVerify: "Réclamer & Vérifier",
    provideMatchLead: "Signaler une correspondance",
    shareWhatsApp: "Partager sur WhatsApp",
    momoEscrowHandover: "Dépôt MoMo & QR de Remise",
    
    wizardStep: "Assistant de déclaration",
    itemCategory: "Catégorie de l'objet",
    listingTitle: "Titre de l'annonce",
    docNumberLabel: "Numéro de document officiel",
    itemIdentifierLabel: "Identifiant / Signes distinctifs (Optionnel)",
    locationSection: "Localisation au Rwanda",
    provinceLabel: "Province",
    districtLabel: "District",
    sectorLabel: "Secteur",
    meetingPointLabel: "Lieu de rencontre sécurisé (ex: Poste de Police)",
    rewardOrFeeLabel: "Frais de livraison ou Récompense (RWF)",
    secretPromptLabel: "Question secrète de vérification (Option A)",
    secretAnswerLabel: "Réponse secrète (Hachée)",
    phoneLabel: "Numéro de téléphone (MTN/Airtel)",
    uploadPhoto: "Télécharger une photo (Floutage auto)",
    termsAgreement: "J'accepte les conditions d'utilisation et certifie être légalement autorisé à publier cet objet.",
    submitFoundBtn: "Signaler l'objet trouvé",
    submitLostBtn: "Publier la prime d'objet perdu",
    submitting: "Envoi en cours...",
    
    optionA: "Option A: Défi Secret",
    optionB: "Option B: Contrôle Visuel",
    verifySecretAnswer: "Vérifier la réponse secrète (Option A)",
    confirmVisualMatch: "Soumettre une preuve visuelle (Option B)",
    requestExtension: "Demander une prolongation de 24h",
    extensionGranted: "Prolongation de 24h accordée ! Notification envoyée par SMS.",
  },
  
  kyr: {
    navReportFound: "Tanga Icyatoraguwe",
    navPostLost: "Tanga Icyatakaye",
    navSearchItems: "Shakisha Ibintu",
    navPrivacyAccount: "Umutekano & Konti",
    
    brandTitle: "Ibyatoraguwe & Ibyatakaye",
    brandSubtitle: "Urubuga rw'Umutekano rw'Abanyarwanda",
    reportFoundBtn: "Tanga Icyatoraguwe",
    postLostBtn: "Tanga Icyatakaye",
    searchBtn: "Shakisha Ibintu",
    allListings: "Ibyanditswe Byose",
    foundItems: "Ibyatoraguwe",
    lostBounties: "Ibyatakaye bishakishwa",
    
    searchPlaceholder: "Ijambo ribanza, izina ry'icyangombwa, cyangwa nimero y'ibanga...",
    allDistricts: "Uturere Twose tw'u Rwanda",
    allSectors: "Imirenge Yose",
    detectLocation: "Shaka Aho Ndi",
    detectingLocation: "Gushaka...",
    locationDetected: "Aho uri habonetse!",
    resetFilters: "Gusubiramo",
    
    catAll: "Ibintu Byose",
    catNationalId: "Indangamuntu",
    catDriverLicense: "Uruhushya rwo gutwara",
    catPassport: "Pasiporo",
    catWallet: "Ikapu",
    catKeys: "Imfunguzo",
    catOther: "Ikindi Kintu",
    
    maskedIdLabel: "Nimero Ihishe",
    protectedPreview: "Ifoto Irinzwe",
    dualVerificationRequired: "Gusuzuma Nyir'ubwite Birakenewe",
    handoverSpot: "Aho Guhurira",
    claimAndVerify: "Gusaba & Kwemeza Ububasha",
    provideMatchLead: "Gutanga Amakuru",
    shareWhatsApp: "Sangiza kuri WhatsApp",
    momoEscrowHandover: "MoMo Escrow & QR yo Guhererekanya",
    
    wizardStep: "Inzira yo Kwandikisha",
    itemCategory: "Ubwoko bw'Ikintu",
    listingTitle: "Umutwe w'Icyangombwa",
    docNumberLabel: "Nimero y'Icyangombwa Yuzuye",
    itemIdentifierLabel: "Ikiranga cyangwa Ibimenyetso Byihariye (Ku bushake)",
    locationSection: "Aho giherereye mu Rwanda",
    provinceLabel: "Intara",
    districtLabel: "Akarere",
    sectorLabel: "Umurenge",
    meetingPointLabel: "Aho Guhurira Hizewe (urugero: Sitasiyo ya Polisi)",
    rewardOrFeeLabel: "Igihembo cyangwa Amafaranga yo kucyana (RWF)",
    secretPromptLabel: "Ikibazo cy'Ibanga (Uburyo A)",
    secretAnswerLabel: "Igisubizo cy'Ibanga (Gihishe)",
    phoneLabel: "Nimero ya Telefone (MTN/Airtel)",
    uploadPhoto: "Shyiraho Ifoto (Ihindurwa mu ibanga)",
    termsAgreement: "Nemeye Amategeko n'Amabwiriza kandi nemeje ko mfite uburenganzira bwo gutangaza iki kintu.",
    submitFoundBtn: "Kwandikisha Icyatoraguwe",
    submitLostBtn: "Kwandikisha Icyatakaye",
    submitting: "Biri koherezwa...",
    
    optionA: "Uburyo A: Ikibazo cy'Ibanga",
    optionB: "Uburyo B: Gusuzuma Ifoto",
    verifySecretAnswer: "Gusuzuma Igisubizo (Uburyo A)",
    confirmVisualMatch: "Gutanga Ibimenyetso by'Ifoto (Uburyo B)",
    requestExtension: "Saba Kongera Amasaha 24",
    extensionGranted: "Amasaha 24 yongereweho! Ubutumwa bwa SMS bwoherejwe ku mpande zombi.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferred_lang") as Language;
      if (saved && ["en", "fr", "kyr"].includes(saved)) {
        setLanguageState(saved);
      }
    } catch {
      // Storage access fallback
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("preferred_lang", lang);
    } catch {
      // Storage access fallback
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language] || translations.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
