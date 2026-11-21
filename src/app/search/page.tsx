import { Suspense } from "react";
import ItemCatalog from "@/components/ItemCatalog";

export const metadata = {
  title: "Search Items & Property Registry | Found IN",
  description: "Found IN - Your Secure Recovery Solution. Search active found documents and lost property listings across Rwanda with zero-trust document number masking and verified MoMo escrow.",
};

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A201C] tracking-tight">
          Found IN Property & Document Registry
        </h1>
        <p className="text-xs sm:text-sm text-[#4A5568]">
          Filter by district, category, or search by masked document identifier.
        </p>
      </div>

      <Suspense fallback={<div className="text-xs text-[#4A5568]">Loading registry catalog...</div>}>
        <ItemCatalog />
      </Suspense>
    </div>
  );
}

