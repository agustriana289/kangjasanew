"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function getCountdownText(expired_at: string): { text: string; isExpired: boolean } {
  const diff = new Date(expired_at).getTime() - Date.now();
  if (diff <= 0) return { text: "Berakhir", isExpired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (days > 0) return { text: `Berakhir ${days}h ${hours}j lagi`, isExpired: false };
  if (hours > 0) return { text: `Berakhir ${hours}j ${minutes}m lagi`, isExpired: false };
  return { text: `Berakhir ${minutes}m lagi`, isExpired: false };
}

export default function PromoCountdown({ expired_at }: { expired_at: string }) {
  const [state, setState] = useState(() => getCountdownText(expired_at));

  useEffect(() => {
    const interval = setInterval(() => {
      setState(getCountdownText(expired_at));
    }, 30000);
    return () => clearInterval(interval);
  }, [expired_at]);

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${state.isExpired ? "text-rose-400" : "text-amber-500"}`}>
      <Clock size={11} />
      {state.text}
    </span>
  );
}
