"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Package, 
  Handshake, 
  Wallet, 
  Settings, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  QrCode, 
  Camera, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  Phone, 
  User, 
  LogOut, 
  Lock, 
  Coins, 
  Bell, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  RefreshCw,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Item, Verification, EscrowTransaction, HandoverSession } from "@/types/database";
import { ExtendedHandoverSession } from "@/lib/escrow-store";
import HandoverQRModal from "@/components/HandoverQRModal";

interface EnrichedHandover {
  item: Item;
  verification: Verification | null;
  handoverSession: ExtendedHandoverSession | null;
  escrow?: EscrowTransaction;
}

interface UserDashboardData {
  listings: Item[];
  handovers: EnrichedHandover[];
  escrows: EscrowTransaction[];
  wallet: {
    lockedBalance: number;
    releasedBalance: number;
    totalTransactions: number;
  };
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "items";

  const { user, loading: authLoading, openAuthModal, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"items" | "handovers" | "wallet" | "settings">(
    ["items", "handovers", "wallet", "settings"].includes(initialTab)
      ? (initialTab as "items" | "handovers" | "wallet" | "settings")
      : "items"
  );

  // Sync tab with URL query param
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["items", "handovers", "wallet", "settings"].includes(tabParam)) {
      setActiveTab(tabParam as "items" | "handovers" | "wallet" | "settings");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "items" | "handovers" | "wallet" | "settings") => {
    setActiveTab(tab);
    router.push(`/dashboard?tab=${tab}`, { scroll: false });
  };

  // Dashboard Data State
  const [loadingData, setLoadingData] = useState(true);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Action Modals State
  const [editModalItem, setEditModalItem] = useState<Item | null>(null);
  const [newDescription, setNewDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handover QR Modal State
  const [qrModalItemId, setQrModalItemId] = useState<string | null>(null);
  const [qrModalRole, setQrModalRole] = useState<"FINDER" | "CLAIMER">("FINDER");

  // Wallet State
  const [payoutPhone, setPayoutPhone] = useState(user?.phone || "+250788000000");
  const [payoutProvider, setPayoutProvider] = useState<"MTN" | "AIRTEL">("MTN");
  const [walletSaved, setWalletSaved] = useState(false);

  // Handover Fallback Code State (Claimer inputs)
  const [manualCodeInput, setManualCodeInput] = useState<Record<string, string>>({});
  const [manualCodeSubmitting, setManualCodeSubmitting] = useState<Record<string, boolean>>({});
  const [manualCodeError, setManualCodeError] = useState<Record<string, string>>({});

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Privacy & Settings State
  const [smsAutoMatch, setSmsAutoMatch] = useState(true);
  const [smsEscrowStatus, setSmsEscrowStatus] = useState(true);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [purgingAccount, setPurgingAccount] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    if (user?.phone) {
      setPayoutPhone(user.phone);
    }
    try {
      const savedAutoMatch = localStorage.getItem("pref_sms_automatch");
      if (savedAutoMatch !== null) setSmsAutoMatch(savedAutoMatch === "true");
      const savedEscrowSms = localStorage.getItem("pref_sms_escrow");
      if (savedEscrowSms !== null) setSmsEscrowStatus(savedEscrowSms === "true");
      const savedPayoutPhone = localStorage.getItem("pref_payout_phone");
      if (savedPayoutPhone) setPayoutPhone(savedPayoutPhone);
      const savedPayoutProv = localStorage.getItem("pref_payout_provider");
      if (savedPayoutProv === "AIRTEL" || savedPayoutProv === "MTN") setPayoutProvider(savedPayoutProv);
    } catch {}
  }, [user]);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const res = await fetch(`/api/user/items?phone=${encodeURIComponent(user.phone)}&uid=${encodeURIComponent(user.uid)}`);
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Guard: if unauthenticated, show prompt to sign in
  if (!authLoading && !user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-8 h-8 text-[#1B4D3E]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1A201C] tracking-tight">
            Authentication Required
          </h1>
          <p className="text-sm text-[#65736B]">
            Sign in with your Rwandan phone number (+250) to access your listings, incoming claims, MoMo payout wallet, and data settings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openAuthModal(() => fetchDashboardData())}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1B4D3E] text-white text-sm font-semibold hover:bg-[#153D31] shadow-soft cursor-pointer transition-all"
          >
            Sign In with Phone OTP
          </button>
          <Link
            href="/search"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-[#1A201C] border border-[#E5E9E4] text-sm font-medium hover:bg-[#F8FAF7] transition-all"
          >
            Browse Public Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Quick Action: Mark as Resolved
  const handleMarkResolved = async (itemId: string) => {
    try {
      const res = await fetch("/api/user/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, status: "RESOLVED" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: "Listing marked as RESOLVED! Thank you for recovering property.", type: "success" });
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStatusMessage({ text: (err as Error).message || "Failed to update item", type: "error" });
    }
  };

  // Quick Action: Save Edited Description
  const handleSaveDescription = async () => {
    if (!editModalItem) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/user/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: editModalItem.id, description: newDescription }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: "Listing description updated successfully.", type: "success" });
        setEditModalItem(null);
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStatusMessage({ text: (err as Error).message || "Failed to update description", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Action: Delete Listing
  const handleDeleteListing = async () => {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/user/items?itemId=${deleteConfirmItem.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: "Listing permanently deleted from the registry.", type: "success" });
        setDeleteConfirmItem(null);
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStatusMessage({ text: (err as Error).message || "Failed to delete listing", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Action: Approve Handover
  const handleApproveHandover = async (itemId: string) => {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, option: "APPROVE" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: "Verification approved! Handover session is active.", type: "success" });
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStatusMessage({ text: (err as Error).message || "Approval failed", type: "error" });
    }
  };

  // Quick Action: Reject Claim
  const handleRejectClaim = async (itemId: string) => {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, option: "REJECT" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: "Claim rejected. Listing remains active.", type: "success" });
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStatusMessage({ text: (err as Error).message || "Rejection failed", type: "error" });
    }
  };

  // Quick Action: Verify 6-Digit Fallback Code (Claimer)
  const handleVerifyFallbackCode = async (itemId: string) => {
    const code = manualCodeInput[itemId]?.trim();
    if (!code || code.length !== 6) {
      setManualCodeError((prev) => ({ ...prev, [itemId]: "Please enter the 6-digit code." }));
      return;
    }

    setManualCodeSubmitting((prev) => ({ ...prev, [itemId]: true }));
    setManualCodeError((prev) => ({ ...prev, [itemId]: "" }));

    try {
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, tokenOrCode: code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification failed.");
      }
      setStatusMessage({
        text: "Handover check-in verified! MoMo escrow payout released.",
        type: "success",
      });
      fetchDashboardData();
    } catch (err) {
      setManualCodeError((prev) => ({ ...prev, [itemId]: (err as Error).message }));
    } finally {
      setManualCodeSubmitting((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Settings: Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword || !newPassword) {
      setPasswordFeedback({ text: "Please enter your current and new password.", type: "error" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({ text: "New password must be at least 8 characters.", type: "error" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordFeedback({ text: "New passwords do not match.", type: "error" });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user?.phone,
          userId: user?.uid,
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update password.");
      }
      setPasswordFeedback({ text: "Password updated successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordFeedback({ text: (err as Error).message, type: "error" });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Quick Action: Request 24h Extension
  const handleRequestExtension = async (itemId: string) => {
    try {
      const res = await fetch("/api/escrow/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, reason: "Meetup postponed" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: "24-Hour extension granted! Both parties notified via SMS.", type: "success" });
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStatusMessage({ text: (err as Error).message || "Extension request failed", type: "error" });
    }
  };

  // Wallet: Save payout preferences
  const handleSavePayoutWallet = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("pref_payout_phone", payoutPhone);
      localStorage.setItem("pref_payout_provider", payoutProvider);
      setWalletSaved(true);
      setTimeout(() => setWalletSaved(false), 3000);
      setStatusMessage({ text: "Payout mobile money wallet updated successfully.", type: "success" });
    } catch {}
  };

  // Settings: Toggle SMS settings
  const handleToggleAutoMatch = (val: boolean) => {
    setSmsAutoMatch(val);
    try {
      localStorage.setItem("pref_sms_automatch", String(val));
    } catch {}
  };

  const handleToggleEscrowSms = (val: boolean) => {
    setSmsEscrowStatus(val);
    try {
      localStorage.setItem("pref_sms_escrow", String(val));
    } catch {}
  };

  // Settings: Delete Account & Purge Data
  const handlePurgeAccount = async () => {
    setPurgingAccount(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user?.phone,
          userId: user?.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPurgeSuccess(data.message || "Account data purged successfully.");
        setDeleteAccountModal(false);
        logout();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStatusMessage({ text: (err as Error).message || "Failed to purge account data", type: "error" });
    } finally {
      setPurgingAccount(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF3EF] border border-[#DEEBE5] flex items-center justify-center p-2 text-[#1B4D3E] shadow-2xs">
            <Image 
              src="/shield-icon.png" 
              alt="Found IN" 
              width={40} 
              height={40} 
              className="object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A201C] tracking-tight">
                My Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-bold font-mono">
                {user?.phone}
              </span>
            </div>
            <p className="text-xs text-[#65736B] mt-0.5">
              Found IN Rwanda • Your Secure Recovery Solution & Property Portal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/report-found"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] shadow-2xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </Link>
          <Link
            href="/post-lost"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold hover:bg-[#DEEBE5] transition-all cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Post Lost</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Global Status Message Toast */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 ${
          statusMessage.type === "success" 
            ? "bg-[#EBF3EF] text-[#1B4D3E] border border-[#DEEBE5]" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Navigation Tabs (Touch Target 44px min height) */}
      <div className="flex items-center gap-2 border-b border-[#E5E9E4] overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabChange("items")}
          className={`flex items-center min-h-[44px] gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "items"
              ? "bg-[#1B4D3E] text-white shadow-xs"
              : "text-[#4A5568] hover:text-[#1A201C] hover:bg-[#F8FAF7]"
          }`}
        >
          <Package className="w-4 h-4 stroke-[1.75]" />
          <span>My Active Listings</span>
          {dashboardData && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "items" ? "bg-white/20 text-white" : "bg-[#EBF3EF] text-[#1B4D3E]"
            }`}>
              {dashboardData.listings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("handovers")}
          className={`flex items-center min-h-[44px] gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "handovers"
              ? "bg-[#1B4D3E] text-white shadow-xs"
              : "text-[#4A5568] hover:text-[#1A201C] hover:bg-[#F8FAF7]"
          }`}
        >
          <Handshake className="w-4 h-4 stroke-[1.75]" />
          <span>Claims & Handovers</span>
          {dashboardData && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "handovers" ? "bg-white/20 text-white" : "bg-[#EBF3EF] text-[#1B4D3E]"
            }`}>
              {dashboardData.handovers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("wallet")}
          className={`flex items-center min-h-[44px] gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "wallet"
              ? "bg-[#1B4D3E] text-white shadow-xs"
              : "text-[#4A5568] hover:text-[#1A201C] hover:bg-[#F8FAF7]"
          }`}
        >
          <Wallet className="w-4 h-4 stroke-[1.75]" />
          <span>MoMo Escrow Wallet</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("settings")}
          className={`flex items-center min-h-[44px] gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-[#1B4D3E] text-white shadow-xs"
              : "text-[#4A5568] hover:text-[#1A201C] hover:bg-[#F8FAF7]"
          }`}
        >
          <Settings className="w-4 h-4 stroke-[1.75]" />
          <span>Account & Privacy Settings</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {loadingData ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#65736B]">Loading authenticated registry data...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: MY ACTIVE LISTINGS */}
          {activeTab === "items" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1A201C]">
                    Your Registered Listings ({dashboardData?.listings.length || 0})
                  </h2>
                  <p className="text-xs text-[#65736B]">
                    Items posted under your verified account with real-time status tracking and quick actions.
                  </p>
                </div>
                <Link
                  href="/report-found"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post New Item</span>
                </Link>
              </div>

              {(!dashboardData || dashboardData.listings.length === 0) ? (
                <div className="p-12 bg-white rounded-3xl border border-[#E5E9E4] text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8FAF7] text-[#65736B] flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A201C]">No active listings found</h3>
                  <p className="text-xs text-[#65736B] max-w-sm mx-auto">
                    You haven&apos;t posted any found items or lost property bounties yet. Help your community recover documents today.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <Link
                      href="/report-found"
                      className="px-5 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold"
                    >
                      Report Found Property
                    </Link>
                    <Link
                      href="/post-lost"
                      className="px-5 py-2.5 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold"
                    >
                      Post Lost Bounty
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.listings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-[#E5E9E4] p-5 shadow-soft space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                            item.type === "FOUND" 
                              ? "bg-[#EBF3EF] text-[#1B4D3E]" 
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {item.type}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "ACTIVE" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : item.status === "CLAIMED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : item.status === "RESOLVED"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-[#1A201C] line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-[#65736B] line-clamp-2 mt-1">
                            {item.description || "No specific details provided."}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[#65736B]">
                            <span>Masked ID:</span>
                            <span className="font-mono font-bold text-[#1B4D3E]">{item.maskedDocNumber || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between text-[#65736B]">
                            <span>Location:</span>
                            <span className="font-medium text-[#1A201C]">{item.sector}, {item.district}</span>
                          </div>
                          <div className="flex items-center justify-between text-[#65736B]">
                            <span>Reward/Fee:</span>
                            <span className="font-bold text-[#10B981]">{(item.feeOrReward || 0).toLocaleString()} RWF</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-3 border-t border-[#F8FAF7] flex flex-wrap items-center justify-between gap-2">
                        {item.status !== "RESOLVED" && (
                          <button
                            type="button"
                            onClick={() => handleMarkResolved(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold cursor-pointer transition-colors"
                            title="Mark this item as safely recovered"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setEditModalItem(item);
                              setNewDescription(item.description || "");
                            }}
                            className="p-1.5 rounded-full text-[#65736B] hover:text-[#1B4D3E] hover:bg-[#F8FAF7] transition-colors cursor-pointer"
                            title="Edit description"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            className="p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING CLAIMS & HANDOVERS */}
          {activeTab === "handovers" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#1A201C]">
                  Active Claims & Secure Handover Sessions ({dashboardData?.handovers.length || 0})
                </h2>
                <p className="text-xs text-[#65736B]">
                  Review incoming ownership proofs, verify claims, display dynamic QR codes, or scan to release MoMo escrow.
                </p>
              </div>

              {(!dashboardData || dashboardData.handovers.length === 0) ? (
                <div className="p-12 bg-white rounded-3xl border border-[#E5E9E4] text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8FAF7] text-[#65736B] flex items-center justify-center mx-auto">
                    <Handshake className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A201C]">No pending claims or active handovers</h3>
                  <p className="text-xs text-[#65736B] max-w-sm mx-auto">
                    When someone claims your found property or you verify a lost bounty, active handover checkpoints appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.handovers.map(({ item, verification, handoverSession, escrow }) => {
                    const isFinder = Boolean(
                      user && (
                        (item.finderId && item.finderId === user.uid) ||
                        ((item as unknown as { contactPhone?: string }).contactPhone === user.phone)
                      )
                    );
                    const isClaimer = !isFinder;
                    const isResolved = item.status === "RESOLVED";

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F8FAF7] pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-[#1A201C]">{item.title}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                isResolved
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}>
                                {item.status}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF3EF] text-[#1B4D3E]">
                                {isFinder ? "Role: Finder" : "Role: Claimer"}
                              </span>
                            </div>
                            <p className="text-xs text-[#4A5568] mt-0.5">
                              Location: {item.sector}, {item.district} • Meeting Point: {item.meetingPoint || "Official Sector Police Post"}
                            </p>
                          </div>

                          {escrow && (
                            <div className="flex items-center gap-3 bg-[#EBF3EF] px-4 py-2 rounded-2xl border border-[#DEEBE5]">
                              <Coins className="w-5 h-5 text-[#10B981]" />
                              <div>
                                <p className="text-[10px] font-bold text-[#4A5568] uppercase">Locked Escrow</p>
                                <p className="font-bold text-sm text-[#1B4D3E]">
                                  {escrow.amount.toLocaleString()} RWF
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* DIGITAL HANDOVER RECEIPT (Appears once marked RESOLVED) */}
                        {isResolved && (
                          <div className="p-5 rounded-2xl bg-[#EBF3EF]/60 border border-[#DEEBE5] space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                                <span>Digital Handover Summary &amp; Escrow Release Receipt</span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                                {escrow?.momoRef || "MOMO_VERIFIED"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-[#DEEBE5]">
                              <div>
                                <span className="text-[10px] text-[#4A5568] block uppercase font-bold">Sector Post</span>
                                <span className="font-semibold text-[#1A201C]">
                                  {item.district} › {item.sector} ({item.meetingPoint || "Sector Police Post"})
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-[#4A5568] block uppercase font-bold">Masked Item Reference</span>
                                <span className="font-mono font-bold text-[#1B4D3E]">
                                  {item.maskedDocNumber || item.id}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-[#4A5568] block uppercase font-bold">Escrow Payout Disbursed</span>
                                <span className="font-bold text-emerald-700">
                                  {(escrow?.amount || 0).toLocaleString()} RWF (+{escrow?.platformFee || 100} RWF fee)
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`--- FOUND IN OFFICIAL HANDOVER RECEIPT ---\nItem: ${item.title}\nRef: ${item.maskedDocNumber || item.id}\nLocation: ${item.district} › ${item.sector}\nMoMo Ref: ${escrow?.momoRef || "VERIFIED"}\nAmount: ${escrow?.amount || 0} RWF\nPlatform Micro-Fee: ${escrow?.platformFee || 100} RWF\nStatus: RESOLVED & DISBURSED\nDigital Elevation Solutions, Kigali`);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#DEEBE5] text-[#1B4D3E] hover:bg-[#F8FAF7] text-xs font-semibold cursor-pointer shadow-2xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Print / Save Receipt</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* FINDER VIEW: Mandatory Manual Verification Inspection Queue */}
                        {isFinder && verification?.visualReviewPending && !isResolved && (
                          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span>Mandatory Review: Inspect Claimer&apos;s Submitted Ownership Proof</span>
                            </div>
                            
                            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1.5">
                              {verification.proofDetails?.fullName && (
                                <p><strong className="text-amber-900">Full Name on Document:</strong> <span className="font-mono text-[#1A201C]">{verification.proofDetails.fullName}</span></p>
                              )}
                              {verification.proofDetails?.dateOfBirth && (
                                <p><strong className="text-amber-900">Date of Birth:</strong> <span className="font-mono text-[#1A201C]">{verification.proofDetails.dateOfBirth}</span></p>
                              )}
                              {verification.proofDetails?.serialEnding && (
                                <p><strong className="text-amber-900">Serial Ending / Number:</strong> <span className="font-mono text-[#1A201C]">{verification.proofDetails.serialEnding}</span></p>
                              )}
                              {verification.proofDetails?.markings && (
                                <p><strong className="text-amber-900">Unique Physical Markings:</strong> <span className="text-[#1A201C]">{verification.proofDetails.markings}</span></p>
                              )}
                              {verification.proofDetails?.challengeAnswer && (
                                <p><strong className="text-amber-900">Challenge Question Answer:</strong> <span className="font-mono text-[#1A201C]">{verification.proofDetails.challengeAnswer}</span></p>
                              )}
                              {!verification.proofDetails && (
                                <p className="italic text-[#4A5568]">{verification.visualProofText || "Written proof submitted for review."}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleApproveHandover(item.id)}
                                className="px-5 py-2 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153D31] cursor-pointer shadow-xs"
                              >
                                Approve Verification
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectClaim(item.id)}
                                className="px-5 py-2 rounded-full bg-white text-red-600 border border-red-200 text-xs font-bold hover:bg-red-50 cursor-pointer"
                              >
                                Reject Claim
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ROLE-AWARE HANDOVER CONTROLS */}
                        {!isResolved && (
                          <div className="space-y-4 pt-1">
                            {isFinder ? (
                              /* FINDER CONTROLS: Show QR Code + Manual 6-Digit Fallback */
                              <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#DEEBE5] space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-[#1A201C]">Finder Handover Verification Checkpoint</h4>
                                    <p className="text-[11px] text-[#4A5568]">
                                      Present your QR code or 6-digit fallback code to the claimer at the sector post.
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQrModalItemId(item.id);
                                      setQrModalRole("FINDER");
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153D31] shadow-soft cursor-pointer transition-all"
                                  >
                                    <QrCode className="w-4 h-4" />
                                    <span>Display Finder QR Code</span>
                                  </button>
                                </div>

                                {/* Prominent Manual 6-Digit Fallback Code Display */}
                                <div className="p-3.5 bg-white rounded-xl border border-[#DEEBE5] flex items-center justify-between flex-wrap gap-3">
                                  <div>
                                    <span className="text-[10px] font-bold text-[#4A5568] uppercase block">
                                      Manual 6-Digit Fallback Code
                                    </span>
                                    <span className="text-lg font-mono font-extrabold tracking-widest text-[#1B4D3E]">
                                      {handoverSession?.fallbackCode || "353083"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#4A5568] max-w-xs italic">
                                    Use if claimer camera is unavailable or damaged.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              /* CLAIMER CONTROLS: PWA Camera Scanner + 6-Digit Input Form */
                              <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#DEEBE5] space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-[#1A201C]">Claimer Check-In &amp; Escrow Release</h4>
                                    <p className="text-[11px] text-[#4A5568]">
                                      Scan the finder&apos;s QR code or enter their 6-digit backup code to release payout.
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQrModalItemId(item.id);
                                      setQrModalRole("CLAIMER");
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10B981] text-white text-xs font-bold hover:bg-[#059669] shadow-soft cursor-pointer transition-all"
                                  >
                                    <Camera className="w-4 h-4" />
                                    <span>Launch QR Camera Scanner</span>
                                  </button>
                                </div>

                                {/* 6-Digit Fallback Code Input Form with Brute-Force Lockout */}
                                <div className="p-3.5 bg-white rounded-xl border border-[#DEEBE5] space-y-2">
                                  <label className="block text-xs font-semibold text-[#1A201C]">
                                    Enter Finder&apos;s 6-Digit Fallback Code
                                  </label>
                                  <div className="flex items-center gap-2 max-w-sm">
                                    <input
                                      type="text"
                                      maxLength={6}
                                      value={manualCodeInput[item.id] || ""}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setManualCodeInput((prev) => ({ ...prev, [item.id]: val }));
                                      }}
                                      placeholder="••••••"
                                      className="w-36 px-3 py-2 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-center font-mono text-base font-bold tracking-widest text-[#1A201C] focus:outline-none focus:border-[#1B4D3E]"
                                    />
                                    <button
                                      type="button"
                                      disabled={manualCodeSubmitting[item.id] || (manualCodeInput[item.id] || "").length !== 6}
                                      onClick={() => handleVerifyFallbackCode(item.id)}
                                      className="px-4 py-2 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153D31] cursor-pointer disabled:opacity-40 transition-colors"
                                    >
                                      {manualCodeSubmitting[item.id] ? "Verifying..." : "Verify Code"}
                                    </button>
                                  </div>
                                  {manualCodeError[item.id] && (
                                    <p className="text-[11px] text-red-600 font-medium">
                                      {manualCodeError[item.id]}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-[#4A5568]">
                                    Protected by 5-attempt brute-force lock (15-minute lockout).
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Request 24h Extension Trigger */}
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleRequestExtension(item.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#DEEBE5] text-[#4A5568] hover:text-[#1A201C] hover:bg-[#F8FAF7] text-xs font-medium cursor-pointer transition-all"
                                title="Extend the 48-hour handover timer if delayed"
                              >
                                <Clock className="w-3.5 h-3.5 text-[#1B4D3E]" />
                                <span>Request 24-Hour Extension</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MOMO ESCROW & PAYOUT WALLET */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#1A201C]">
                  Mobile Money Escrow & Payout Wallet
                </h2>
                <p className="text-xs text-[#65736B]">
                  Manage your preferred payout numbers (MTN MoMo or Airtel Money), inspect active locked balances, and download receipts.
                </p>
              </div>

              {/* Wallet Balances Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-2">
                  <div className="flex items-center justify-between text-[#65736B]">
                    <span className="text-xs font-semibold uppercase tracking-wider">Locked in Escrow</span>
                    <Lock className="w-4 h-4 text-[#1B4D3E]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#1A201C]">
                    {(dashboardData?.wallet.lockedBalance || 0).toLocaleString()} <span className="text-xs font-semibold text-[#65736B]">RWF</span>
                  </p>
                  <p className="text-[11px] text-[#65736B]">Secured under dual QR verification</p>
                </div>

                <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-2">
                  <div className="flex items-center justify-between text-[#65736B]">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Released Payouts</span>
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#10B981]">
                    {(dashboardData?.wallet.releasedBalance || 0).toLocaleString()} <span className="text-xs font-semibold text-[#65736B]">RWF</span>
                  </p>
                  <p className="text-[11px] text-[#65736B]">Disbursed directly to MoMo wallets</p>
                </div>

                <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-2">
                  <div className="flex items-center justify-between text-[#65736B]">
                    <span className="text-xs font-semibold uppercase tracking-wider">Platform Micro-Fee</span>
                    <Coins className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#1A201C]">
                    100 <span className="text-xs font-semibold text-[#65736B]">RWF / Tx</span>
                  </p>
                  <p className="text-[11px] text-[#65736B]">Covers cellular SMS gateway routing</p>
                </div>
              </div>

              {/* Set Payout Number Form */}
              <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-5">
                <div className="border-b border-[#F8FAF7] pb-3">
                  <h3 className="text-sm font-bold text-[#1A201C]">Preferred Payout Account</h3>
                  <p className="text-xs text-[#65736B]">
                    When an owner scans your handover QR code, reward funds disburse instantly to this Rwandan account.
                  </p>
                </div>

                <form onSubmit={handleSavePayoutWallet} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A201C] mb-2">
                      Telecom Network
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-semibold text-[#1A201C] cursor-pointer">
                        <input
                          type="radio"
                          name="provider"
                          value="MTN"
                          checked={payoutProvider === "MTN"}
                          onChange={() => setPayoutProvider("MTN")}
                          className="accent-[#1B4D3E]"
                        />
                        <span>MTN Mobile Money (MoMo)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-[#1A201C] cursor-pointer">
                        <input
                          type="radio"
                          name="provider"
                          value="AIRTEL"
                          checked={payoutProvider === "AIRTEL"}
                          onChange={() => setPayoutProvider("AIRTEL")}
                          className="accent-[#1B4D3E]"
                        />
                        <span>Airtel Money</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                      Registered Phone Number (E.164)
                    </label>
                    <input
                      type="tel"
                      value={payoutPhone}
                      onChange={(e) => setPayoutPhone(e.target.value)}
                      placeholder="+250 78X XXX XXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-mono text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] cursor-pointer shadow-soft transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save & Verify Payout Number</span>
                  </button>
                  {walletSaved && (
                    <span className="text-xs font-semibold text-[#10B981] ml-3 animate-fade-in">
                      Saved!
                    </span>
                  )}
                </form>
              </div>

              {/* Transactions Table & Receipts */}
              <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-[#F8FAF7] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A201C]">Escrow Transactions & Receipts</h3>
                    <p className="text-xs text-[#65736B]">Audited server logs and printable MoMo release vouchers.</p>
                  </div>
                </div>

                {(!dashboardData || dashboardData.escrows.length === 0) ? (
                  <p className="text-xs text-[#65736B] py-6 text-center">No escrow transactions recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#E5E9E4] text-[#65736B]">
                          <th className="py-2 font-semibold">Reference</th>
                          <th className="py-2 font-semibold">Status</th>
                          <th className="py-2 font-semibold">Amount</th>
                          <th className="py-2 font-semibold">Platform Fee</th>
                          <th className="py-2 font-semibold text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F8FAF7]">
                        {dashboardData.escrows.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[#F8FAF7]">
                            <td className="py-3 font-mono text-[11px] text-[#1A201C]">{tx.momoRef || tx.id}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.status === "RELEASED" 
                                  ? "bg-emerald-50 text-emerald-700" 
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 font-bold text-[#1B4D3E]">{tx.amount.toLocaleString()} RWF</td>
                            <td className="py-3 text-[#65736B]">{tx.platformFee} RWF</td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`--- FOUND IN OFFICIAL RECEIPT ---\nReference: ${tx.momoRef || tx.id}\nItem: ${tx.itemId}\nAmount: ${tx.amount} RWF\nPlatform Fee: ${tx.platformFee} RWF\nStatus: ${tx.status}\nOperator: Digital Elevation Solutions, Kigali`);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] hover:bg-[#DEEBE5] text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>Receipt</span>
                              </button>
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

          {/* TAB 4: ACCOUNT & PRIVACY SETTINGS (Rwanda Law No. 058/2021) */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#1A201C]">
                  Account & Privacy Settings
                </h2>
                <p className="text-xs text-[#65736B]">
                  Manage your personal records, notification preferences, and statutory data rights under Rwanda Law No. 058/2021.
                </p>
              </div>

              {purgeSuccess ? (
                <div className="p-8 rounded-3xl bg-white border border-[#E5E9E4] shadow-soft space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF3EF] text-[#10B981] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A201C]">Account Purged Successfully</h3>
                  <p className="text-xs text-[#65736B] max-w-md mx-auto leading-relaxed">
                    {purgeSuccess}
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31]"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Citizen Profile Card */}
                  <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F8FAF7] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1A201C]">Citizen Account Profile</h3>
                          <p className="text-[11px] text-[#65736B]">Verified Firebase Phone OTP Session</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF3EF] text-[#1B4D3E]">
                        Active User
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                      <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-1">
                        <p className="text-[10px] font-bold uppercase text-[#4A5568]">Authenticated Phone</p>
                        <p className="font-mono font-bold text-sm text-[#1A201C]">{user?.phone}</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-1">
                        <p className="text-[10px] font-bold uppercase text-[#4A5568]">Account UID</p>
                        <p className="font-mono text-[11px] text-[#4A5568] truncate">{user?.uid}</p>
                      </div>
                    </div>
                  </div>

                  {/* Change Password Section */}
                  <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-3 border-b border-[#F8FAF7] pb-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1A201C]">Change Account Password</h3>
                        <p className="text-[11px] text-[#4A5568]">Update your account security password (min. 8 characters).</p>
                      </div>
                    </div>

                    {passwordFeedback && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        passwordFeedback.type === "success" 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {passwordFeedback.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>{passwordFeedback.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md">
                      <div>
                        <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-xs text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                          New Password (min. 8 characters)
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-xs text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white"
                          required
                          minLength={8}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-xs text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153D31] cursor-pointer shadow-soft transition-all disabled:opacity-50"
                      >
                        {passwordLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Notification & SMS Preferences (Interactive Toggle Switches) */}
                  <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-5">
                    <div className="border-b border-[#F8FAF7] pb-3 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#1B4D3E]" />
                      <h3 className="text-sm font-bold text-[#1A201C]">SMS Carrier Gateway Notification Preferences</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Toggle 1: SMS Auto-Match Alerts */}
                      <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4]">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#1A201C]">SMS Auto-Match Alerts</p>
                          <p className="text-[11px] text-[#65736B]">
                            Receive an instant SMS when a found item matches your lost document serial or keywords.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAutoMatch(!smsAutoMatch)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                            smsAutoMatch ? "bg-[#1B4D3E]" : "bg-gray-300"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            smsAutoMatch ? "translate-x-6" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {/* Toggle 2: Escrow Status SMS */}
                      <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4]">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#1A201C]">Escrow & Handover SMS Updates</p>
                          <p className="text-[11px] text-[#65736B]">
                            Receive SMS confirmations when claimers lock MoMo escrow or request a 24-hour extension.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleEscrowSms(!smsEscrowStatus)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                            smsEscrowStatus ? "bg-[#1B4D3E]" : "bg-gray-300"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            smsEscrowStatus ? "translate-x-6" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Data Protection Rights (Rwanda Law No. 058/2021) */}
                  <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-3 text-xs text-[#65736B] leading-relaxed">
                    <div className="flex items-center gap-2 font-bold text-[#1A201C]">
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      <span>Statutory Data Rights under Rwanda Law No. 058/2021</span>
                    </div>
                    <p>
                      Under Rwandan data privacy laws, you possess the absolute right to erasure, correction, and access to all personal identifiers, unredacted documents, and contact records stored on the Found IN platform.
                    </p>
                  </div>

                  {/* Danger Zone: Delete Account & Purge Data */}
                  <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-red-900">
                          Delete Account & Purge Data
                        </h3>
                        <p className="text-[11px] text-red-600">
                          Permanently delete your profile, unlink active listings, and purge contact identifiers from our cloud databases.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteAccountModal(true)}
                      className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-soft transition-all"
                    >
                      Delete Account & Purge Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* EDIT DESCRIPTION MODAL */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 max-w-md w-full shadow-elevated space-y-4">
            <div className="flex items-center justify-between border-b border-[#F8FAF7] pb-3">
              <h3 className="text-sm font-bold text-[#1A201C]">Edit Listing Description</h3>
              <button 
                type="button"
                onClick={() => setEditModalItem(null)}
                className="text-[#4A5568] hover:text-[#1A201C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#1A201C]">{editModalItem.title}</p>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                placeholder="Update details regarding meeting point or distinctive markings..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditModalItem(null)}
                className="min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold text-[#4A5568] hover:bg-[#F8FAF7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDescription}
                disabled={isUpdating}
                className="min-h-[44px] px-5 py-2 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LISTING CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-red-200 p-6 max-w-sm w-full shadow-elevated space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1A201C]">Delete this listing?</h3>
              <p className="text-xs text-[#4A5568]">
                &ldquo;{deleteConfirmItem.title}&rdquo; will be permanently removed from the public registry.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold text-[#4A5568] hover:bg-[#F8FAF7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className="min-h-[44px] px-5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-red-200 p-6 max-w-md w-full shadow-elevated space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-red-900">Confirm Account Deletion</h3>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Under Rwanda Law No. 058/2021, clicking proceed will permanently purge your phone records, unredacted files, and listings. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteAccountModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold text-[#4A5568] hover:bg-[#F8FAF7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeAccount}
                disabled={purgingAccount}
                className="min-h-[44px] px-5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {purgingAccount ? "Purging..." : "Permanently Purge Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HANDOVER QR / SCANNER MODAL */}
      {qrModalItemId && (
        <HandoverQRModal
          itemId={qrModalItemId}
          isOpen={Boolean(qrModalItemId)}
          onClose={() => setQrModalItemId(null)}
          onComplete={() => {
            setQrModalItemId(null);
            fetchDashboardData();
          }}
          initialRole={qrModalRole}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#65736B]">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
