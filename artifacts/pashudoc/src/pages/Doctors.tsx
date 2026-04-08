import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearch } from "wouter";
import { useListDoctors, getListDoctorsQueryKey } from "@workspace/api-client-react";
import { Search, MapPin, Star, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICTS, ANIMAL_TYPES, getAnimalIcon } from "@/lib/constants";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Doctors() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const [district, setDistrict] = useState<string>(searchParams.get("district") || "all");
  const [animalType, setAnimalType] = useState<string>(searchParams.get("specialty") || "all");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = {
    ...(district !== "all" && { district }),
    ...(animalType !== "all" && { specialty: animalType }),
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data: doctorsData, isLoading } = useListDoctors(queryParams, {
    query: { queryKey: getListDoctorsQueryKey(queryParams) }
  });

  const clearFilters = () => {
    setDistrict("all");
    setAnimalType("all");
    setSearchQuery("");
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">ডাক্তার খুঁজুন</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="ডাক্তারের নাম..." 
                  className="pl-10 h-12 bg-background border-border shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-doctor"
                />
              </div>
            </div>
            
            <div className="md:col-span-4 lg:col-span-4">
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="h-12 bg-background border-border shadow-sm" data-testid="filter-district">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="জেলা নির্বাচন করুন" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব জেলা</SelectItem>
                  {DISTRICTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-4 lg:col-span-4">
              <Select value={animalType} onValueChange={setAnimalType}>
                <SelectTrigger className="h-12 bg-background border-border shadow-sm" data-testid="filter-animal">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="পশুর ধরন" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ধরন</SelectItem>
                  {ANIMAL_TYPES.map(a => {
                    const Icon = getAnimalIcon(a.id);
                    return (
                      <SelectItem key={a.id} value={a.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{a.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-12 lg:col-span-1 flex items-center justify-end">
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground h-12" data-testid="button-clear-filters">
                <X className="h-4 w-4 mr-2 lg:hidden" />
                <span className="lg:hidden">ফিল্টার মুছুন</span>
                <X className="h-5 w-5 hidden lg:block" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-medium text-foreground">
            {isLoading ? "খোঁজা হচ্ছে..." : `${doctorsData?.total || 0} জন ডাক্তার পাওয়া গেছে`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-muted rounded-full mb-4"></div>
                  <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted rounded"></div>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : doctorsData?.doctors.length ? (
            doctorsData.doctors.map((doctor, index) => (
              <div 
                key={doctor.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden hover-elevate transition-all border-border/50 hover:border-primary/30 flex flex-col h-full">
                  <CardContent className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-16 w-16 bg-primary/10 text-primary flex items-center justify-center rounded-full text-xl font-bold">
                        {doctor.name.charAt(0)}
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold px-2 py-1">
                        <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                        {doctor.averageRating?.toFixed(1) || "5.0"}
                        <span className="text-xs font-normal ml-1 text-amber-700/70">({doctor.totalReviews || 0})</span>
                      </Badge>
                    </div>
                    
                    <Link href={`/doctors/${doctor.id}`}>
                      <h3 className="text-xl font-bold text-foreground mb-1 hover:text-primary transition-colors cursor-pointer" data-testid={`doctor-name-${doctor.id}`}>
                        {doctor.name}
                      </h3>
                    </Link>
                    
                    <p className="text-muted-foreground text-sm flex items-center mb-4">
                      <MapPin className="h-3.5 w-3.5 mr-1" /> {doctor.upazila ? `${doctor.upazila}, ` : ''}{doctor.district}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {doctor.specialties.map(spec => {
                        const Icon = getAnimalIcon(spec);
                        const animalLabel = ANIMAL_TYPES.find(a => a.id === spec)?.label || spec;
                        return (
                          <Badge key={spec} variant="outline" className="bg-background text-xs py-1 border-border">
                            <Icon className="h-3 w-3 mr-1 text-primary" />
                            {animalLabel}
                          </Badge>
                        );
                      })}
                    </div>
                    
                    <div className="text-sm font-medium text-foreground bg-accent/50 p-3 rounded-lg flex items-center justify-between mt-auto">
                      <span className="text-muted-foreground">পরামর্শ ফি:</span>
                      <span className="text-primary font-bold text-lg">৳{doctor.consultationFee}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 gap-3 border-t border-border/50 bg-background/50">
                    <Button variant="outline" className="w-full" asChild data-testid={`button-call-${doctor.id}`}>
                      <a href={`tel:${doctor.phone}`}>কল করুন</a>
                    </Button>
                    <Button className="w-full hover-elevate" asChild data-testid={`button-book-${doctor.id}`}>
                      <Link href={`/book/${doctor.id}`}>বুক করুন</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-card rounded-2xl border border-dashed border-border">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">কোনো ডাক্তার পাওয়া যায়নি</h3>
              <p className="text-muted-foreground mb-6">অন্য কোনো জেলা বা পশুর ধরন নির্বাচন করে চেষ্টা করুন</p>
              <Button onClick={clearFilters}>ফিল্টার মুছুন</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
