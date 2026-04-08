import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { useListAppointments, getListAppointmentsQueryKey, useCreateReview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Star, Calendar as CalendarIcon, Clock, Stethoscope, Search, MapPin, ChevronRight, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "নিশ্চিত", cls: "bg-green-100 text-green-800 border-green-200" },
  pending:   { label: "অপেক্ষমাণ", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  completed: { label: "সম্পন্ন", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  cancelled: { label: "বাতিল", cls: "bg-red-100 text-red-800 border-red-200" },
};

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { data: appointmentsResponse, isLoading } = useListAppointments({
    query: { queryKey: getListAppointmentsQueryKey() }
  });

  const appointments = appointmentsResponse?.appointments || [];

  const pending   = appointments.filter(a => a.status === "pending");
  const confirmed = appointments.filter(a => a.status === "confirmed");
  const completed = appointments.filter(a => a.status === "completed");
  const cancelled = appointments.filter(a => a.status === "cancelled");

  const stats = [
    { label: "মোট বুকিং", value: appointments.length, color: "text-foreground", bg: "bg-card", border: "border-border" },
    { label: "অপেক্ষমাণ", value: pending.length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "নিশ্চিত", value: confirmed.length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
    { label: "সম্পন্ন", value: completed.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  ];

  return (
    <ProtectedRoute allowedRoles={["farmer"]}>
      <Layout>
        {/* Header */}
        <section className="bg-primary/5 border-b border-border py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0) || "ক"}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">স্বাগতম</p>
                  <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {user?.phone}</span>
                    {user?.district && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.district}</span>}
                  </div>
                </div>
              </div>
              <Button className="hover-elevate" asChild>
                <Link href="/doctors">
                  <Search className="mr-2 h-4 w-4" /> নতুন ডাক্তার খুঁজুন
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, color, bg, border }) => (
              <Card key={label} className={`border ${border} ${bg}`}>
                <CardContent className="p-5 text-center">
                  <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Appointments Tabs */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="border-b border-border pb-0 pt-4 px-4">
              <Tabs defaultValue="all">
                <TabsList className="h-auto bg-transparent gap-1 p-0 border-b-0">
                  {[
                    { value: "all", label: `সব (${appointments.length})` },
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
      {appointments.map(apt => {
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
