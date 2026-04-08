import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  useAdminGetStats, getAdminGetStatsQueryKey,
  useAdminListDoctors, getAdminListDoctorsQueryKey,
  useApproveDoctor,
  useAdminListAppointments, getAdminListAppointmentsQueryKey,
  useAdminListUsers, getAdminListUsersQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle, XCircle, Users, Stethoscope, Calendar,
  ShieldCheck, Clock, Star, TrendingUp, MapPin, AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats } = useAdminGetStats({ query: { queryKey: getAdminGetStatsQueryKey() } });

  const statCards = [
    { label: "মোট ব্যবহারকারী", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "মোট ডাক্তার", value: stats?.totalDoctors || 0, icon: Stethoscope, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
    { label: "অপেক্ষমাণ ডাক্তার", value: stats?.pendingDoctors || 0, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "মোট অ্যাপয়েন্টমেন্ট", value: stats?.totalAppointments || 0, icon: Calendar, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { label: "সম্পন্ন অ্যাপয়েন্টমেন্ট", value: stats?.completedAppointments || 0, icon: CheckCircle, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
    { label: "মোট রিভিউ", value: stats?.totalReviews || 0, icon: Star, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        {/* Header */}
        <section className="bg-primary py-10 border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-foreground/10 rounded-xl">
                <ShieldCheck className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground">অ্যাডমিন প্যানেল</h1>
                <p className="text-primary-foreground/70 text-sm">পশুডক প্ল্যাটফর্মের সকল কার্যক্রম পরিচালনা করুন</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
              <Card key={label} className={`border ${border} ${bg}`}>
                <CardContent className="p-4">
                  <div className={`p-2 w-fit rounded-lg ${bg} mb-3`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Tabs */}
          <Card className="shadow-sm border-border/50">
            <Tabs defaultValue="doctors">
              <CardHeader className="border-b border-border pb-0 pt-4 px-4">
                <TabsList className="h-auto bg-transparent gap-1 p-0 border-b-0 flex-wrap">
                  {[
                    { value: "doctors", icon: Stethoscope, label: "ডাক্তার অনুমোদন" },
                    { value: "appointments", icon: Calendar, label: "অ্যাপয়েন্টমেন্ট" },
                    { value: "users", icon: Users, label: "ব্যবহারকারী" },
                  ].map(({ value, icon: Icon, label }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none pb-3 px-4 text-muted-foreground"
                    >
                      <Icon className="h-4 w-4 mr-1.5" /> {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </CardHeader>

              <CardContent className="p-6">
                <TabsContent value="doctors" className="mt-0">
                  <DoctorsTab />
                </TabsContent>
                <TabsContent value="appointments" className="mt-0">
                  <AppointmentsTab />
                </TabsContent>
                <TabsContent value="users" className="mt-0">
                  <UsersTab />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function DoctorsTab() {
  const { data, isLoading } = useAdminListDoctors({ query: { queryKey: getAdminListDoctorsQueryKey() } });
  const approveDoctor = useApproveDoctor();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: "approved" | "rejected") => {
    approveDoctor.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "সফল", description: `ডাক্তারকে ${status === "approved" ? "অনুমোদন" : "বাতিল"} করা হয়েছে` });
        queryClient.invalidateQueries({ queryKey: getAdminListDoctorsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "ত্রুটি", description: "অবস্থা পরিবর্তন করা যায়নি" });
      }
    });
  };

  if (isLoading) return <LoadingSpinner />;

  const doctors = data?.doctors || [];
  const pendingDoctors = doctors.filter(d => d.status === "pending");
  const approvedDoctors = doctors.filter(d => d.status === "approved");
  const rejectedDoctors = doctors.filter(d => d.status === "rejected");

  return (
    <div className="space-y-8">
      {/* Pending */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <h3 className="font-bold text-foreground">অপেক্ষমাণ অনুমোদন ({pendingDoctors.length})</h3>
        </div>
        {pendingDoctors.length > 0 ? (
          <div className="grid gap-3">
            {pendingDoctors.map(doc => (
              <div key={doc.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-amber-200 bg-amber-50/50 rounded-xl gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.phone} · {doc.district}</p>
                    <p className="text-sm text-muted-foreground">ফি: ৳{doc.consultationFee} · অভিজ্ঞতা: {doc.yearsExperience} বছর</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.specialties.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(doc.id, "approved")} disabled={approveDoctor.isPending}>
                    <CheckCircle className="h-4 w-4 mr-1" /> অনুমোদন
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(doc.id, "rejected")} disabled={approveDoctor.isPending}>
                    <XCircle className="h-4 w-4 mr-1" /> বাতিল
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="কোনো অপেক্ষমাণ ডাক্তার নেই" />
        )}
      </div>

      <Separator />

      {/* Approved & Rejected */}
      <div>
        <h3 className="font-bold text-foreground mb-4">অনুমোদিত ডাক্তার ({approvedDoctors.length})</h3>
        <DoctorTable doctors={approvedDoctors} onStatusChange={handleStatusChange} isPending={approveDoctor.isPending} />
      </div>

      {rejectedDoctors.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-bold text-foreground mb-4">বাতিল ডাক্তার ({rejectedDoctors.length})</h3>
            <DoctorTable doctors={rejectedDoctors} onStatusChange={handleStatusChange} isPending={approveDoctor.isPending} />
          </div>
        </>
      )}
    </div>
  );
}

function DoctorTable({ doctors, onStatusChange, isPending }: { doctors: any[], onStatusChange: (id: number, s: "approved" | "rejected") => void, isPending: boolean }) {
  if (!doctors.length) return <EmptyState message="কোনো ডাক্তার নেই" />;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 text-muted-foreground">
            <th className="px-4 py-3 text-left font-medium">নাম</th>
            <th className="px-4 py-3 text-left font-medium">ফোন</th>
            <th className="px-4 py-3 text-left font-medium">জেলা</th>
            <th className="px-4 py-3 text-left font-medium">স্ট্যাটাস</th>
            <th className="px-4 py-3 text-left font-medium">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map(doc => (
            <tr key={doc.id} className="border-t border-border hover:bg-accent/20 transition-colors">
              <td className="px-4 py-3 font-medium">{doc.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{doc.phone}</td>
              <td className="px-4 py-3 text-muted-foreground">{doc.district}</td>
              <td className="px-4 py-3">
                <Badge variant="outline" className={doc.status === "approved" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                  {doc.status === "approved" ? "অনুমোদিত" : "বাতিল"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {doc.status === "approved" ? (
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2" onClick={() => onStatusChange(doc.id, "rejected")} disabled={isPending}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> বাতিল করুন
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 px-2" onClick={() => onStatusChange(doc.id, "approved")} disabled={isPending}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> অনুমোদন দিন
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentsTab() {
  const { data, isLoading } = useAdminListAppointments({ query: { queryKey: getAdminListAppointmentsQueryKey() } });

  if (isLoading) return <LoadingSpinner />;

  const appointments = data || [];

  const statusMap: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "নিশ্চিত", cls: "bg-green-50 text-green-700 border-green-200" },
    pending: { label: "অপেক্ষমাণ", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    completed: { label: "সম্পন্ন", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    cancelled: { label: "বাতিল", cls: "bg-red-50 text-red-700 border-red-200" },
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">মোট {appointments.length}টি অ্যাপয়েন্টমেন্ট</p>
      {appointments.length === 0 ? (
        <EmptyState message="কোনো অ্যাপয়েন্টমেন্ট নেই" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">তারিখ ও সময়</th>
                <th className="px-4 py-3 text-left font-medium">খামারি</th>
                <th className="px-4 py-3 text-left font-medium">ডাক্তার</th>
                <th className="px-4 py-3 text-left font-medium">পশু</th>
                <th className="px-4 py-3 text-left font-medium">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => {
                const s = statusMap[apt.status] || { label: apt.status, cls: "" };
                return (
                  <tr key={apt.id} className="border-t border-border hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{format(new Date(apt.appointmentDate), "dd MMM yyyy")}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.appointmentTime}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{apt.farmerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{apt.doctorName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{apt.animalType}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={s.cls}>{s.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const { data, isLoading } = useAdminListUsers({ query: { queryKey: getAdminListUsersQueryKey() } });

  if (isLoading) return <LoadingSpinner />;

  const users = data || [];

  const roleMap: Record<string, { label: string; cls: string }> = {
    admin: { label: "অ্যাডমিন", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    doctor: { label: "ডাক্তার", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    farmer: { label: "খামারি", cls: "bg-green-50 text-green-700 border-green-200" },
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">মোট {users.length}জন ব্যবহারকারী</p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">নাম</th>
              <th className="px-4 py-3 text-left font-medium">ফোন</th>
              <th className="px-4 py-3 text-left font-medium">ভূমিকা</th>
              <th className="px-4 py-3 text-left font-medium">জেলা</th>
              <th className="px-4 py-3 text-left font-medium">যোগদান</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const r = roleMap[user.role] || { label: user.role, cls: "" };
              return (
                <tr key={user.id} className="border-t border-border hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.phone}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={r.cls}>{r.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.district ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{user.district}</span> : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(user.createdAt), "dd MMM yyyy")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 bg-accent/20 rounded-xl text-muted-foreground">{message}</div>
  );
}
