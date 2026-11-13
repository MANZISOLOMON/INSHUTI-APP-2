"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Filter, 
  Shield, 
  Coins, 
  CheckCircle2, 
  Lock, 
  EyeOff, 
  ArrowRight,
  Layers,
  FileText,
  CreditCard,
  KeyRound,
  RefreshCw,
  AlertCircle,
  QrCode
} from "lucide-react";
import { ALL_DISTRICTS } from "@/lib/rwanda-locations";
import { Item, Category, ItemType } from "@/types/database";
import VerificationModal from "@/components/VerificationModal";
import HandoverQRModal from "@/components/HandoverQRModal";

export default function ItemCatalog({ initialType = "ALL" }: { initialType?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verification Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<Item | null>(null);

  // Escrow & Handover QR Modal State
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [selectedItemForHandover, setSelectedItemForHandover] = useState<Item | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "ALL", label: "All Items", icon: Layers },
    { id: "NATIONAL_ID", label: "National ID", icon: FileText },
    { id: "DRIVING_LICENSE", label: "Driver's License", icon: CreditCard },
    { id: "PASSPORT", label: "Passport", icon: Shield },
    { id: "WALLET", label: "Wallet", icon: CreditCard },
    { id: "KEYS", label: "Keys", icon: KeyRound },
  ];

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedType && selectedType !== "ALL") params.append("type", selectedType);
      if (selectedCategory && selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (searchQuery) params.append("query", searchQuery);

      const res = await fetch(`/api/items?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load catalog items");
      }

      setItems(data.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType, selectedCategory, selectedDistrict]);

  // Debounced search on query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Box */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-5 sm:p-6 shadow-soft space-y-4">
        {/* Type Tabs: All, Found, Lost */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#E5E9E4]">
          <div className="inline-flex p-1 rounded-full bg-[#F8FAF7] border border-[#E5E9E4]">
            {[
              { id: "ALL", label: "All Listings" },
              { id: "FOUND", label: "Found Items" },
              { id: "LOST", label: "Lost Bounties" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedType === tab.id
                    ? "bg-[#1B4D3E] text-white shadow-sm"
                    : "text-[#65736B] hover:text-[#1A201C]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#65736B]">
            <Lock className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span className="hidden sm:inline">Zero-Trust:</span>
            <span>All ID numbers & photos redacted</span>
          </div>
        </div>

        {/* Search Bar & District Selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#65736B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, document title, or masked reference..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] placeholder:text-[#65736B] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-all"
            />
          </div>

          <div className="relative min-w-[200px]">
            <MapPin className="w-4 h-4 text-[#65736B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-full bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-medium text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 transition-all cursor-pointer appearance-none"
            >
              <option value="">All Rwanda Districts</option>
              {ALL_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchItems()}
            className="p-2.5 rounded-full bg-[#EBF3EF] text-[#1B4D3E] hover:bg-[#DEEBE5] transition-all shrink-0 flex items-center justify-center"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#1B4D3E] text-white shadow-sm"
                    : "bg-[#F8FAF7] text-[#65736B] hover:bg-[#EBF3EF] hover:text-[#1B4D3E] border border-[#E5E9E4]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-[#1A201C]">
            {selectedType === "FOUND" ? "Found Items in Registry" : selectedType === "LOST" ? "Lost Property Bounties" : "All Registry Items"}
          </h2>
          <p className="text-xs text-[#65736B]">
            Showing {items.length} verified listings across Rwanda
          </p>
        </div>

        {selectedDistrict && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#EBF3EF] text-[#1B4D3E]">
            <MapPin className="w-3 h-3" />
            <span>District: {selectedDistrict}</span>
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-[#E5E9E4] p-5 space-y-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded-full w-1/3" />
              <div className="h-6 bg-gray-100 rounded-xl w-3/4" />
              <div className="h-28 bg-gray-100 rounded-xl w-full" />
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E9E4] p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1A201C]">No matching items found</h3>
          <p className="text-xs text-[#65736B] max-w-sm mx-auto">
            Try adjusting your search query, clearing the district filter, or switching between Found vs. Lost listings.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedType("ALL");
                setSelectedCategory("ALL");
                setSelectedDistrict("");
                setSearchQuery("");
              }}
              className="btn-outline text-xs"
            >
              Reset Filters
            </button>
            <a href="/report-found" className="btn-primary text-xs">
              Report a Found Item
            </a>
          </div>
        </div>
      )}

      {/* Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isFound = item.type === "FOUND";
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E5E9E4] p-5 shadow-soft hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge: Item Type & Escrow Pill */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isFound
                        ? "bg-[#EBF3EF] text-[#1B4D3E] border border-[#DEEBE5]"
                        : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFound ? "bg-[#1B4D3E]" : "bg-[#D97706]"
                      }`}
                    />
                    {isFound ? "Found Item" : "Lost Bounty"}
                  </span>

                  {item.feeOrReward > 0 && (
                    <span className="badge-escrow">
                      <Coins className="w-3 h-3" />
                      <span>{item.feeOrReward.toLocaleString()} RWF</span>
                    </span>
                  )}
                </div>

                {/* Category & Title */}
                <div className="mb-3">
                  <div className="text-[11px] font-semibold text-[#65736B] uppercase tracking-wider mb-0.5">
                    {item.category.replace("_", " ")}
                  </div>
                  <h3 className="text-base font-bold text-[#1A201C] group-hover:text-[#1B4D3E] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </div>

                {/* Monospace Masked Document Number */}
                {item.maskedDocNumber && (
                  <div className="mb-4 p-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-3.5 h-3.5 text-[#65736B]" />
                      <span className="text-xs text-[#65736B] font-medium">Masked ID:</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#1B4D3E] tracking-wider bg-white px-2 py-0.5 rounded border border-[#E5E9E4]">
                      {item.maskedDocNumber}
                    </span>
                  </div>
                )}

                {/* Zero-Trust Blurred Photo Preview */}
                <div className="relative w-full h-32 rounded-xl bg-[#F0F4F1] border border-dashed border-[#DEEBE5] mb-4 flex flex-col items-center justify-center overflow-hidden">
                  {item.publicBlurredUrl ? (
                    <img
                      src={item.publicBlurredUrl}
                      alt="Zero-Trust Blurred Preview"
                      className="w-full h-full object-cover filter blur-[4px]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <div className="w-8 h-8 rounded-full bg-[#EBF3EF] flex items-center justify-center text-[#1B4D3E] mb-1.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-medium text-[#1A201C]">
                        Protected Preview
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#1B4D3E]/10 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 text-[#1B4D3E] text-[10px] font-bold border border-[#DEEBE5] shadow-xs flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#10B981]" />
                      Dual Verification Required
                    </span>
                  </div>
                </div>

                {/* Location & Meeting Point Details */}
                <div className="space-y-1.5 text-xs text-[#65736B] mb-5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1B4D3E] shrink-0" />
                    <span className="font-medium text-[#1A201C]">
                      {item.sector}, {item.district}
                    </span>
                  </div>
                  {item.meetingPoint && (
                    <p className="text-[11px] text-[#65736B] pl-5 italic line-clamp-1">
                      Handover: {item.meetingPoint}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {item.status === "CLAIMED" ? (
                  <button
                    onClick={() => {
                      setSelectedItemForHandover(item);
                      setHandoverModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#10B981] text-white text-xs font-semibold hover:bg-[#059669] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>MoMo Escrow & Handover QR</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedItemForModal(item);
                      setModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                  >
                    <span>{isFound ? "Claim & Verify Ownership" : "Provide Match Lead"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Verification (Option C) Modal */}
      <VerificationModal
        item={selectedItemForModal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onVerificationSuccess={() => {
          fetchItems();
        }}
        onProceedToEscrow={(item) => {
          setModalOpen(false);
          setSelectedItemForHandover(item);
          setHandoverModalOpen(true);
        }}
      />

      {/* MoMo Escrow Locker & Handover QR Modal */}
      {selectedItemForHandover && (
        <HandoverQRModal
          itemId={selectedItemForHandover.id}
          isOpen={handoverModalOpen}
          onClose={() => setHandoverModalOpen(false)}
          onComplete={() => {
            setHandoverModalOpen(false);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}

