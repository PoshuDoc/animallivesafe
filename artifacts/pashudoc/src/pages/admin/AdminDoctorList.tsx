import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Users, Star, Phone, MapPin, Stethoscope, X, ChevronRight, Calendar, DollarSign } from "lucide-react";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function apiFetch(path: string) {
  const token = localStorage.getItem("pashudoc_token");
  return fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
}

const statusLabels: Record<string, { label: string; cls: string }> = {
  approved: { label: "অনুমোদিত", cls: "bg-green-50 text-green-700 border-green-200" },
  pending: { label: "অপেক্ষমাণ", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  rejected: { label: "বাতিল", cls: "bg-red-50 text-red-700 border-red-200" },
};

export function AdminDoctorList() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-all-doctors"],
    queryFn: () => apiFetch("/api/admin/doctors"),
  });

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ["admin-doctor-details", selectedId],
    queryFn: () => selectedId ? apiFetch(`/api/admin/doctors/${selectedId}/details`) : null,
    enabled: !!selectedId,
  });

  const allDoctors = Array.isArray(data) ? data : [];
  const filtered = filter === "all" ? allDoctors : allDoctors.filter((d: any) => d.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> ডাক্তারের সম্পূর্ণ তালিকা
        </h2>
        <p className="text-sm text-muted-foreground">নামের উপর ক্লিক করলে বিস্তারিত তথ্য দেখা যাবে</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "সবাই" },
          { key: "approved", label: "অনুমোদিত" },
          { key: "pending", label: "অপেক্ষমাণ" },
          { key: "rejected", label: "বাতিল" },
        ].map(f => (
          <Button key={f.key} size="sm" variant={filter === f.key ? "default" : "outline"}
            className={`h-8 px-3 text-xs ${filter === f.key ? "bg-primary" : ""}`}
            onClick={() => setFilter(f.key)}>
            {f.label} {f.key === "all" ? `(${allDoctors.length})` : `(${allDoctors.filter((d: any) => d.status === f.key).length})`}
          </Button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 bg-accent/20 rounded-xl text-muted-foreground">কোনো ডাক্তার নেই</div>
      ) : (
        <Card className="border border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">নাম</th>
                    <th className="px-4 py-3 text-left font-medium">ফোন</th>
                    <th className="px-4 py-3 text-left font-medium">জেলা</th>
                    <th className="px-4 py-3 text-left font-medium">বিশেষত্ব</th>
                    <th className="px-4 py-3 text-left font-medium">ফি</th>
                    <th className="px-4 py-3 text-left font-medium">রেটিং</th>
                    <th className="px-4 py-3 text-left font-medium">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-left font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc: any, idx: number) => {
                    const s = statusLabels[doc.status] || { label: doc.status, cls: "" };
                    return (
                      <tr key={doc.id} className="border-t border-border hover:bg-accent/20 transition-colors cursor-pointer" onClick={() => setSelectedId(doc.id)}>
                        <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {doc.avatarUrl ? (
                              <img src={doc.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt={doc.name} />
                            ) : (
                              <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">{doc.name?.charAt(0)}</div>
                            )}
                            <button className="font-semibold text-primary hover:underline text-left" onClick={(e) => { e.stopPropagation(); setSelectedId(doc.id); }}>
                              {doc.name}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{doc.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground">{doc.district}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(doc.specialties || []).slice(0, 2).map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-xs px-1.5 py-0">{s}</Badge>
                            ))}
                            {(doc.specialties || []).length > 2 && <span className="text-xs text-muted-foreground">+{doc.specialties.length - 2}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">৳{doc.consultationFee}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-amber-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                            {(doc.averageRating ?? 0).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={s.cls}>{s.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Details Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-primary">ডাক্তারের বিস্তারিত তথ্য</DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : details ? (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/15">
                {details.avatarUrl ? (
                  <img src={details.avatarUrl} className="w-16 h-16 rounded-full object-cover shrink-0" alt={details.name} />
                ) : (
                  <div className="w-16 h-16 bg-primary/15 text-primary rounded-full flex items-center justify-center font-bold text-2xl shrink-0">{details.name?.charAt(0)}</div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{details.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3.5 w-3.5" /> {details.phone}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {details.district}{details.upazila ? `, ${details.upazila}` : ""}</p>
                  <Badge variant="outline" className={`mt-2 ${statusLabels[details.status]?.cls}`}>{statusLabels[details.status]?.label}</Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "রেটিং", value: (details.averageRating ?? 0).toFixed(1), icon: Star, color: "text-amber-600" },
                  { label: "রিভিউ", value: details.totalReviews ?? 0, icon: Users, color: "text-blue-600" },
                  { label: "অ্যাপয়েন্ট", value: details.totalAppointments ?? 0, icon: Calendar, color: "text-teal-600" },
                  { label: "মোট রাজস্ব", value: `৳${(details.totalRevenue ?? 0).toLocaleString("bn-BD")}`, icon: DollarSign, color: "text-primary" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="p-3 bg-accent/30 rounded-xl text-center">
                    <Icon className={`h-5 w-5 ${color} mx-auto mb-1`} />
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Info */}
              <div className="space-y-3">
                <InfoRow label="ক্লিনিকের নাম" value={details.clinicName} />
                <InfoRow label="চেম্বারের ঠিকানা" value={details.chamberAddress} />
                <InfoRow label="অভিজ্ঞতা" value={details.yearsExperience ? `${details.yearsExperience} বছর` : null} />
                <InfoRow label="পরামর্শ ফি" value={details.consultationFee ? `৳${details.consultationFee}` : null} />
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">বিশেষত্ব</p>
                  <div className="flex flex-wrap gap-1">
                    {(details.specialties || []).map((s: string) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
                {details.bio && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">পরিচিতি</p>
                    <p className="text-sm text-foreground bg-accent/30 p-3 rounded-lg">{details.bio}</p>
                  </div>
                )}
              </div>

              {/* Recent Reviews */}
              {details.recentReviews?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-3">সাম্প্রতিক রিভিউ</p>
                    <div className="space-y-2">
                      {details.recentReviews.map((rev: any) => (
                        <div key={rev.id} className="p-3 bg-accent/20 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{rev.farmerName}</span>
                            <span className="flex items-center gap-0.5 text-amber-600 text-sm">
                              <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" /> {rev.rating}
                            </span>
                          </div>
                          {rev.comment && <p className="text-sm text-muted-foreground">{rev.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <span className="text-xs text-muted-foreground w-32 shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-foreground font-medium">{value}</span>
    </div>
  );
}
