"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  MapPin, 
  UploadCloud, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  CreditCard,
  KeyRound,
  HelpCircle,
  Sparkles,
  LocateFixed,
  RefreshCw
} from "lucide-react";
import { RWANDA_LOCATIONS } from "@/lib/rwanda-locations";
import { maskDocumentNumber } from "@/lib/masking";
import { Category } from "@/types/database";
import { detectCurrentRwandaLocation } from "@/lib/geolocation";
import { useLanguage } from "@/context/LanguageContext";

export default function FinderUploadForm() {
  const router = useRouter();
  const fileInputId = useId();
  const { t } = useLanguage();

  // Wizard Step (1: Details, 2: Location & Fee, 3: Dual Verification)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [category, setCategory] = useState<Category>("NATIONAL_ID");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rawDocNumber, setRawDocNumber] = useState("");

  // Location Cascading Dropdowns & Auto-Detect
  const [selectedProvinceName, setSelectedProvinceName] = useState("Kigali City (Umujyi wa Kigali)");
  const [district, setDistrict] = useState("Gasabo");
  const [sector, setSector] = useState("Kimironko");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("2000");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  // Dual Verification Setup (Option C)
  const [secretPrompt, setSecretPrompt] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic category helpers
  const isDocType = ["NATIONAL_ID", "DRIVING_LICENSE", "PASSPORT"].includes(category);
  const isKeyOrOther = ["KEYS", "OTHER", "WALLET"].includes(category);

  // Handle Province Change
  const currentProvince = RWANDA_LOCATIONS.find((p) => p.name === selectedProvinceName) || RWANDA_LOCATIONS[0];
  const availableDistricts = currentProvince.districts;
  const currentDistrictObj = availableDistricts.find((d) => d.name === district) || availableDistricts[0];
  const availableSectors = currentDistrictObj ? currentDistrictObj.sectors : [];

  const handleProvinceSelect = (provName: string) => {
    setSelectedProvinceName(provName);
    const p = RWANDA_LOCATIONS.find((loc) => loc.name === provName);
    if (p && p.districts.length > 0) {
      setDistrict(p.districts[0].name);
      if (p.districts[0].sectors.length > 0) {
        setSector(p.districts[0].sectors[0]);
      }
    }
  };

  const handleDistrictSelect = (distName: string) => {
    setDistrict(distName);
    const d = availableDistricts.find((dist) => dist.name === distName);
    if (d && d.sectors.length > 0) {
      setSector(d.sectors[0]);
    }
  };

  // One-Tap Geolocation Auto-Detect
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationSuccessMsg(null);
    setErrorMsg(null);

    try {
      const loc = await detectCurrentRwandaLocation();
      setSelectedProvinceName(loc.province);
      setDistrict(loc.district);
      setSector(loc.sector);
      setLocationSuccessMsg(`Location detected: ${loc.district} › ${loc.sector}`);
      setTimeout(() => setLocationSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(`Could not auto-detect location: ${(err as Error).message}. Please select your location from the dropdowns.`);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const liveMask = rawDocNumber ? maskDocumentNumber(rawDocNumber) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAgreed) {
      setErrorMsg("You must agree to the Terms of Service and verify legal authorization before submitting.");
      return;
    }

    // Strict validation for ID documents
    if (category === "NATIONAL_ID" && rawDocNumber.trim()) {
      const cleaned = rawDocNumber.replace(/[\s-]/g, "");
      if (cleaned.length !== 16 || !cleaned.startsWith("1")) {
        setErrorMsg("Rwandan National ID must be exactly 16 digits starting with '1' (e.g. 1 199X X XXXXXXX X XX).");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", "FOUND");
      formData.append("category", category);
      formData.append("title", title || `Found ${category.replace("_", " ")}`);
      formData.append("description", description);
      formData.append("district", district);
      formData.append("sector", sector);
      formData.append("meetingPoint", meetingPoint);
      formData.append("feeOrReward", deliveryFee || "0");
      formData.append("docNumber", rawDocNumber);
      formData.append("secretPrompt", secretPrompt);
      formData.append("secretAnswer", secretAnswer);
      formData.append("contactPhone", contactPhone);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit found item");
      }

      setSuccessMsg("Found item reported successfully! Zero-Trust blurring and masking applied.");
      setTimeout(() => {
        router.push("/search");
      }, 1500);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-card space-y-6">
      {/* Wizard Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold border border-[#DEEBE5]">
          <Shield className="w-3.5 h-3.5" />
          <span>{t.wizardStep} • Step {currentStep} of 3</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A201C] tracking-tight">
          {t.reportFoundBtn}
        </h1>
        <p className="text-xs sm:text-sm text-[#65736B]">
          Help reunite an owner with their property. Your sensitive inputs are automatically masked and encrypted.
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-2 pt-1 pb-3">
        <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? "bg-[#1B4D3E]" : "bg-[#E5E9E4]"}`} />
        <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? "bg-[#1B4D3E]" : "bg-[#E5E9E4]"}`} />
        <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? "bg-[#1B4D3E]" : "bg-[#E5E9E4]"}`} />
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {locationSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
          <span>{locationSuccessMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: ITEM DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Category selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A201C]">
                {t.itemCategory}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "NATIONAL_ID", label: t.catNationalId, icon: FileText },
                  { id: "DRIVING_LICENSE", label: t.catDriverLicense, icon: CreditCard },
                  { id: "PASSPORT", label: t.catPassport, icon: Shield },
                  { id: "WALLET", label: t.catWallet, icon: CreditCard },
                  { id: "KEYS", label: t.catKeys, icon: KeyRound },
                  { id: "OTHER", label: t.catOther, icon: HelpCircle },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as Category)}
                      className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${
                        isSelected
                          ? "bg-[#EBF3EF] border-[#1B4D3E] text-[#1B4D3E] ring-1 ring-[#1B4D3E]"
                          : "bg-white border-[#E5E9E4] text-[#1A201C] hover:bg-[#F8FAF7]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1A201C]">
                {t.listingTitle}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  category === "KEYS"
                    ? "e.g. Motorcycle TVS Key found at Kacyiru Stage"
                    : category === "WALLET"
                    ? "e.g. Black leather bifold wallet found in Musanze"
                    : "e.g. Rwanda National ID found in Kimironko"
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E]"
              />
            </div>

            {/* DYNAMIC FIELD: Document Number vs Item Identifier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#1A201C]">
                  {isDocType
                    ? category === "NATIONAL_ID"
                      ? "National ID Number (16 Digits)"
                      : category === "PASSPORT"
                      ? "Passport Number (e.g. PC-XXXXXXX)"
                      : "Driver's License Permit Number (e.g. DL-XXXXXXX)"
                    : t.itemIdentifierLabel}
                </label>
                <span className="text-[11px] text-[#65736B] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#1B4D3E]" />
                  Auto-Masked on Server
                </span>
              </div>
              <input
                type="text"
                required={isDocType}
                value={rawDocNumber}
                onChange={(e) => setRawDocNumber(e.target.value)}
                placeholder={
                  category === "NATIONAL_ID"
                    ? "1 199X X XXXXXXX X XX"
                    : category === "PASSPORT"
                    ? "PC-1234567"
                    : category === "DRIVING_LICENSE"
                    ? "DL-2024902"
                    : category === "KEYS"
                    ? "e.g. Set of 3 brass keys with black Toyota remote"
                    : "e.g. Distinct serial, brand, or tag number"
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E]"
              />
              {rawDocNumber && (
                <div className="p-2.5 rounded-xl bg-[#F0F4F1] border border-[#DEEBE5] flex items-center justify-between mt-1.5">
                  <span className="text-xs text-[#65736B] flex items-center gap-1.5 font-medium">
                    <EyeOff className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    Zero-Trust Public Mask:
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1B4D3E] bg-white px-2.5 py-0.5 rounded border border-[#E5E9E4]">
                    {liveMask}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1A201C]">
                Additional Clues & Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention physical condition, keychain tag color, or surrounding spot without revealing secret details..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!title) {
                    setErrorMsg("Please specify a listing title.");
                    return;
                  }
                  if (isDocType && !rawDocNumber.trim()) {
                    setErrorMsg("Please enter the document number.");
                    return;
                  }
                  setErrorMsg(null);
                  setCurrentStep(2);
                }}
                className="btn-primary"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & HANDOVER SPOT */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            {/* Location Header with One-Tap Auto-Detect Button */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-[#E5E9E4]">
              <div>
                <h3 className="text-sm font-bold text-[#1A201C]">{t.locationSection}</h3>
                <p className="text-[11px] text-[#65736B]">Select where you recovered the property</p>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1B4D3E] bg-[#EBF3EF] hover:bg-[#DEEBE5] border border-[#DEEBE5] transition-all cursor-pointer"
                title="Detect current location via browser GPS"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${detectingLocation ? "animate-spin text-[#1B4D3E]" : "text-[#10B981]"}`} />
                <span>{detectingLocation ? t.detectingLocation : t.detectLocation}</span>
              </button>
            </div>

            {/* Cascading Rwanda Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A201C]">{t.provinceLabel}</label>
                <select
                  value={selectedProvinceName}
                  onChange={(e) => handleProvinceSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-medium text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 cursor-pointer"
                >
                  {RWANDA_LOCATIONS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A201C]">{t.districtLabel}</label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-medium text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 cursor-pointer"
                >
                  {availableDistricts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A201C]">{t.sectorLabel}</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-medium text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 cursor-pointer"
                >
                  {availableSectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Safe Handover Meeting Point */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1A201C]">
                {t.meetingPointLabel}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#65736B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  placeholder="e.g. Kimironko Police Post or Sector Headquarters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                />
              </div>
              <p className="text-[11px] text-[#65736B]">
                Always recommend public police stations, bus terminals, or sector offices for safe physical handovers.
              </p>
            </div>

            {/* Delivery Fee Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#1A201C]">
                  {t.rewardOrFeeLabel}
                </label>
                <span className="badge-escrow">MoMo Escrow Protected</span>
              </div>
              <input
                type="number"
                min="0"
                step="500"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
              />
              <p className="text-[11px] text-[#65736B]">
                Compensation for your transport/effort. The owner locks this in Mobile Money escrow and it pays out automatically upon QR handover scan.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-outline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-primary"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DUAL VERIFICATION (OPTION C) */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            {/* Photo Upload with Zero-Trust Visual Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1A201C]">
                {t.uploadPhoto}
              </label>
              <div className="relative border-2 border-dashed border-[#DEEBE5] rounded-2xl p-4 text-center hover:bg-[#F8FAF7] transition-colors">
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor={fileInputId} className="cursor-pointer flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#1B4D3E]">
                    {selectedImage ? selectedImage.name : "Click to take photo or choose file"}
                  </span>
                  <span className="text-[11px] text-[#65736B] mt-0.5">
                    Our serverless Sharp filter will automatically blur sensitive details for public preview.
                  </span>
                </label>

                {imagePreviewUrl && (
                  <div className="mt-4 relative rounded-xl overflow-hidden border border-[#E5E9E4] max-h-48 flex items-center justify-center bg-gray-50">
                    <img
                      src={imagePreviewUrl}
                      alt="Zero-trust blurred preview of uploaded document"
                      className="max-h-48 object-contain filter blur-[4px]"
                    />
                    <div className="absolute inset-0 bg-[#1B4D3E]/20 flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>Zero-Trust Auto-Blur Applied</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Secret Challenge Question (Option A) */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <h4 className="text-xs font-bold text-[#1A201C]">
                  {t.secretPromptLabel}
                </h4>
              </div>
              <p className="text-[11px] text-[#65736B]">
                Set a secret question only the rightful owner can answer (e.g., &quot;What keychain is attached?&quot; or &quot;What is the birth sector on the back?&quot;).
              </p>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={secretPrompt}
                  onChange={(e) => setSecretPrompt(e.target.value)}
                  placeholder="e.g. What color is the lanyard or sticker on the back?"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E9E4] text-xs text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                />
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={secretAnswer}
                  onChange={(e) => setSecretAnswer(e.target.value)}
                  placeholder={t.secretAnswerLabel}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E9E4] text-xs text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                />
              </div>
            </div>

            {/* Finder Contact Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1A201C]">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+250 788 000 000"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
              />
              <p className="text-[11px] text-[#65736B]">
                Your phone is strictly kept private and only notified via SMS when a verified claimer locks funds.
              </p>
            </div>

            {/* Mandatory Legal & Terms Checkbox */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] flex items-start gap-3">
              <input
                type="checkbox"
                id="finder-terms-checkbox"
                required
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]/30 accent-[#1B4D3E] cursor-pointer"
              />
              <label htmlFor="finder-terms-checkbox" className="text-xs text-[#1A201C] cursor-pointer leading-relaxed">
                {t.termsAgreement}
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-outline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-3"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>{t.submitFoundBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
