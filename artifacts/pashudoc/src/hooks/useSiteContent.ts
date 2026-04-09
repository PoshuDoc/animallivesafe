import { useQuery } from "@tanstack/react-query";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const NO_CACHE: RequestInit = { cache: "no-store" };

export function useSiteContent() {
  return useQuery<Record<string, string>>({
    queryKey: ["site-content"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/site-content`, NO_CACHE);
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export function useFaqs() {
  return useQuery<FaqItem[]>({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/faqs`, NO_CACHE);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });
}
