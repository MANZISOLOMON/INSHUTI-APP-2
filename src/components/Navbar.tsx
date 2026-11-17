"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, PlusCircle, Menu, X, Smartphone, Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { user, requireAuth } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Standardized plain English navigation links (Admin Portal strictly removed from public nav)
  const navLinks = [
    { name: t.navSearchItems, href: "/search" },
    { name: t.navReportFound, href: "/report-found" },
    { name: t.navPostLost, href: "/post-lost" },
    { name: t.navPrivacyAccount, href: "/settings" },
  ];

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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E9E4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1B4D3E] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-[#1A201C] leading-tight tracking-tight">
                {t.brandTitle}
              </span>
              <span className="text-[11px] text-[#65736B] font-medium tracking-wide">
                {t.brandSubtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-[#1A201C] hover:text-[#1B4D3E] hover:bg-[#EBF3EF] rounded-full transition-colors"
              >
                {link.name}
              </Link>
            ))}
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

            {/* Post Lost Item Action */}
            <button
              onClick={() => handleAuthNavigation("/post-lost")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#1B4D3E] bg-[#EBF3EF] hover:bg-[#DEEBE5] transition-all cursor-pointer"
            >
              {t.postLostBtn}
            </button>

            {/* Report Found Item Action */}
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
            {/* Quick Language Toggle on Mobile */}
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#1A201C] hover:bg-[#EBF3EF] hover:text-[#1B4D3E] rounded-xl transition-colors"
              >
                {link.name}
              </Link>
            ))}
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
