import { useQuery } from "@tanstack/react-query";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function useSiteContent() {
  return useQuery<Record<string, string>>({
    queryKey: ["site-content"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/site-content`);
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
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
      const res = await fetch(`${API}/api/faqs`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
