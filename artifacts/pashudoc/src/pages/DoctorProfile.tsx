import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { useGetDoctor, getGetDoctorQueryKey, useGetDoctorReviews, getGetDoctorReviewsQueryKey } from "@workspace/api-client-react";
import { MapPin, Star, Clock, FileText, Phone, CalendarCheck, ShieldCheck, ChevronLeft } from "lucide-react";
import { ANIMAL_TYPES, getAnimalIcon } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function DoctorProfile() {
  const params = useParams();
  const doctorId = Number(params.id);

  const { data: doctor, isLoading: isLoadingDoctor } = useGetDoctor(doctorId, {
    query: {
      enabled: !!doctorId,
      queryKey: getGetDoctorQueryKey(doctorId)
    }
  });

  const { data: reviews, isLoading: isLoadingReviews } = useGetDoctorReviews(doctorId, {
    query: {
      enabled: !!doctorId,
      queryKey: getGetDoctorReviewsQueryKey(doctorId)
    }
  });

  if (isLoadingDoctor) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 w-full">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full rounded-2xl mb-6" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">ডাক্তার খুঁজে পাওয়া যায়নি</h2>
          <Button asChild>
            <Link href="/doctors">ফিরে যান</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary/5 border-b border-border pb-12 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
            <Link href="/doctors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              ডাক্তার তালিকায় ফিরে যান
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <div className="h-24 w-24 md:h-32 md:w-32 bg-primary/10 text-primary flex items-center justify-center rounded-full text-4xl md:text-5xl font-bold shadow-sm border-4 border-background">
              {doctor.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="doctor-profile-name">{doctor.name}</h1>
                  <p className="text-lg text-muted-foreground flex items-center mb-3">
                    <MapPin className="h-5 w-5 mr-1.5" /> 
                    {doctor.clinicName ? `${doctor.clinicName}, ` : ''}{doctor.upazila ? `${doctor.upazila}, ` : ''}{doctor.district}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.map(spec => {
                      const Icon = getAnimalIcon(spec);
                      const animalLabel = ANIMAL_TYPES.find(a => a.id === spec)?.label || spec;
                      return (
                        <Badge key={spec} variant="secondary" className="bg-background text-sm py-1 border-border shadow-sm">
                          <Icon className="h-4 w-4 mr-1.5 text-primary" />
                          {animalLabel}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                  <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                  <div>
                    <div className="text-xl font-bold text-amber-900">{doctor.averageRating?.toFixed(1) || "5.0"}</div>
                    <div className="text-xs text-amber-700">{doctor.totalReviews || 0} রিভিউ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <Card className="shadow-md border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  ডাক্তার সম্পর্কে
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {doctor.bio || `${doctor.name} একজন অভিজ্ঞ ভেটেরিনারি ডাক্তার। তিনি ${doctor.district} জেলায় পশু চিকিৎসা প্রদান করে আসছেন।`}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-accent/50 p-4 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">অভিজ্ঞতা</div>
                    <div className="font-bold text-foreground text-lg">{doctor.yearsExperience || 0} বছর</div>
                  </div>
                  <div className="bg-accent/50 p-4 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">সর্বমোট চিকিৎসা</div>
                    <div className="font-bold text-foreground text-lg">{doctor.totalAppointments || 0}+</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="shadow-md border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-primary" />
                  রোগীদের মতামত ({doctor.totalReviews || 0})
                </h2>
                
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                ) : reviews?.length ? (
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-foreground">{review.farmerName || "খামারি"}</div>
                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-500" : "fill-muted text-muted"}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {format(new Date(review.createdAt), "dd MMM, yyyy")}
                        </div>
                        {review.comment && (
                          <p className="text-foreground/90">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-accent/30 rounded-xl">
                    এখনও কোনো রিভিউ নেই
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card className="shadow-lg border-primary/20 sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-sm text-muted-foreground mb-1">পরামর্শ ফি</div>
                  <div className="text-4xl font-bold text-primary">৳{doctor.consultationFee}</div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                    ভেরিফাইড ডাক্তার
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    সরাসরি/ফোনে পরামর্শ
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full h-12 text-lg hover-elevate shadow-md" asChild data-testid="button-book-appointment">
                    <Link href={`/book/${doctor.id}`}>
                      <CalendarCheck className="h-5 w-5 mr-2" />
                      অ্যাপয়েন্টমেন্ট নিন
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-lg" asChild>
                    <a href={`tel:${doctor.phone}`}>
                      <Phone className="h-5 w-5 mr-2" />
                      কল করুন
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
