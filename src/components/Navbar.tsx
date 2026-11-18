"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, 
  Menu, 
  X, 
  Smartphone, 
  Globe, 
  ChevronDown, 
  Check, 
  LogIn, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Package, 
  Handshake, 
  Wallet, 
  Settings,
  Search
} from "lucide-react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { user, requireAuth, openAuthModal, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "kyr", label: "Kinyarwanda", flag: "🇷🇼" },
  ];

  const handleAuthNavigation = (destination: string) => {
    requireAuth(() => {
      router.push(destination);
    });
  };

  const handleSignOut = () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E9E4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity (Found IN - Your Secure Recovery Solution) */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#F6F8F3] border border-[#DEEBE5] flex items-center justify-center p-1 shadow-2xs transition-transform group-hover:scale-105">
              <Image 
                src="/shield-icon.png" 
                alt="Found IN Logo" 
                width={32} 
                height={32} 
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center tracking-tight leading-none">
                <span className="font-extrabold text-lg text-[#1B4D3E]">Found</span>
                <span className="font-extrabold text-lg text-[#10B981] ml-1">IN</span>
              </div>
              <span className="text-[10px] text-[#65736B] font-semibold tracking-wide uppercase mt-0.5">
                {t.brandSubtitle}
              </span>
            </div>
          </Link>

          {/* Center Navigation: Clean Search Link Only */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-[#1A201C] hover:text-[#1B4D3E] hover:bg-[#EBF3EF] rounded-full transition-colors"
            >
              <Search className="w-4 h-4 text-[#65736B]" />
              <span>{t.navSearchItems}</span>
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-[#1B4D3E] bg-[#EBF3EF] hover:bg-[#DEEBE5] rounded-full transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#1B4D3E]" />
                <span>{t.navMyDashboard}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1A201C] bg-[#F8FAF7] hover:bg-[#EBF3EF] border border-[#E5E9E4] transition-all cursor-pointer"
                aria-label="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-[#65736B]" />
              </button>

              {langMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setLangMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-[#E5E9E4] shadow-elevated py-2 z-50 animate-fade-in">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#65736B] border-b border-[#E5E9E4] mb-1">
                      Select Language
                    </div>
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setLanguage(item.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                          language === item.code
                            ? "bg-[#EBF3EF] text-[#1B4D3E] font-bold"
                            : "text-[#1A201C] hover:bg-[#F8FAF7]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.flag}</span>
                          <span>{item.label}</span>
                        </span>
                        {language === item.code && (
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* User State: Unauthenticated Guest vs Logged In */}
            {user === null ? (
              /* Guest: Clean Sign In Button */
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1B4D3E] bg-[#EBF3EF] hover:bg-[#DEEBE5] border border-[#DEEBE5] transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.navSignIn}</span>
              </button>
            ) : (
              /* Signed In: Profile Badge Dropdown & Quick Sign Out */
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1A201C] bg-white hover:bg-[#F8FAF7] border border-[#E5E9E4] shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center text-[10px] font-bold">
                      <User className="w-3 h-3 text-emerald-300" />
                    </div>
                    <span className="font-mono text-[11px] text-[#1A201C]">
                      {user.phone ? user.phone.replace(/(\+\d{3})(\d{3})(\d{3})(\d+)/, "$1 $2 $3 $4") : "Citizen"}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#65736B]" />
                  </button>

                  {profileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileMenuOpen(false)} 
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E5E9E4] shadow-elevated py-2 z-50 animate-fade-in text-xs">
                        <div className="px-4 py-2 border-b border-[#E5E9E4] bg-[#F8FAF7] rounded-t-2xl">
                          <p className="text-[10px] font-bold text-[#65736B] uppercase tracking-wider">Signed In As</p>
                          <p className="font-mono font-semibold text-[#1A201C] truncate">{user.phone}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard?tab=items"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[#1A201C] hover:bg-[#EBF3EF] hover:text-[#1B4D3E] font-medium transition-colors"
                          >
                            <Package className="w-4 h-4 text-[#1B4D3E]" />
                            <span>My Active Listings</span>
                          </Link>

                          <Link
                            href="/dashboard?tab=handovers"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[#1A201C] hover:bg-[#EBF3EF] hover:text-[#1B4D3E] font-medium transition-colors"
                          >
                            <Handshake className="w-4 h-4 text-[#10B981]" />
                            <span>Claims & Handovers</span>
                          </Link>

                          <Link
                            href="/dashboard?tab=wallet"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[#1A201C] hover:bg-[#EBF3EF] hover:text-[#1B4D3E] font-medium transition-colors"
                          >
                            <Wallet className="w-4 h-4 text-[#1B4D3E]" />
                            <span>MoMo Escrow Wallet</span>
                          </Link>

                          <Link
                            href="/dashboard?tab=settings"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[#1A201C] hover:bg-[#EBF3EF] hover:text-[#1B4D3E] font-medium transition-colors"
                          >
                            <Settings className="w-4 h-4 text-[#65736B]" />
                            <span>Account & Privacy Settings</span>
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-[#E5E9E4]">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t.navSignOut}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Functional 1-Click Sign Out Button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{t.navSignOut}</span>
                </button>
              </div>
            )}

            {/* Post Lost Item Action Pill */}
            <button
              onClick={() => handleAuthNavigation("/post-lost")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#1B4D3E] bg-[#EBF3EF] hover:bg-[#DEEBE5] transition-all cursor-pointer"
            >
              {t.postLostBtn}
            </button>

            {/* Report Found Item Action Pill */}
            <button
              onClick={() => handleAuthNavigation("/report-found")}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.reportFoundBtn}</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextLang: Record<Language, Language> = { en: "fr", fr: "kyr", kyr: "en" };
                setLanguage(nextLang[language]);
              }}
              className="px-2.5 py-1 rounded-full bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-bold text-[#1B4D3E] uppercase"
              title="Switch language"
            >
              {language}
            </button>

            <button
              onClick={() => handleAuthNavigation("/report-found")}
              className="p-2 rounded-full bg-[#1B4D3E] text-white"
              aria-label="Report Found Item"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1A201C] hover:bg-[#F8FAF7] border border-[#E5E9E4]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E5E9E4] bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fade-in">
          <div className="space-y-1">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#1A201C] hover:bg-[#EBF3EF] hover:text-[#1B4D3E] rounded-xl transition-colors"
            >
              <Search className="w-4 h-4 text-[#65736B]" />
              <span>{t.navSearchItems}</span>
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#1B4D3E] bg-[#EBF3EF] rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#1B4D3E]" />
                  <span>{t.navMyDashboard}</span>
                </Link>

                <Link
                  href="/dashboard?tab=items"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#1A201C] hover:bg-[#F8FAF7] rounded-xl pl-6"
                >
                  <Package className="w-3.5 h-3.5 text-[#1B4D3E]" />
                  <span>My Active Listings</span>
                </Link>

                <Link
                  href="/dashboard?tab=handovers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#1A201C] hover:bg-[#F8FAF7] rounded-xl pl-6"
                >
                  <Handshake className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Claims & Handovers</span>
                </Link>

                <Link
                  href="/dashboard?tab=wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#1A201C] hover:bg-[#F8FAF7] rounded-xl pl-6"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#1B4D3E]" />
                  <span>MoMo Escrow Wallet</span>
                </Link>

                <Link
                  href="/dashboard?tab=settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#1A201C] hover:bg-[#F8FAF7] rounded-xl pl-6"
                >
                  <Settings className="w-3.5 h-3.5 text-[#65736B]" />
                  <span>Account & Privacy Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.navSignOut} ({user.phone})</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#1B4D3E] bg-[#EBF3EF] rounded-xl transition-colors text-left"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.navSignIn}</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E9E4] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleAuthNavigation("/post-lost");
              }}
              className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-[#1B4D3E] bg-[#EBF3EF] hover:bg-[#DEEBE5] cursor-pointer"
            >
              {t.postLostBtn}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleAuthNavigation("/report-found");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.reportFoundBtn}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-[#65736B]">
            <Smartphone className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>PWA Enabled • Add to Home Screen</span>
          </div>
        </div>
      )}
    </header>
  );
}