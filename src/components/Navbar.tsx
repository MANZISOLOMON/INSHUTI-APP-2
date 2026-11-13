"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Shield, PlusCircle, Menu, X, Smartphone, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Search Registry", href: "/search" },
    { name: "Report Found", href: "/report-found" },
    { name: "Post Bounty", href: "/post-lost" },
    { name: "Admin Portal", href: "/admin" },
  ];

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
                Lost & Found
              </span>
              <span className="text-[11px] text-[#65736B] font-medium tracking-wide">
                Secure Community Registry
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-[#1A201C] hover:text-[#1B4D3E] hover:bg-[#EBF3EF] rounded-full transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/post-lost"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#1B4D3E] bg-[#EBF3EF] hover:bg-[#DEEBE5] transition-all"
            >
              Post Bounty
            </Link>
            <Link
              href="/report-found"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Found Item</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/report-found"
              className="p-2 rounded-full bg-[#1B4D3E] text-white"
              aria-label="Report Item"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>
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
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#1A201C] hover:bg-[#EBF3EF] hover:text-[#1B4D3E] rounded-xl transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E9E4] flex flex-col gap-2">
            <Link
              href="/post-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-[#1B4D3E] bg-[#EBF3EF] hover:bg-[#DEEBE5]"
            >
              Post Lost Bounty
            </Link>
            <Link
              href="/report-found"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-[#65736B]">
            <Smartphone className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>PWA Enabled • Add to Home Screen anytime</span>
          </div>
        </div>
      )}
    </header>
  );
}

