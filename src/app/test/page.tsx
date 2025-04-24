"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
  SearchIcon,
  Clock,
  MapPin,
} from "lucide-react";
import { DateRange } from "react-day-picker";

import Appbar from "@/components/Appbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

// Types
interface Attraction {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  visitDuration: string;
  bestTime: string;
  selected?: boolean;
  location: {
    latitude: number;
    longitude: number;
  }
}

interface TripPlan {
  day: number;
  date: Date;
  attractions: Attraction[];
  startTime: string;
  endTime: string;
  bestTime: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 3))
  });
  const [searchResults, setSearchResults] = useState<Attraction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAttractions, setSelectedAttractions] = useState<Attraction[]>([]);
  const [tripPlan, setTripPlan] = useState<TripPlan[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [showTripPlan, setShowTripPlan] = useState(false);
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentView, setCurrentView] = useState("map");

  // Search attractions using Gemini API
  const searchAttractions = async () => {
    if (!debouncedSearch || !date?.from || !date?.to) return;

    setIsSearching(true);
    try {
      const dateRange = `${format(date.from, "MMM d, yyyy")} to ${format(date.to, "MMM d, yyyy")}`;

      // Call to Gemini API
      const response = await fetch("/api/gemini/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: debouncedSearch,
          dateRange
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.attractions);
        setShowResults(true);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error fetching attractions");
    } finally {
      setIsSearching(false);
    }
  };

  // Create trip plan using Gemini API
  const createTripPlan = async () => {
    if (selectedAttractions.length === 0 || !date?.from || !date?.to) return;

    setIsPlanning(true);
    try {
      const dateRange = `${format(date.from, "MMM d, yyyy")} to ${format(date.to, "MMM d, yyyy")}`;

      // Call to Gemini API
      const response = await fetch("/api/gemini/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attractions: selectedAttractions,
          dateRange
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTripPlan(data.plan);
        setShowTripPlan(true);
      } else {
        console.error("Failed to create trip plan");
      }
    } catch (error) {
      console.error("Error creating trip plan:", error);
    } finally {
      setIsPlanning(false);
    }
  };

  // Toggle attraction selection
  const toggleAttractionSelection = (attraction: Attraction) => {
    const isSelected = selectedAttractions.some(a => a.id === attraction.id);

    if (isSelected) {
      setSelectedAttractions(selectedAttractions.filter(a => a.id !== attraction.id));
    } else {
      setSelectedAttractions([...selectedAttractions, attraction]);
    }
  };

  // Handle explore button click
  const handleExplore = () => {
    if (searchTerm && date?.from && date?.to) {
      searchAttractions();
    }
  };

  // Start trip
  const startTrip = () => {
    setIsTripActive(true);
  };

  // Render attraction cards
  const renderAttractionCards = () => {
    if (isSearching) {
      return Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="w-full">
          <CardHeader>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ));
    }

    return searchResults.map(attraction => {
      const isSelected = selectedAttractions.some(a => a.id === attraction.id);

      return (
        <Card key={attraction.id} className={`w-full ${isSelected ? 'border-primary' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{attraction.name}</CardTitle>
                <CardDescription>{attraction.category}</CardDescription>
              </div>
              <div className="flex items-center">
                <Link href={`https://www.google.com/maps?q=${attraction.name}`} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4 mr-2" />
                </Link>
                <Badge>{attraction.rating}/5</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative mb-4 bg-muted rounded-md overflow-hidden">
              <img
                src={attraction.image}
                alt={attraction.name}
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{attraction.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {attraction.visitDuration}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {attraction.bestTime}
              </Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant={isSelected ? "default" : "outline"}
              className="w-full"
              onClick={() => toggleAttractionSelection(attraction)}
            >
              {isSelected ? "Selected" : "Add to Trip"}
            </Button>
          </CardFooter>
        </Card>
      );
    });
  };

  // Render trip plan
  const renderTripPlan = () => {
    if (isPlanning) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Accordion key={index} type="single" collapsible className="w-full mb-4">
          <AccordionItem value="day">
            <AccordionTrigger>
              <Skeleton className="h-4 w-48" />
            </AccordionTrigger>
            <AccordionContent>
              <Skeleton className="h-24 w-full mb-2" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ));
    }

    return tripPlan.map(day => (
      <Accordion key={day.day} type="single" collapsible className="w-full mb-4">
        <AccordionItem value={`day-${day.day}`}>
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span>Day {day.day}: {format(day.date, "EEEE, MMM d")}</span>
              <Badge variant="outline">{day.startTime} - {day.endTime}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {day.attractions.map((attraction, idx) => (
                <div key={attraction.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{idx + 1}. {attraction.name}</h4>
                      <p className="text-sm text-muted-foreground">{attraction.visitDuration}</p>
                    </div>
                    <Badge>{attraction.rating}/5</Badge>
                  </div>
                  <p className="text-sm">{attraction.description}</p>
                  <p className="text-sm mt-2"><span className="font-medium">Best time:</span> {attraction.bestTime}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ));
  };

  // Render map view
  const renderMapView = () => {
    return (
      <div className="bg-muted h-[500px] rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Map will be displayed here</p>
        {/* Replace with actual map component */}
      </div>
    );
  };

  // Render active trip features
  const renderActiveTrip = () => {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Active Trip</h2>
          <Button variant="outline" onClick={() => setIsTripActive(false)}>End Trip</Button>
        </div>

        <Tabs defaultValue="map" onValueChange={setCurrentView}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="food">Restaurants</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
          </TabsList>

          <TabsContent value="map">
            {renderMapView()}
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Itinerary</CardTitle>
                  <CardDescription>
                    {tripPlan.length > 0 && format(tripPlan[0].date, "EEEE, MMM d")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tripPlan.length > 0 && tripPlan[0].attractions.map((attraction, idx) => (
                      <div key={attraction.id} className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center font-medium">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{attraction.name}</h4>
                          <p className="text-xs text-muted-foreground">{attraction.visitDuration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="food">
            <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Restaurant recommendations will be displayed here</p>
            </div>
          </TabsContent>

          <TabsContent value="hotels">
            <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Hotel recommendations will be displayed here</p>
            </div>
          </TabsContent>

          <TabsContent value="transport">
            <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Transport options will be displayed here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  if (isTripActive) {
    return (
      <main className="min-h-screen flex flex-col">
        <Appbar />
        {renderActiveTrip()}
      </main>
    );
  }

  return (
    <main className="mt-24 min-h-screen flex flex-col">
      <Appbar />

      {!showResults ? (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
            <motion.div
              className="absolute inset-0 bg-[url('/images/travel-bg.jpg')] bg-cover bg-center"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>

          <div className="container mx-auto px-4 z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">Discover Your Perfect Journey</h1>
                <p className="text-lg md:text-xl mb-8 text-muted-foreground">
                  Plan the ideal route to visit all your favorite destinations in the most efficient way.
                </p>
              </motion.div>

              <motion.div
                className="bg-background/80 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter your destination"
                      className="pl-10 h-12"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 border-dashed flex justify-start text-left font-normal md:w-[240px]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "MMM d")} - {format(date.to, "MMM d, yyyy")}
                            </>
                          ) : (
                            format(date.from, "MMM d, yyyy")
                          )
                        ) : (
                          <span>Select dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button className="h-12" size="lg" onClick={handleExplore} disabled={!searchTerm || isSearching}>
                    <SearchIcon className="mr-2 h-5 w-5" />
                    Explore
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {!showTripPlan ? (
            <section className="py-8 pt-24">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold">Attractions in {searchTerm}</h2>
                    <p className="text-muted-foreground mt-1">
                      {date?.from && date?.to && `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {selectedAttractions.length} places selected
                    </span>
                    <Button
                      onClick={() => {
                        setIsPlanning(true);
                        createTripPlan();
                      }}
                      disabled={selectedAttractions.length === 0}
                    >
                      Create Trip Plan
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {renderAttractionCards()}
                </div>

                <div className="mt-8 text-center">
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    Back to Search
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            <section className="py-8 pt-24">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold">Your Trip Plan for {searchTerm}</h2>
                    <p className="text-muted-foreground mt-1">
                      {date?.from && date?.to && `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => setShowTripPlan(false)}>
                      Edit Selections
                    </Button>
                    <Button onClick={startTrip}>Start Trip</Button>
                  </div>
                </div>

                <div className="mb-8">
                  {renderTripPlan()}
                </div>

                <div className="mt-8 text-center">
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    New Search
                  </Button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Discover Places",
                description: "Find the best attractions and hidden gems at your destination.",
                icon: "🔍",
              },
              {
                title: "Optimize Routes",
                description: "We'll calculate the best path to see everything on your list.",
                icon: "🗺️",
              },
              {
                title: "Start Your Journey",
                description: "Get real-time guidance and information during your trip.",
                icon: "🚗",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-lg p-6 shadow-sm border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {!showResults && (
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "User-Friendly Interface",
                  description: "Our app is designed to be intuitive and easy to use.",
                },
                {
                  title: "Real-Time Updates",
                  description: "Stay informed with live updates and notifications.",
                },
                {
                  title: "24/7 Support",
                  description: "We're here to help you anytime, anywhere.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-lg p-6 shadow-sm border border-border"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}