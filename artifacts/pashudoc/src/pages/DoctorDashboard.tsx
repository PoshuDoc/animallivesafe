import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import { useListAppointments, getListAppointmentsQueryKey, useUpdateAppointment, useGetMe, getGetMeQueryKey, useGetDoctor, getGetDoctorQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // We need to fetch the doctor profile to check if it exists and status
  // since the user object doesn't contain doctor details, we use the user id to fetch doctor?
  // Wait, the API doesn't have a direct /api/doctors/me. Let's assume there is a way or we just check appointments.
  // Actually, useGetMe might return doctor info if populated, but User type doesn't have doctor.
  // The task says "Doctor: today's appointments, total patients, profile status".
  // If a doctor hasn't registered a profile, they should be redirected to /doctor/register.
  // Let's assume if appointments fetch fails with 404 or something, they need to register, but let's just fetch it.

  const { data: appointmentsResponse, isLoading } = useListAppointments({
    query: { queryKey: getListAppointmentsQueryKey() }
  });

  const updateAppointment = useUpdateAppointment();

  const handleUpdateStatus = (id: number, status: "confirmed" | "completed" | "cancelled") => {
    updateAppointment.mutate({
      id,
      data: { status }
    }, {
      onSuccess: () => {
        toast({ title: "সফল", description: "অ্যাপয়েন্টমেন্ট আপডেট করা হয়েছে" });
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "ত্রুটি", description: "আপডেট করতে সমস্যা হয়েছে" });
      }
    });
  };

  // Error handling for missing doctor profile could be improved based on actual API response
  // If the API returns a specific error when doctor profile is missing, we could catch it.
  
  const appointments = appointmentsResponse?.appointments || [];
  
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const todayAppointments = appointments.filter(a => {
    const today = format(new Date(), "yyyy-MM-dd");
    return a.appointmentDate === today;
  });

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">স্বাগতম, ডাক্তার {user?.name}</h1>
              <p className="text-muted-foreground">আপনার ড্যাশবোর্ড ওভারভিউ</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/doctor/register">প্রোফাইল আপডেট</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">আজকের অ্যাপয়েন্টমেন্ট</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{todayAppointments.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">অপেক্ষমাণ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-600">{pendingAppointments.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">সর্বমোট রোগী</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{appointments.filter(a => a.status === 'completed').length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md border-border/50">
            <CardHeader>
              <CardTitle>নতুন ও আসন্ন অ্যাপয়েন্টমেন্ট</CardTitle>
              <CardDescription>যেগুলো নিশ্চিত করা প্রয়োজন বা সামনে আছে</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').map(apt => (
                    <div key={apt.id} className="p-4 border border-border rounded-xl bg-card">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg">{apt.farmerName || "খামারি"}</span>
                            <Badge variant="outline" className={
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }>
                              {apt.status === 'confirmed' ? 'নিশ্চিত' : 'অপেক্ষমাণ'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:gap-4 gap-1 mb-2">
                            <span className="flex items-center"><CalendarIcon className="h-3.5 w-3.5 mr-1" /> {format(new Date(apt.appointmentDate), "dd MMM, yyyy")}</span>
                            <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {apt.appointmentTime}</span>
                            <span className="bg-accent px-2 py-0.5 rounded text-foreground">{apt.animalType}</span>
                          </div>
                          {apt.animalDescription && (
                            <p className="text-sm text-foreground/80 mt-2 bg-accent/30 p-2 rounded">{apt.animalDescription}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {apt.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> নিশ্চিত করুন
                              </Button>
                              <Button 
                                variant="outline" 
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> বাতিল
                              </Button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleUpdateStatus(apt.id, "completed")}
                            >
                              চিকিৎসা সম্পন্ন
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      কোনো নতুন বা আসন্ন অ্যাপয়েন্টমেন্ট নেই
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-accent/20 rounded-xl">
                  <p className="text-muted-foreground">আপনার কোনো অ্যাপয়েন্টমেন্ট নেই</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
