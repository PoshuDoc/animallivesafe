import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { useListAppointments, getListAppointmentsQueryKey, useUpdateAppointment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import {
  CalendarIcon, Clock, CheckCircle, XCircle, Users, TrendingUp,
  Stethoscope, MapPin, Phone, Pencil, Upload, Star, Banknote,
  Building2, BadgeCheck,
} from "lucide-react";
import { format } from "date-fns";
import { getToken } from "@/lib/auth";
import { DISTRICTS } from "@/lib/constants";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "নিশ্চিত", cls: "bg-green-100 text-green-800 border-green-200" },
  pending:   { label: "অপেক্ষমাণ", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  completed: { label: "সম্পন্ন", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  cancelled: { label: "বাতিল", cls: "bg-red-100 text-red-800 border-red-200" },
};

const REVENUE_PERIODS = [
  { value: "7d", label: "৭ দিন" },
  { value: "15d", label: "১৫ দিন" },
  { value: "30d", label: "৩০ দিন" },
  { value: "90d", label: "৩ মাস" },
  { value: "180d", label: "৬ মাস" },
  { value: "365d", label: "১ বছর" },
  { value: "all", label: "সার্বিক" },
];

const ALL_SPECIALTIES = [
  "গবাদি পশু", "ছাগল ও ভেড়া", "হাঁস-মুরগি", "কুকুর ও বিড়াল",
  "মাছ ও জলজ প্রাণী", "ঘোড়া", "সাধারণ পশু চিকিৎসা",
];

const profileSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর"),
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন"),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  upazila: z.string().optional(),
  clinicName: z.string().optional(),
  chamberAddress: z.string().optional(),
  bio: z.string().optional(),
  consultationFee: z.number().min(0).optional(),
  yearsExperience: z.number().min(0).optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  return fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function useDoctorProfile() {
  return useQuery({
    queryKey: ["doctor-me"],
    queryFn: async () => {
      const res = await apiFetch("/api/doctors/me");
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });
}

function useDoctorRevenue(period: string) {
  return useQuery({
    queryKey: ["doctor-revenue", period],
    queryFn: async () => {
      const res = await apiFetch(`/api/doctors/me/revenue?period=${period}`);
      if (!res.ok) return { revenue: 0, completedCount: 0 };
      return res.json();
    },
  });
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [revenuePeriod, setRevenuePeriod] = useState("30d");

  const { data: doctorProfile, refetch: refetchProfile } = useDoctorProfile();
  const { data: revenueData } = useDoctorRevenue(revenuePeriod);

  const { data: appointmentsResponse, isLoading } = useListAppointments({
    query: { queryKey: getListAppointmentsQueryKey() }
  });
  const updateAppointment = useUpdateAppointment();

  const handleUpdateStatus = (id: number, status: "confirmed" | "completed" | "cancelled") => {
    updateAppointment.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "সফল", description: "অ্যাপয়েন্টমেন্ট আপডেট করা হয়েছে" });
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["doctor-revenue", revenuePeriod] });
      },
      onError: () => {
        toast({ variant: "destructive", title: "ত্রুটি", description: "আপডেট করতে সমস্যা হয়েছে" });
      }
    });
  };

  const appointments = (appointmentsResponse as any)?.appointments || [];
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayApts = appointments.filter((a: any) => a.appointmentDate === todayStr && a.status !== "cancelled");
  const pending   = appointments.filter((a: any) => a.status === "pending");
  const confirmed = appointments.filter((a: any) => a.status === "confirmed");
  const completed = appointments.filter((a: any) => a.status === "completed");

  const avgRating = doctorProfile?.averageRating ?? 0;
  const totalReviews = doctorProfile?.totalReviews ?? 0;

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <Layout>
        <section className="bg-primary/5 border-b border-border py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <DoctorAvatarSection doctorProfile={doctorProfile} onUpdate={refetchProfile} toast={toast} />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Stethoscope className="h-3.5 w-3.5" /> ভেটেরিনারি ডাক্তার
                    {doctorProfile?.status === "approved" && (
                      <span className="flex items-center gap-1 text-green-600 ml-1"><BadgeCheck className="h-3.5 w-3.5" /> অনুমোদিত</span>
                    )}
                  </p>
                  <h1 className="text-2xl font-bold text-foreground">ডা. {doctorProfile?.name || user?.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{doctorProfile?.phone || user?.phone}</span>
                    {doctorProfile?.district && (
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{doctorProfile.district}</span>
                    )}
                    {doctorProfile?.clinicName && (
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{doctorProfile.clinicName}</span>
                    )}
                  </div>
                  {doctorProfile?.chamberAddress && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {doctorProfile.chamberAddress}
                    </p>
                  )}
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({totalReviews}টি রিভিউ)</span>
                    </div>
                  )}
                </div>
              </div>
              <DoctorProfileEditDialog
                doctorProfile={doctorProfile}
                user={user}
                onSaved={() => { refetchProfile(); queryClient.invalidateQueries({ queryKey: ["doctor-revenue", revenuePeriod] }); }}
                toast={toast}
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="border border-primary/20 bg-primary/5 col-span-1">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-white/60"><CalendarIcon className="h-5 w-5 text-primary" /></div>
                </div>
                <p className="text-3xl font-bold text-primary mb-1">{todayApts.length}</p>
                <p className="text-xs text-muted-foreground">আজকের অ্যাপয়েন্টমেন্ট</p>
              </CardContent>
            </Card>
            <Card className="border border-amber-200 bg-amber-50 col-span-1">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-white/60"><Clock className="h-5 w-5 text-amber-700" /></div>
                </div>
                <p className="text-3xl font-bold text-amber-700 mb-1">{pending.length}</p>
                <p className="text-xs text-muted-foreground">অপেক্ষমাণ</p>
              </CardContent>
            </Card>
            <Card className="border border-blue-200 bg-blue-50 col-span-1">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-white/60"><Users className="h-5 w-5 text-blue-700" /></div>
                </div>
                <p className="text-3xl font-bold text-blue-700 mb-1">{completed.length}</p>
                <p className="text-xs text-muted-foreground">মোট রোগী সেবা</p>
              </CardContent>
            </Card>
            <Card className="border border-amber-200 bg-amber-50 col-span-1">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-white/60"><Star className="h-5 w-5 text-amber-600" /></div>
                </div>
                <p className="text-3xl font-bold text-amber-700 mb-1">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                <p className="text-xs text-muted-foreground">গড় রেটিং ({totalReviews}টি)</p>
              </CardContent>
            </Card>

            <Card className="border border-emerald-200 bg-emerald-50 col-span-2">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-white/60"><Banknote className="h-5 w-5 text-emerald-700" /></div>
                  <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
                    <SelectTrigger className="h-7 w-auto text-xs border-emerald-300 bg-white/70 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_PERIODS.map(p => (
                        <SelectItem key={p.value} value={p.value} className="text-sm">{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-3xl font-bold text-emerald-700 mb-1">৳{(revenueData?.revenue ?? 0).toLocaleString("bn-BD")}</p>
                <p className="text-xs text-muted-foreground">
                  মোট আয় · {revenueData?.completedCount ?? 0}টি সম্পন্ন ভিজিট
                </p>
              </CardContent>
            </Card>
          </div>

          {todayApts.length > 0 && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <CalendarIcon className="h-4 w-4" /> আজকের অ্যাপয়েন্টমেন্ট ({todayApts.length}টি)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {todayApts.slice(0, 4).map((apt: any) => {
                    const s = STATUS_MAP[apt.status] || { label: apt.status, cls: "" };
                    return (
                      <div key={apt.id} className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-3 border border-primary/10">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{apt.farmerName || "খামারি"}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />{apt.appointmentTime} · {apt.animalType}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${s.cls}`}>{s.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-border/50">
            <CardHeader className="border-b border-border pb-0 pt-4 px-4">
              <Tabs defaultValue="active">
                <TabsList className="h-auto bg-transparent gap-1 p-0 border-b-0">
                  {[
                    { value: "active", label: `সক্রিয় (${pending.length + confirmed.length})` },
                    { value: "pending", label: `অপেক্ষমাণ (${pending.length})` },
                    { value: "confirmed", label: `নিশ্চিত (${confirmed.length})` },
                    { value: "completed", label: `সম্পন্ন (${completed.length})` },
                  ].map(t => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none pb-3 px-3 text-sm text-muted-foreground"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <CardContent className="p-5">
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <TabsContent value="active" className="mt-0">
                        <AppointmentList appointments={[...pending, ...confirmed]} onUpdate={handleUpdateStatus} isPending={updateAppointment.isPending} />
                      </TabsContent>
                      <TabsContent value="pending" className="mt-0">
                        <AppointmentList appointments={pending} onUpdate={handleUpdateStatus} isPending={updateAppointment.isPending} />
                      </TabsContent>
                      <TabsContent value="confirmed" className="mt-0">
                        <AppointmentList appointments={confirmed} onUpdate={handleUpdateStatus} isPending={updateAppointment.isPending} />
                      </TabsContent>
                      <TabsContent value="completed" className="mt-0">
                        <AppointmentList appointments={completed} onUpdate={handleUpdateStatus} isPending={updateAppointment.isPending} />
                      </TabsContent>
                    </>
                  )}
                </CardContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function DoctorAvatarSection({ doctorProfile, onUpdate, toast }: { doctorProfile: any; onUpdate: () => void; toast: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await apiFetch("/api/doctors/me/avatar", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      toast({ title: "সফল!", description: "প্রোফাইল ছবি আপলোড হয়েছে।" });
      onUpdate();
    } catch {
      toast({ variant: "destructive", title: "ত্রুটি", description: "ছবি আপলোড করতে সমস্যা হয়েছে।" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md overflow-hidden">
        {doctorProfile?.avatarUrl ? (
          <img src={doctorProfile.avatarUrl} alt="প্রোফাইল" className="w-full h-full object-cover" />
        ) : (
          <span>{(doctorProfile?.name || "ড").charAt(0)}</span>
        )}
      </div>
      <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading ? (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="h-4 w-4 text-white" />
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

function DoctorProfileEditDialog({ doctorProfile, user, onSaved, toast }: { doctorProfile: any; user: any; onSaved: () => void; toast: any }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  useEffect(() => {
    if (doctorProfile?.specialties) {
      setSelectedSpecialties(doctorProfile.specialties);
    }
  }, [doctorProfile]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: doctorProfile?.name || user?.name || "",
      phone: doctorProfile?.phone || user?.phone || "",
      district: doctorProfile?.district || "",
      upazila: doctorProfile?.upazila || "",
      clinicName: doctorProfile?.clinicName || "",
      chamberAddress: doctorProfile?.chamberAddress || "",
      bio: doctorProfile?.bio || "",
      consultationFee: doctorProfile?.consultationFee ?? 0,
      yearsExperience: doctorProfile?.yearsExperience ?? 0,
    },
  });

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/doctors/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, specialties: selectedSpecialties }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast({ title: "সফল!", description: "প্রোফাইল আপডেট হয়েছে।" });
      onSaved();
      setOpen(false);
    } catch {
      toast({ variant: "destructive", title: "ত্রুটি", description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Pencil className="mr-2 h-4 w-4" /> প্রোফাইল আপডেট
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>প্রোফাইল সম্পাদনা</DialogTitle>
          <DialogDescription>আপনার তথ্য আপডেট করুন</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>পুরো নাম</FormLabel>
                  <FormControl><Input placeholder="ডাক্তারের নাম" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>ফোন নম্বর</FormLabel>
                  <FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="district" render={({ field }) => (
              <FormItem>
                <FormLabel>জেলা</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="জেলা নির্বাচন করুন" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="upazila" render={({ field }) => (
                <FormItem>
                  <FormLabel>উপজেলা</FormLabel>
                  <FormControl><Input placeholder="উপজেলার নাম" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="clinicName" render={({ field }) => (
                <FormItem>
                  <FormLabel>ক্লিনিক / চেম্বারের নাম</FormLabel>
                  <FormControl><Input placeholder="ক্লিনিকের নাম" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="chamberAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>চেম্বারের ঠিকানা</FormLabel>
                <FormControl>
                  <Textarea placeholder="পূর্ণ ঠিকানা লিখুন (রাস্তা, এলাকা, জেলা)..." className="min-h-[70px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="consultationFee" render={({ field }) => (
                <FormItem>
                  <FormLabel>পরামর্শ ফি (টাকা)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="০" {...field}
                      onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="yearsExperience" render={({ field }) => (
                <FormItem>
                  <FormLabel>অভিজ্ঞতা (বছর)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="০" {...field}
                      onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div>
              <Label className="text-sm font-medium">বিশেষত্ব (একাধিক বেছে নিন)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_SPECIALTIES.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedSpecialties.includes(spec)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>পরিচিতি / বায়ো</FormLabel>
                <FormControl>
                  <Textarea placeholder="আপনার সম্পর্কে সংক্ষিপ্ত পরিচিতি..." className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentList({ appointments, onUpdate, isPending }: {
  appointments: any[];
  onUpdate: (id: number, status: "confirmed" | "completed" | "cancelled") => void;
  isPending: boolean;
}) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-accent/20 rounded-xl">
        <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">কোনো অ্যাপয়েন্টমেন্ট নেই</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt: any) => {
        const s = STATUS_MAP[apt.status] || { label: apt.status, cls: "" };
        return (
          <div key={apt.id} className="p-4 border border-border rounded-xl bg-card hover:bg-accent/10 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-foreground shrink-0">
                  {(apt.farmerName || "খ").charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-bold text-foreground">{apt.farmerName || "খামারি"}</span>
                    <Badge variant="outline" className={s.cls}>{s.label}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-3 mb-1.5">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" />{format(new Date(apt.appointmentDate), "dd MMM, yyyy")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{apt.appointmentTime}</span>
                    <span className="bg-accent px-2 py-0.5 rounded text-foreground">{apt.animalType}</span>
                  </div>
                  {apt.animalDescription && (
                    <p className="text-sm text-foreground/80 bg-accent/40 px-3 py-1.5 rounded-lg mt-1 max-w-md">{apt.animalDescription}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {apt.status === "pending" && (
                  <>
                    <Button size="sm" variant="outline" className="border-green-400 text-green-700 hover:bg-green-50" onClick={() => onUpdate(apt.id, "confirmed")} disabled={isPending}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> নিশ্চিত
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => onUpdate(apt.id, "cancelled")} disabled={isPending}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> বাতিল
                    </Button>
                  </>
                )}
                {apt.status === "confirmed" && (
                  <>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onUpdate(apt.id, "completed")} disabled={isPending}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> চিকিৎসা সম্পন্ন
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => onUpdate(apt.id, "cancelled")} disabled={isPending}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> বাতিল
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
