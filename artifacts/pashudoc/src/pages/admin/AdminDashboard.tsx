import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle, XCircle, Users, Stethoscope, Calendar,
  ShieldCheck, Clock, Star, TrendingUp, MapPin, AlertCircle,
  Settings, BarChart2, List, Menu, X,
} from "lucide-react";
import { format } from "date-fns";
import { AdminRevenue } from "./AdminRevenue";
import { AdminDoctorList } from "./AdminDoctorList";
import { AdminSiteSettings } from "./AdminSiteSettings";

type Section =
  | "overview"
  | "revenue"
  | "doctor-list"
  | "approvals"
  | "appointments"
  | "users"
  | "site-settings";

const NAV_ITEMS: { key: Section; icon: any; label: string }[] = [
  { key: "overview", icon: BarChart2, label: "ওভারভিউ" },
  { key: "revenue", icon: TrendingUp, label: "রাজস্ব রিপোর্ট" },
  { key: "doctor-list", icon: List, label: "ডাক্তার তালিকা" },
  { key: "approvals", icon: ShieldCheck, label: "ডাক্তার অনুমোদন" },
  { key: "appointments", icon: Calendar, label: "অ্যাপয়েন্টমেন্ট" },
  { key: "users", icon: Users, label: "ব্যবহারকারী" },
  { key: "site-settings", icon: Settings, label: "সাইট সেটিং" },
];

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (s: Section) => {
    setSection(s);
    setSidebarOpen(false);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        {/* Top header */}
        <section className="bg-primary py-4 border-b border-primary/20">
          <div className="max-w-screen-2xl mx-auto px-4 flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10 p-1.5"
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="p-1.5 bg-primary-foreground/10 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">অ্যাডমিন প্যানেল</h1>
              <p className="text-primary-foreground/70 text-xs hidden sm:block">পশুডক প্ল্যাটফর্মের সকল কার্যক্রম পরিচালনা করুন</p>
            </div>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto flex min-h-[calc(100vh-120px)]">
          {/* Sidebar Overlay (mobile) */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed lg:static top-0 left-0 h-full z-30 bg-white border-r border-border w-64 shrink-0
            transform transition-transform duration-200 lg:transform-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          `}>
            <div className="p-4 pt-20 lg:pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">প্রধান মেনু</p>
              <nav className="space-y-0.5">
                {NAV_ITEMS.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => navigate(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                      ${section === key
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {section === "overview" && <OverviewSection />}
            {section === "revenue" && <AdminRevenue />}
            {section === "doctor-list" && <AdminDoctorList />}
            {section === "approvals" && <ApprovalsSection />}
            {section === "appointments" && <AppointmentsSection />}
            {section === "users" && <UsersSection />}
            {section === "site-settings" && <AdminSiteSettings />}
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewSection() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">ওভারভিউ</h2>
        <p className="text-sm text-muted-foreground">প্ল্যাটফর্মের সামগ্রিক অবস্থা</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
    </div>
  );
}

// ─── Approvals ────────────────────────────────────────────────────────────────

function ApprovalsSection() {
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

  const doctors = Array.isArray(data) ? data : data?.doctors || [];
  const pendingDoctors = doctors.filter((d: any) => d.status === "pending");
  const approvedDoctors = doctors.filter((d: any) => d.status === "approved");
  const rejectedDoctors = doctors.filter((d: any) => d.status === "rejected");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> ডাক্তার অনুমোদন
        </h2>
        <p className="text-sm text-muted-foreground">নতুন ডাক্তারের আবেদন অনুমোদন বা বাতিল করুন</p>
      </div>

      {/* Pending */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <h3 className="font-bold text-foreground">অপেক্ষমাণ অনুমোদন ({pendingDoctors.length})</h3>
        </div>
        {pendingDoctors.length > 0 ? (
          <div className="grid gap-3">
            {pendingDoctors.map((doc: any) => (
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
                      {doc.specialties.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
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
          {doctors.map((doc: any) => (
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

// ─── Appointments ─────────────────────────────────────────────────────────────

function AppointmentsSection() {
  const { data, isLoading } = useAdminListAppointments({ query: { queryKey: getAdminListAppointmentsQueryKey() } });

  if (isLoading) return <LoadingSpinner />;

  const appointments = Array.isArray(data) ? data : [];

  const statusMap: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "নিশ্চিত", cls: "bg-green-50 text-green-700 border-green-200" },
    pending: { label: "অপেক্ষমাণ", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    completed: { label: "সম্পন্ন", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    cancelled: { label: "বাতিল", cls: "bg-red-50 text-red-700 border-red-200" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> অ্যাপয়েন্টমেন্ট
        </h2>
        <p className="text-sm text-muted-foreground">মোট {appointments.length}টি অ্যাপয়েন্টমেন্ট</p>
      </div>
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
              {appointments.map((apt: any) => {
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

// ─── Users ────────────────────────────────────────────────────────────────────

function UsersSection() {
  const { data, isLoading } = useAdminListUsers({ query: { queryKey: getAdminListUsersQueryKey() } });

  if (isLoading) return <LoadingSpinner />;

  const users = Array.isArray(data) ? data : [];

  const roleMap: Record<string, { label: string; cls: string }> = {
    admin: { label: "অ্যাডমিন", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    doctor: { label: "ডাক্তার", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    farmer: { label: "খামারি", cls: "bg-green-50 text-green-700 border-green-200" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> ব্যবহারকারী
        </h2>
        <p className="text-sm text-muted-foreground">মোট {users.length}জন ব্যবহারকারী</p>
      </div>
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
            {users.map((user: any) => {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
