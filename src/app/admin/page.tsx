"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Coins, 
  Clock, 
  RefreshCw, 
  MapPin, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownLeft, 
  KeyRound, 
  UserCheck, 
  FileText,
  Filter,
  Check,
  X
} from "lucide-react";
import { Item, EscrowTransaction } from "@/types/database";

interface DisputeItemEntry {
  item: Item;
  reason: "DISPUTED" | "OVERDUE_48H";
  hoursElapsed: number;
  escrow: EscrowTransaction | null;
}

interface AdminStats {
  totalLockedRwf: number;
  totalReleasedRwf: number;
  totalPlatformFeesRwf: number;
  activeDisputesCount: number;
  totalItemsCount: number;
  escrowsCount: number;
}

export default function AdminDashboardPage() {
  const [adminKey, setAdminKey] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"DISPUTES" | "MODERATION" | "LEDGER">("DISPUTES");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [disputedList, setDisputedList] = useState<DisputeItemEntry[]>([]);
  const [moderationItems, setModerationItems] = useState<Item[]>([]);
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);

  // Raw Image Preview toggle map
  const [showRawMap, setShowRawMap] = useState<Record<string, boolean>>({});

  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");

  const fetchAdminData = async (key: string = adminKey) => {
    if (!key) {
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/overview?adminKey=${encodeURIComponent(key)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsAuthenticated(false);
        sessionStorage.removeItem("admin_session_key");
        throw new Error(data.error || "Authentication failed. Invalid Admin Passkey.");
      }

      setIsAuthenticated(true);
      setAdminKey(key);
      try {
        sessionStorage.setItem("admin_session_key", key);
      } catch {}

      setStats(data.stats);
      setDisputedList(data.disputedAndOverdue || []);
      setModerationItems(data.moderationQueue || []);
      setEscrows(data.escrowLedger || []);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const savedKey = sessionStorage.getItem("admin_session_key");
      if (savedKey) {
        setAdminKey(savedKey);
        fetchAdminData(savedKey);
      }
    } catch {}
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminKey(passkeyInput);
    fetchAdminData(passkeyInput);
  };

  const handleEscrowOverride = async (
    action: "RELEASE_TO_FINDER" | "REFUND_TO_PAYER",
    itemId: string,
    escrowId?: string
  ) => {
    if (!confirm(`Are you sure you want to trigger '${action}' for this item? This action is immediate.`)) {
      return;
    }

    setProcessingId(itemId);
    setActionSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/escrow-override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          action,
          itemId,
          escrowId,
          adminNote: adminNote || "Admin resolution via dispute dashboard.",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to execute ${action}`);
      }

      setActionSuccessMsg(data.message || `Action ${action} completed successfully.`);
      setAdminNote("");
      await fetchAdminData();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
    if (!confirm(`Permanently delete listing '${title}'? This will remove it from the catalog.`)) {
      return;
    }

    setProcessingId(itemId);
    setActionSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/items?itemId=${encodeURIComponent(itemId)}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": adminKey,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete item.");
      }

      setActionSuccessMsg(data.message || "Item deleted successfully.");
      await fetchAdminData();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (itemId: string, newStatus: Item["status"]) => {
    setProcessingId(itemId);
    try {
      const res = await fetch("/api/admin/items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ itemId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update item status.");
      }
      setActionSuccessMsg(`Item status updated to ${newStatus}.`);
      await fetchAdminData();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setProcessingId(null);
    }
  };

  const toggleRawPreview = (itemId: string) => {
    setShowRawMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Login Gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E9E4] p-8 shadow-elevated space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1B4D3E] flex items-center justify-center mx-auto border border-emerald-100">
            <Lock className="w-7 h-7 text-[#1B4D3E]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#1A201C]">Admin Moderation Gate</h2>
            <p className="text-xs text-[#65736B]">
              Enter the authorized administration security key to access the moderation ledger and dispute controls.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-[#1A201C]">Admin Passkey</label>
              <input
                type="password"
                required
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter admin passkey..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <button type="submit" className="w-full btn-primary py-2.5 cursor-pointer">
              <KeyRound className="w-4 h-4" />
              <span>Unlock Moderation Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#1B4D3E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1A201C]">Admin Moderation & Escrow Ledger</h1>
              <span className="badge-escrow text-[10px]">Privileged Mode</span>
            </div>
            <p className="text-xs text-[#65736B] mt-0.5">
              48-hour dispute resolution, zero-trust photo inspection, and MoMo escrow disbursement overrides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => fetchAdminData()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-semibold text-[#1A201C] hover:bg-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#1B4D3E]" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setAdminKey("");
              sessionStorage.removeItem("admin_session_key");
            }}
            className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Lock Admin Session"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Portal</span>
          </button>
        </div>
      </div>

      {/* Action Messages */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-medium">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Financial Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#E5E9E4] p-5 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs text-[#65736B]">
              <span className="font-medium">Total Locked in Escrow</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1A201C]">
              {stats.totalLockedRwf.toLocaleString()} <span className="text-xs font-normal text-[#65736B]">RWF</span>
            </div>
            <p className="text-[11px] text-[#65736B]">Active 48h handover lockers</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E9E4] p-5 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs text-[#65736B]">
              <span className="font-medium">Total Released Payouts</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-[#10B981]">
              {stats.totalReleasedRwf.toLocaleString()} <span className="text-xs font-normal text-[#65736B]">RWF</span>
            </div>
            <p className="text-[11px] text-[#65736B]">Disbursed to finder MoMo wallets</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E9E4] p-5 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs text-[#65736B]">
              <span className="font-medium">Platform Micro-Fees</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1B4D3E] flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1B4D3E]">
              {stats.totalPlatformFeesRwf.toLocaleString()} <span className="text-xs font-normal text-[#65736B]">RWF</span>
            </div>
            <p className="text-[11px] text-[#65736B]">100 RWF flat per lock (SMS gateway)</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E9E4] p-5 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs text-[#65736B]">
              <span className="font-medium">Active Disputes / Overdue</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-red-600">
              {stats.activeDisputesCount}
            </div>
            <p className="text-[11px] text-[#65736B]">Requiring admin intervention</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft max-w-fit">
        <button
          onClick={() => setActiveTab("DISPUTES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "DISPUTES"
              ? "bg-[#1B4D3E] text-white shadow-xs"
              : "text-[#65736B] hover:text-[#1A201C]"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Active Disputes & 48h Overdue ({disputedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("MODERATION")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "MODERATION"
              ? "bg-[#1B4D3E] text-white shadow-xs"
              : "text-[#65736B] hover:text-[#1A201C]"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Listing Moderation Queue ({moderationItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LEDGER")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "LEDGER"
              ? "bg-[#1B4D3E] text-white shadow-xs"
              : "text-[#65736B] hover:text-[#1A201C]"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Escrow Ledger ({escrows.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE DISPUTES & 48H OVERDUE */}
      {activeTab === "DISPUTES" && (
        <div className="space-y-4">
          {disputedList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E5E9E4] p-12 text-center shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1A201C]">No Active Disputes or Overdue Claims</h3>
              <p className="text-xs text-[#65736B] max-w-sm mx-auto">
                All claimed items are within their 48-hour handover window, and no items have been flagged for manual dispute resolution.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputedList.map(({ item, reason, hoursElapsed, escrow }) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-red-200/80 p-6 shadow-soft space-y-4 hover:border-red-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E9E4] pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        reason === "DISPUTED" 
                          ? "bg-red-100 text-red-800 border border-red-200" 
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {reason === "DISPUTED" ? "Flagged Dispute" : `48h Overdue (${hoursElapsed}h elapsed)`}
                      </span>
                      <span className="text-xs text-[#65736B] font-mono">ID: {item.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#65736B]">Escrow Status:</span>
                      <span className="font-mono text-xs font-bold text-[#1B4D3E]">
                        {escrow ? escrow.status : "NO ESCROW LOCKED"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Item Summary */}
                    <div className="space-y-1.5 md:col-span-2">
                      <h4 className="text-base font-bold text-[#1A201C]">{item.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-[#65736B] flex-wrap">
                        <span className="badge-category">{item.category.replace("_", " ")}</span>
                        {item.maskedDocNumber && (
                          <span className="font-mono font-bold text-[#1B4D3E] bg-[#F8FAF7] px-2 py-0.5 rounded border border-[#E5E9E4]">
                            {item.maskedDocNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
                          {item.sector}, {item.district}
                        </span>
                      </div>
                      {item.meetingPoint && (
                        <p className="text-xs text-[#65736B]">
                          Handover Location: <span className="text-[#1A201C] font-medium">{item.meetingPoint}</span>
                        </p>
                      )}
                    </div>

                    {/* Escrow Financial Details */}
                    <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-1.5 text-xs">
                      <div className="text-[11px] font-bold text-[#65736B] uppercase tracking-wider">
                        Locked Amount
                      </div>
                      <div className="text-lg font-bold font-mono text-[#1B4D3E]">
                        {(escrow ? escrow.amount : item.feeOrReward).toLocaleString()} RWF
                      </div>
                      <div className="text-[11px] text-[#65736B]">
                        Platform Fee: 100 RWF (Covered)
                      </div>
                      {escrow?.momoRef && (
                        <div className="text-[10px] font-mono text-[#65736B] truncate">
                          Ref: {escrow.momoRef}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Resolution Override Controls */}
                  <div className="pt-3 border-t border-[#E5E9E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Optional Admin Audit Note (e.g. Verified Police report Kimironko)..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs text-[#1A201C] flex-1 focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEscrowOverride("RELEASE_TO_FINDER", item.id, escrow?.id)}
                        disabled={processingId === item.id}
                        className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Force Release to Finder</span>
                      </button>

                      <button
                        onClick={() => handleEscrowOverride("REFUND_TO_PAYER", item.id, escrow?.id)}
                        disabled={processingId === item.id}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>Refund to Payer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LISTING MODERATION QUEUE */}
      {activeTab === "MODERATION" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5E9E4] p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A201C]">All Registered Items ({moderationItems.length})</h3>
                <p className="text-xs text-[#65736B]">
                  Inspect listings, inspect unblurred original photos, and delete fraudulent submissions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moderationItems.map((item) => {
                const isShowingRaw = !!showRawMap[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E5E9E4] p-4 shadow-soft space-y-3 flex flex-col justify-between hover:border-[#1B4D3E]/30 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.type === "FOUND" ? "bg-emerald-50 text-[#059669]" : "bg-blue-50 text-blue-700"
                        }`}>
                          {item.type} • {item.category.replace("_", " ")}
                        </span>
                        <span className="badge-escrow text-[10px]">{item.status}</span>
                      </div>

                      <h4 className="text-sm font-bold text-[#1A201C] line-clamp-1">{item.title}</h4>

                      {item.maskedDocNumber && (
                        <div className="font-mono text-xs font-bold text-[#1B4D3E] bg-[#F8FAF7] px-2 py-0.5 rounded border border-[#E5E9E4]">
                          {item.maskedDocNumber}
                        </div>
                      )}

                      {/* Photo Inspection Window */}
                      <div className="relative h-36 rounded-xl overflow-hidden bg-gray-100 border border-[#E5E9E4] flex items-center justify-center">
                        {item.publicBlurredUrl || item.privateRawUrl ? (
                          <img
                            src={
                              isShowingRaw && item.privateRawUrl
                                ? item.privateRawUrl
                                : (item.publicBlurredUrl || item.privateRawUrl)
                            }
                            alt={`Administrative inspection photograph of ${item.title}`}
                            className={`w-full h-full object-cover transition-all ${
                              !isShowingRaw && item.publicBlurredUrl ? "filter blur-[4px]" : ""
                            }`}
                          />
                        ) : (
                          <span className="text-xs text-[#65736B]">No image uploaded</span>
                        )}

                        {/* Raw Toggle Pill */}
                        {item.privateRawUrl && (
                          <button
                            type="button"
                            onClick={() => toggleRawPreview(item.id)}
                            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-[10px] font-bold text-[#1B4D3E] border border-[#DEEBE5] shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            {isShowingRaw ? (
                              <>
                                <EyeOff className="w-3 h-3 text-[#1B4D3E]" />
                                <span>Blur Preview</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 text-[#10B981]" />
                                <span>Inspect Raw Original</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-[#65736B]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
                          <span>{item.sector}, {item.district}</span>
                        </div>
                        {item.feeOrReward > 0 && (
                          <div className="text-[#059669] font-medium">
                            Fee/Reward: {item.feeOrReward.toLocaleString()} RWF
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    <div className="pt-2 border-t border-[#E5E9E4] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {item.status === "ACTIVE" && (
                          <button
                            onClick={() => handleToggleStatus(item.id, "DISPUTED")}
                            disabled={processingId === item.id}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200 transition-colors cursor-pointer"
                          >
                            Flag Dispute
                          </button>
                        )}
                        {item.status === "DISPUTED" && (
                          <button
                            onClick={() => handleToggleStatus(item.id, "ACTIVE")}
                            disabled={processingId === item.id}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-[11px] font-semibold border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Clear Dispute
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        disabled={processingId === item.id}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                        title="Delete Fraudulent Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ESCROW LEDGER OVERVIEW */}
      {activeTab === "LEDGER" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1A201C]">MTN MoMo & Airtel Money Escrow Ledger</h3>
                <p className="text-xs text-[#65736B]">
                  Real-time audit log of locked collections, released payouts, and platform micro-fees.
                </p>
              </div>
            </div>

            {escrows.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#65736B]">
                No escrow transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E9E4] bg-[#F8FAF7] text-[#65736B]">
                      <th className="py-3 px-4 font-semibold">Tx ID</th>
                      <th className="py-3 px-4 font-semibold">Item ID</th>
                      <th className="py-3 px-4 font-semibold">Amount (RWF)</th>
                      <th className="py-3 px-4 font-semibold">Platform Fee</th>
                      <th className="py-3 px-4 font-semibold">Total Locked</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">MoMo Ref</th>
                      <th className="py-3 px-4 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E9E4]">
                    {escrows.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#F8FAF7]/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#1A201C]">{tx.id}</td>
                        <td className="py-3 px-4 font-mono text-[#65736B]">{tx.itemId}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1B4D3E]">
                          {tx.amount.toLocaleString()} RWF
                        </td>
                        <td className="py-3 px-4 font-mono text-[#65736B]">
                          {(tx.platformFee || 100).toLocaleString()} RWF
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#10B981]">
                          {(tx.totalLocked || tx.amount + 100).toLocaleString()} RWF
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === "LOCKED"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : tx.status === "RELEASED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#65736B] truncate max-w-xs">
                          {tx.momoRef}
                        </td>
                        <td className="py-3 px-4 text-[#65736B]">
                          {tx.createdAt ? new Date(tx.createdAt as string).toLocaleDateString() : "Just now"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

