import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function apiFetch(path: string) {
  const token = localStorage.getItem("pashudoc_token");
  return fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
}

const PERIODS = [
  { key: "7d", label: "৭ দিন" },
  { key: "15d", label: "১৫ দিন" },
  { key: "30d", label: "১ মাস" },
  { key: "90d", label: "৩ মাস" },
  { key: "180d", label: "৬ মাস" },
  { key: "365d", label: "১ বছর" },
  { key: "all", label: "সকল সময়" },
];

export function AdminRevenue() {
  const [period, setPeriod] = useState("all");

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["admin-revenue-summary"],
    queryFn: () => apiFetch("/api/admin/revenue/summary"),
  });

  const { data: byDoctor, isLoading: drLoading } = useQuery({
    queryKey: ["admin-revenue-by-doctor", period],
    queryFn: () => apiFetch(`/api/admin/revenue/by-doctor?period=${period}`),
  });

  const summaryCards = [
    { label: "মোট রাজস্ব (সকল সময়)", value: summary?.total ?? 0, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
    { label: "৭ দিনের রাজস্ব", value: summary?.r7d ?? 0, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "১৫ দিনের রাজস্ব", value: summary?.r15d ?? 0, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
    { label: "১ মাসের রাজস্ব", value: summary?.r30d ?? 0, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
    { label: "৩ মাসের রাজস্ব", value: summary?.r90d ?? 0, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "৬ মাসের রাজস্ব", value: summary?.r180d ?? 0, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "১ বছরের রাজস্ব", value: summary?.r365d ?? 0, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  ];

  const doctors = Array.isArray(byDoctor) ? byDoctor : [];
  const totalForPeriod = doctors.reduce((s: number, d: any) => s + (d.revenue ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> রাজস্ব রিপোর্ট
        </h2>
        <p className="text-sm text-muted-foreground">সম্পন্ন অ্যাপয়েন্টমেন্ট অনুযায়ী মোট রাজস্ব</p>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(({ label, value, color, bg, border }) => (
            <Card key={label} className={`border ${border} ${bg}`}>
              <CardContent className="p-4">
                <div className={`flex items-center gap-2 mb-2`}>
                  <DollarSign className={`h-4 w-4 ${color}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className={`text-2xl font-bold ${color}`}>৳{value.toLocaleString("bn-BD")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Per-Doctor Revenue */}
      <Card className="border border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-bold">ডাক্তার অনুযায়ী রাজস্ব</CardTitle>
            <div className="flex flex-wrap gap-1">
              {PERIODS.map(p => (
                <Button key={p.key} size="sm" variant={period === p.key ? "default" : "outline"}
                  className={`h-7 px-2 text-xs ${period === p.key ? "bg-primary" : ""}`}
                  onClick={() => setPeriod(p.key)}>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/15">
            <p className="text-sm text-muted-foreground">নির্বাচিত সময়ের মোট: <span className="font-bold text-primary text-base">৳{totalForPeriod.toLocaleString("bn-BD")}</span></p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {drLoading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">কোনো তথ্য নেই</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">ডাক্তারের নাম</th>
                    <th className="px-4 py-3 text-left font-medium">ফোন</th>
                    <th className="px-4 py-3 text-left font-medium">জেলা</th>
                    <th className="px-4 py-3 text-left font-medium">পরামর্শ ফি</th>
                    <th className="px-4 py-3 text-left font-medium">সম্পন্ন অ্যাপয়েন্ট</th>
                    <th className="px-4 py-3 text-right font-medium">রাজস্ব</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc: any, idx: number) => (
                    <tr key={doc.doctorId} className="border-t border-border hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{doc.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.district}</td>
                      <td className="px-4 py-3">৳{(doc.consultationFee ?? 0).toLocaleString("bn-BD")}</td>
                      <td className="px-4 py-3 text-center">{doc.completedAppointments}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${doc.revenue > 0 ? "text-primary" : "text-muted-foreground"}`}>
                          ৳{(doc.revenue ?? 0).toLocaleString("bn-BD")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
