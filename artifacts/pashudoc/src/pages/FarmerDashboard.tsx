import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { useListAppointments, getListAppointmentsQueryKey, useCreateReview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Star, Calendar as CalendarIcon, Clock, Stethoscope, Search, MapPin, ChevronRight, User, Pencil, Upload, Banknote, History } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getToken } from "@/lib/auth";
import { DISTRICTS } from "@/lib/constants";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে"),
  district: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;
type ProfileFormValues = z.infer<typeof profileSchema>;

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "নিশ্চিত", cls: "bg-green-100 text-green-800 border-green-200" },
  pending:   { label: "অপেক্ষমাণ", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  completed: { label: "সম্পন্ন", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  cancelled: { label: "বাতিল", cls: "bg-red-100 text-red-800 border-red-200" },
};

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

export default function FarmerDashboard() {
  const { user, refetch: refetchUser } = useAuth();
  const { toast } = useToast();
  const { data: appointmentsResponse, isLoading } = useListAppointments({
    query: { queryKey: getListAppointmentsQueryKey() }
  });

  const appointments = appointmentsResponse?.appointments || [];
  const pending   = appointments.filter((a: any) => a.status === "pending");
  const confirmed = appointments.filter((a: any) => a.status === "confirmed");
  const completed = appointments.filter((a: any) => a.status === "completed");

  const totalKhoroj = completed.reduce((sum: number, a: any) => sum + (a.consultationFee || 0), 0);

  const visitedDoctors = (() => {
    const seen = new Set<number>();
    const result: any[] = [];
    for (const a of appointments) {
      if (!seen.has(a.doctorId)) {
        seen.add(a.doctorId);
        result.push({ doctorId: a.doctorId, doctorName: a.doctorName, doctorDistrict: a.doctorDistrict, specialties: a.specialties });
      }
    }
    return result;
  })();

  return (
    <ProtectedRoute allowedRoles={["farmer"]}>
      <Layout>
        <section className="bg-primary/5 border-b border-border py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <AvatarSection user={user} onUpdate={() => refetchUser()} toast={toast} />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">স্বাগতম</p>
                  <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {user?.phone}</span>
                    {user?.district && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.district}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ProfileEditDialog user={user} onSaved={() => refetchUser()} toast={toast} />
                <Button className="hover-elevate" asChild>
                  <Link href="/doctors">
                    <Search className="mr-2 h-4 w-4" /> নতুন ডাক্তার খুঁজুন
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="border border-border bg-card">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-foreground mb-1">{appointments.length}</p>
                <p className="text-sm text-muted-foreground">মোট বুকিং</p>
              </CardContent>
            </Card>
            <Card className="border border-amber-200 bg-amber-50">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-amber-700 mb-1">{pending.length}</p>
                <p className="text-sm text-muted-foreground">অপেক্ষমাণ</p>
              </CardContent>
            </Card>
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-green-700 mb-1">{confirmed.length}</p>
                <p className="text-sm text-muted-foreground">নিশ্চিত</p>
              </CardContent>
            </Card>
            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-blue-700 mb-1">{completed.length}</p>
                <p className="text-sm text-muted-foreground">সম্পন্ন</p>
              </CardContent>
            </Card>
            <Card className="border border-emerald-200 bg-emerald-50 col-span-2 md:col-span-1">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Banknote className="h-5 w-5 text-emerald-600" />
                  <p className="text-3xl font-bold text-emerald-700">৳{totalKhoroj}</p>
                </div>
                <p className="text-sm text-muted-foreground">মোট খরচ</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="border-b border-border pb-0 pt-4 px-4">
              <Tabs defaultValue="all">
                <TabsList className="h-auto bg-transparent gap-1 p-0 border-b-0">
                  {[
                    { value: "all", label: `সব (${appointments.length})` },
                    { value: "pending", label: `অপেক্ষমাণ (${pending.length})` },
                    { value: "confirmed", label: `নিশ্চিত (${confirmed.length})` },
                    { value: "completed", label: `সম্পন্ন (${completed.length})` },
                    { value: "doctors", label: `আগের ডাক্তার (${visitedDoctors.length})` },
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
                      <TabsContent value="all" className="mt-0">
                        <AppointmentList appointments={appointments} />
                      </TabsContent>
                      <TabsContent value="pending" className="mt-0">
                        <AppointmentList appointments={pending} />
                      </TabsContent>
                      <TabsContent value="confirmed" className="mt-0">
                        <AppointmentList appointments={confirmed} />
                      </TabsContent>
                      <TabsContent value="completed" className="mt-0">
                        <AppointmentList appointments={completed} showReview />
                      </TabsContent>
                      <TabsContent value="doctors" className="mt-0">
                        <PreviousDoctorsList doctors={visitedDoctors} />
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

function AvatarSection({ user, onUpdate, toast }: { user: any; onUpdate: () => void; toast: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await apiFetch("/api/auth/profile/avatar", {
        method: "POST",
        body: formData,
      });
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

  const avatarUrl = user?.avatarUrl;

  return (
    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="প্রোফাইল" className="w-full h-full object-cover" />
        ) : (
          <span>{user?.name?.charAt(0) || "ক"}</span>
        )}
      </div>
      <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading ? (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="h-4 w-4 text-white" />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function ProfileEditDialog({ user, onSaved, toast }: { user: any; onSaved: () => void; toast: any }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      district: user?.district || "",
    },
    values: {
      name: user?.name || "",
      district: user?.district || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>প্রোফাইল সম্পাদনা</DialogTitle>
          <DialogDescription>আপনার তথ্য আপডেট করুন</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পুরো নাম</FormLabel>
                  <FormControl>
                    <Input placeholder="আপনার নাম লিখুন" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>জেলা</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="জেলা নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DISTRICTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-1">
              <Label className="text-sm text-muted-foreground">ফোন নম্বর</Label>
              <Input value={user?.phone || ""} disabled className="mt-1.5 bg-muted/50 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-1">ফোন নম্বর পরিবর্তন করা যাবে না</p>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PreviousDoctorsList({ doctors }: { doctors: any[] }) {
  if (doctors.length === 0) {
    return (
      <div className="text-center py-12 bg-accent/20 rounded-xl">
        <History className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">এখনো কোনো ডাক্তারের সাথে ভিজিট করা হয়নি</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/doctors">ডাক্তার খুঁজুন <ChevronRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {doctors.map(doc => (
        <div key={doc.doctorId} className="p-4 border border-border rounded-xl bg-card hover:bg-accent/10 transition-colors flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold shrink-0">
              {(doc.doctorName || "ড").charAt(0)}
            </div>
            <div>
              <p className="font-bold text-foreground">{doc.doctorName}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {doc.doctorDistrict && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {doc.doctorDistrict}
                  </span>
                )}
                {doc.specialties?.length > 0 && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Stethoscope className="h-3.5 w-3.5" /> {doc.specialties.slice(0, 2).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/doctors/${doc.doctorId}`}>
              প্রোফাইল দেখুন <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}

function AppointmentList({ appointments, showReview = false }: { appointments: any[]; showReview?: boolean }) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-accent/20 rounded-xl">
        <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">কোনো অ্যাপয়েন্টমেন্ট নেই</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/doctors">ডাক্তার খুঁজুন <ChevronRight className="ml-1 h-4 w-4" /></Link>
        </Button>
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
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold shrink-0">
                  {(apt.doctorName || "ড").charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-bold text-foreground">{apt.doctorName || "ডাক্তার"}</span>
                    <Badge variant="outline" className={s.cls}>{s.label}</Badge>
                    {apt.consultationFee > 0 && (
                      <span className="flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        <Banknote className="h-3.5 w-3.5" /> ৳{apt.consultationFee}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-3 mb-1.5">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" />{format(new Date(apt.appointmentDate), "dd MMM, yyyy")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{apt.appointmentTime}</span>
                    <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" />{apt.animalType}</span>
                  </div>
                  {apt.animalDescription && (
                    <p className="text-sm text-foreground/80 bg-accent/30 px-3 py-1.5 rounded-lg mt-1 max-w-md">{apt.animalDescription}</p>
                  )}
                </div>
              </div>
              {showReview && apt.status === "completed" && (
                <div className="flex items-center">
                  <ReviewDialog doctorId={apt.doctorId} doctorName={apt.doctorName || "ডাক্তার"} appointmentId={apt.id} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReviewDialog({ doctorId, doctorName, appointmentId }: { doctorId: number; doctorName: string; appointmentId: number }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createReview = useCreateReview();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const onSubmit = (data: ReviewFormValues) => {
    createReview.mutate({
      data: { doctorId, appointmentId, rating: data.rating, comment: data.comment }
    }, {
      onSuccess: () => {
        toast({ title: "ধন্যবাদ!", description: "আপনার রিভিউ সফলভাবে সাবমিট হয়েছে।" });
        setOpen(false);
      },
      onError: () => {
        toast({ variant: "destructive", title: "ত্রুটি", description: "রিভিউ সাবমিট করতে সমস্যা হয়েছে।" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
          <Star className="h-4 w-4 mr-1.5" /> রিভিউ দিন
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>রিভিউ দিন</DialogTitle>
          <DialogDescription>{doctorName}-এর চিকিৎসা সেবা সম্পর্কে আপনার মতামত জানান</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>রেটিং দিন</FormLabel>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => field.onChange(star)} className="focus:outline-none">
                        <Star className={`h-9 w-9 transition-colors ${star <= field.value ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মতামত (ঐচ্ছিক)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createReview.isPending}>
              {createReview.isPending ? "সাবমিট হচ্ছে..." : "সাবমিট করুন"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
