import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminGetStats, getAdminGetStatsQueryKey, useAdminListDoctors, getAdminListDoctorsQueryKey, useApproveDoctor, useAdminListAppointments, getAdminListAppointmentsQueryKey, useAdminListUsers, getAdminListUsersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Users, Stethoscope, Calendar, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats } = useAdminGetStats({ query: { queryKey: getAdminGetStatsQueryKey() } });
  
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="bg-slate-900 text-white pb-16 pt-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-blue-400" /> অ্যাডমিন প্যানেল
            </h1>
            <p className="text-slate-400 mb-8">প্ল্যাটফর্মের সকল কার্যক্রম পরিচালনা করুন</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">মোট ব্যবহারকারী</div>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">ডাক্তার (অপেক্ষমাণ)</div>
                <div className="text-2xl font-bold text-yellow-400">{stats?.pendingDoctors || 0}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">মোট অ্যাপয়েন্টমেন্ট</div>
                <div className="text-2xl font-bold text-green-400">{stats?.totalAppointments || 0}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">মোট রিভিউ</div>
                <div className="text-2xl font-bold text-blue-400">{stats?.totalReviews || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-12">
          <Card className="shadow-xl">
            <Tabs defaultValue="doctors" className="w-full">
              <CardHeader className="border-b border-border p-4 bg-muted/30">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2">
                  <TabsTrigger value="doctors" className="data-[state=active]:bg-background data-[state=active]:shadow py-2 px-4">
                    <Stethoscope className="h-4 w-4 mr-2" /> ডাক্তার অনুমোদন
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className="data-[state=active]:bg-background data-[state=active]:shadow py-2 px-4">
                    <Calendar className="h-4 w-4 mr-2" /> অ্যাপয়েন্টমেন্টসমূহ
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-background data-[state=active]:shadow py-2 px-4">
                    <Users className="h-4 w-4 mr-2" /> ব্যবহারকারী
                  </TabsTrigger>
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
    approveDoctor.mutate({
      id,
      data: { status }
    }, {
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

  if (isLoading) return <div className="py-12 text-center">লোড হচ্ছে...</div>;

  const doctors = data?.doctors || [];
  const pendingDoctors = doctors.filter(d => d.status === "pending");
  const otherDoctors = doctors.filter(d => d.status !== "pending");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center text-yellow-600">
          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
          অপেক্ষমাণ ডাক্তার ({pendingDoctors.length})
        </h3>
        {pendingDoctors.length > 0 ? (
          <div className="grid gap-4">
            {pendingDoctors.map(doc => (
              <div key={doc.id} className="flex flex-col md:flex-row justify-between items-center p-4 border border-yellow-200 bg-yellow-50/50 rounded-xl gap-4">
                <div className="flex-1">
                  <div className="font-bold text-lg">{doc.name}</div>
                  <div className="text-sm text-muted-foreground">{doc.phone} • {doc.district}</div>
                  <div className="text-sm mt-1">ফি: ৳{doc.consultationFee} • অভিজ্ঞতা: {doc.yearsExperience} বছর</div>
                  <div className="flex gap-1 mt-2">
                    {doc.specialties.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700" 
                    onClick={() => handleStatusChange(doc.id, "approved")}
                    disabled={approveDoctor.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> অনুমোদন
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50" 
                    onClick={() => handleStatusChange(doc.id, "rejected")}
                    disabled={approveDoctor.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> বাতিল
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-accent/30 rounded-xl">কোনো অপেক্ষমাণ ডাক্তার নেই</div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 text-foreground">অন্যান্য ডাক্তার</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">নাম</th>
                <th className="px-4 py-3">ফোন</th>
                <th className="px-4 py-3">জেলা</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3 rounded-tr-lg">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {otherDoctors.map(doc => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-accent/10">
                  <td className="px-4 py-3 font-medium">{doc.name}</td>
                  <td className="px-4 py-3">{doc.phone}</td>
                  <td className="px-4 py-3">{doc.district}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={doc.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                      {doc.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {doc.status === 'approved' ? (
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleStatusChange(doc.id, "rejected")}>
                        বাতিল করুন
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleStatusChange(doc.id, "approved")}>
                        অনুমোদন দিন
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppointmentsTab() {
  const { data, isLoading } = useAdminListAppointments({ query: { queryKey: getAdminListAppointmentsQueryKey() } });

  if (isLoading) return <div className="py-12 text-center">লোড হচ্ছে...</div>;

  const appointments = data || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">তারিখ</th>
            <th className="px-4 py-3">খামারি</th>
            <th className="px-4 py-3">ডাক্তার</th>
            <th className="px-4 py-3">পশু</th>
            <th className="px-4 py-3 rounded-tr-lg">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(apt => (
            <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-accent/10">
              <td className="px-4 py-3 whitespace-nowrap">
                {format(new Date(apt.appointmentDate), "dd MMM yyyy")} <br/>
                <span className="text-xs text-muted-foreground">{apt.appointmentTime}</span>
              </td>
              <td className="px-4 py-3 font-medium">{apt.farmerName}</td>
              <td className="px-4 py-3 font-medium">{apt.doctorName}</td>
              <td className="px-4 py-3">{apt.animalType}</td>
              <td className="px-4 py-3">
                <Badge variant="outline" className={
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }>
                  {apt.status === 'confirmed' ? 'নিশ্চিত' :
                   apt.status === 'pending' ? 'অপেক্ষমাণ' :
                   apt.status === 'completed' ? 'সম্পন্ন' : 'বাতিল'}
                </Badge>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">কোনো অ্যাপয়েন্টমেন্ট নেই</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const { data, isLoading } = useAdminListUsers({ query: { queryKey: getAdminListUsersQueryKey() } });

  if (isLoading) return <div className="py-12 text-center">লোড হচ্ছে...</div>;

  const users = data || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">নাম</th>
            <th className="px-4 py-3">ফোন</th>
            <th className="px-4 py-3">ভূমিকা</th>
            <th className="px-4 py-3">জেলা</th>
            <th className="px-4 py-3 rounded-tr-lg">যোগদানের তারিখ</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/10">
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3">{user.phone}</td>
              <td className="px-4 py-3">
                <Badge variant="outline" className={
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }>
                  {user.role === 'admin' ? 'অ্যাডমিন' : user.role === 'doctor' ? 'ডাক্তার' : 'খামারি'}
                </Badge>
              </td>
              <td className="px-4 py-3">{user.district || '-'}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {format(new Date(user.createdAt), "dd MMM yyyy")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
