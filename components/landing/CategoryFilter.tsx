"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function CategoryFilter({ categories, activeCategory }: { categories: string[]; activeCategory: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-10">
      <button
        onClick={() => handleSelect("")}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
          !activeCategory
            ? "bg-primary text-white shadow-sm shadow-indigo-200"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleSelect(cat)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            activeCategory === cat
              ? "bg-primary text-white shadow-sm shadow-indigo-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
