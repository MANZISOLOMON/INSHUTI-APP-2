"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  MapPin, 
  Coins, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  EyeOff, 
  ArrowRight,
  FileText,
  CreditCard,
  KeyRound,
  HelpCircle,
  Shield
} from "lucide-react";
import { RWANDA_LOCATIONS } from "@/lib/rwanda-locations";
import { maskDocumentNumber } from "@/lib/masking";
import { Category } from "@/types/database";

export default function ClaimerBountyForm() {
  const router = useRouter();

  // Form State
  const [category, setCategory] = useState<Category>("PASSPORT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rawDocNumber, setRawDocNumber] = useState("");
  const [rewardAmount, setRewardAmount] = useState("10000");

  // Location Cascading Dropdowns
  const [selectedProvinceName, setSelectedProvinceName] = useState("Kigali City (Umujyi wa Kigali)");
  const [district, setDistrict] = useState("Gasabo");
  const [sector, setSector] = useState("Remera");
  const [lastSeenLandmark, setLastSeenLandmark] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const liveMask = rawDocNumber ? maskDocumentNumber(rawDocNumber) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAgreed) {
      setErrorMsg("You must agree to the Terms of Service and verify legal authorization before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", "LOST");
      formData.append("category", category);
      formData.append("title", title || `Lost ${category.replace("_", " ")} Bounty`);
      formData.append("description", description);
      formData.append("district", district);
      formData.append("sector", sector);
      formData.append("meetingPoint", lastSeenLandmark);
      formData.append("feeOrReward", rewardAmount || "0");
      formData.append("docNumber", rawDocNumber);
      formData.append("contactPhone", contactPhone);

      const res = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to post lost bounty");
      }

      setSuccessMsg("Lost property bounty posted successfully! Matching engine alerted.");
      setTimeout(() => {
        router.push("/search?type=LOST");
      }, 1500);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-card space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-semibold border border-[#FDE68A]">
          <Coins className="w-3.5 h-3.5" />
          <span>Claimer Bounty Form • MoMo Escrow Guaranteed</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A201C] tracking-tight">
          Post a Lost Property Bounty
        </h1>
        <p className="text-xs sm:text-sm text-[#65736B]">
          Incentivize finders, taxi drivers, and community members across Rwanda to return your lost property.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1A201C]">
            What did you lose?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: "NATIONAL_ID", label: "National ID", icon: FileText },
              { id: "DRIVING_LICENSE", label: "Driver's License", icon: CreditCard },
              { id: "PASSPORT", label: "Passport", icon: Shield },
              { id: "WALLET", label: "Wallet", icon: CreditCard },
              { id: "KEYS", label: "Keys", icon: KeyRound },
              { id: "OTHER", label: "Other Item", icon: HelpCircle },
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
                      ? "bg-[#FEF3C7] border-[#D97706] text-[#92400E] ring-1 ring-[#D97706]"
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
            Lost Item Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lost East African Passport near BK Arena"
            className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
          />
        </div>

        {/* Document Number with Masking */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#1A201C]">
              Document Number or Serial
            </label>
            <span className="text-[11px] text-[#65736B] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#1B4D3E]" />
              Safe Zero-Trust Mask
            </span>
          </div>
          <input
            type="text"
            value={rawDocNumber}
            onChange={(e) => setRawDocNumber(e.target.value)}
            placeholder="e.g. PC-8822410 or National ID number"
            className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
          />
          {rawDocNumber && (
            <div className="p-2.5 rounded-xl bg-[#F0F4F1] border border-[#DEEBE5] flex items-center justify-between mt-1.5">
              <span className="text-xs text-[#65736B] flex items-center gap-1.5 font-medium">
                <EyeOff className="w-3.5 h-3.5 text-[#1B4D3E]" />
                Public Registry Mask:
              </span>
              <span className="font-mono text-xs font-bold text-[#1B4D3E] bg-white px-2.5 py-0.5 rounded border border-[#E5E9E4]">
                {liveMask}
              </span>
            </div>
          )}
        </div>

        {/* Location Dropdowns */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1A201C]">
            Last Known Location (Rwanda)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1A201C]">Province</label>
              <select
                value={selectedProvinceName}
                onChange={(e) => handleProvinceSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-medium text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
              >
                {RWANDA_LOCATIONS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1A201C]">District</label>
              <select
                value={district}
                onChange={(e) => handleDistrictSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-medium text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
              >
                {availableDistricts.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1A201C]">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-medium text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
              >
                {availableSectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Last Seen Landmark */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#1A201C]">
            Specific Area / Landmark (Last Seen)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#65736B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lastSeenLandmark}
              onChange={(e) => setLastSeenLandmark(e.target.value)}
              placeholder="e.g. BK Arena Gate 2, Remera Taxi Park, or Amahoro Stadium"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
            />
          </div>
        </div>

        {/* Reward Bounty */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#1A201C]">
              Offered Reward Bounty (RWF)
            </label>
            <span className="badge-escrow">Locked in MoMo Escrow</span>
          </div>
          <input
            type="number"
            min="0"
            step="1000"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            placeholder="e.g. 15000"
            className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 font-mono font-bold text-[#1B4D3E]"
          />
          <p className="text-[11px] text-[#65736B]">
            Finders are motivated by bounties. Funds are secured safely in micro-escrow and released only when you confirm physical receipt via QR scan.
          </p>
        </div>

        {/* Contact Phone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#1A201C]">
            Your Phone Number (For Instant SMS Match Alerts)
          </label>
          <input
            type="tel"
            required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+250 788 123 456"
            className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#1A201C]">
            Item Description & Context
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe any distinguishing marks, date lost, or other context..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
          />
        </div>

        {/* Mandatory Legal & Terms Checkbox */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] flex items-start gap-3">
          <input
            type="checkbox"
            id="claimer-terms-checkbox"
            required
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]/30 accent-[#1B4D3E] cursor-pointer"
          />
          <label htmlFor="claimer-terms-checkbox" className="text-xs text-[#1A201C] cursor-pointer leading-relaxed">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1B4D3E] underline hover:text-[#153D31]">
              Terms of Service
            </a>{" "}
            and verify that I am legally authorized to post this item.
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !termsAgreed}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Publishing Bounty...</span>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                <span>Publish Lost Item Bounty</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

