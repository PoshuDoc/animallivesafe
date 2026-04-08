import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { useListAppointments, getListAppointmentsQueryKey, useUpdateAppointment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarIcon, Clock, CheckCircle, XCircle, Users, TrendingUp,
  Stethoscope, Settings, MapPin, Phone,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "নিশ্চিত", cls: "bg-green-100 text-green-800 border-green-200" },
  pending:   { label: "অপেক্ষমাণ", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  completed: { label: "সম্পন্ন", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  cancelled: { label: "বাতিল", cls: "bg-red-100 text-red-800 border-red-200" },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: appointmentsResponse, isLoading } = useListAppointments({
    query: { queryKey: getListAppointmentsQueryKey() }
  });
  const updateAppointment = useUpdateAppointment();

  const handleUpdateStatus = (id: number, status: "confirmed" | "completed" | "cancelled") => {
    updateAppointment.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "সফল", description: "অ্যাপয়েন্টমেন্ট আপডেট করা হয়েছে" });
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "ত্রুটি", description: "আপডেট করতে সমস্যা হয়েছে" });
      }
    });
  };

  const appointments = appointmentsResponse?.appointments || [];

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayApts = appointments.filter(a => a.appointmentDate === todayStr && a.status !== "cancelled");
  const pending   = appointments.filter(a => a.status === "pending");
  const confirmed = appointments.filter(a => a.status === "confirmed");
  const completed = appointments.filter(a => a.status === "completed");

  const stats = [
    { label: "আজকের অ্যাপয়েন্টমেন্ট", value: todayApts.length, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", icon: CalendarIcon },
    { label: "অপেক্ষমাণ", value: pending.length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
    { label: "মোট রোগী সেবা", value: completed.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Users },
    { label: "এই মাসে সম্পন্ন", value: completed.filter(a => new Date(a.appointmentDate).getMonth() === new Date().getMonth()).length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: TrendingUp },
  ];

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <Layout>
        {/* Header */}
        <section className="bg-primary/5 border-b border-border py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md">
                  {user?.name?.charAt(0) || "ড"}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Stethoscope className="h-3.5 w-3.5" /> ভেটেরিনারি ডাক্তার
                  </p>
                  <h1 className="text-2xl font-bold text-foreground">ডা. {user?.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{user?.phone}</span>
                    {user?.district && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{user.district}</span>}
                  </div>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/doctor/register">
                  <Settings className="mr-2 h-4 w-4" /> প্রোফাইল আপডেট
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, color, bg, border, icon: Icon }) => (
              <Card key={label} className={`border ${border} ${bg}`}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg bg-white/60`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                  </div>
                  <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Today's quick view */}
          {todayApts.length > 0 && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <CalendarIcon className="h-4 w-4" /> আজকের অ্যাপয়েন্টমেন্ট ({todayApts.length}টি)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {todayApts.slice(0, 4).map(apt => {
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

          {/* Appointments Tabs */}
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
                        <AppointmentList
                          appointments={[...pending, ...confirmed]}
                          onUpdate={handleUpdateStatus}
                          isPending={updateAppointment.isPending}
                        />
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
      {appointments.map(apt => {
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
