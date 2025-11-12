
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TouristPlace } from "@/services/api";
import { 
  loadItinerary, 
  saveItinerary, 
  addToItinerary as addPlace, 
  removeFromItinerary as removePlace 
} from "@/services/localStorage";
import { toast } from "sonner";

interface ItineraryContextType {
  itinerary: TouristPlace[];
  addToItinerary: (place: TouristPlace) => void;
  removeFromItinerary: (placeId: string) => void;
  clearItinerary: () => void;
  isInItinerary: (placeId: string) => boolean;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const ItineraryProvider = ({ children }: { children: ReactNode }) => {
  const [itinerary, setItinerary] = useState<TouristPlace[]>([]);

  // Load itinerary from localStorage on initial render
  useEffect(() => {
    const saved = loadItinerary();
    if (saved && saved.length > 0) {
      setItinerary(saved);
      return;
    }

    // Seed sample itinerary when none exists
    const sampleItinerary: TouristPlace[] = [
      {
        id: "1",
        name: "Saigon Railway Station",
        rating: 4.2,
        imageUrl: "https://vietnamtraintickets.info/wp-content/uploads/2018/10/Front-entrance-to-Saigon-Railway-Station-e1583724874267.jpg",
        description: "Historic railway station in the heart of Ho Chi Minh City.",
        location: { lat: 10.774, lng: 106.676 },
        address: "1 Nguyen Thong Street, Ward 9, District 3, Ho Chi Minh City",
        category: "Transport Hub",
      },
      {
        id: "2",
        name: "Notre-Dame Cathedral Basilica of Saigon",
        rating: 4.6,
        imageUrl: "https://statics.vinwonders.com/Saigon-Notre-Dame-cathedral-6_1692257373.jpg",
        description: "Historic Catholic cathedral built in 1880 by French colonists.",
        location: { lat: 10.7798, lng: 106.699 },
        address: "Cong Xa Paris Square, Ben Nghe Ward, District 1, Ho Chi Minh City",
        category: "Religious Site",
      },
      {
        id: "3",
        name: "Ben Thanh Market",
        rating: 4.0,
        imageUrl: "https://vietnamdiscovery.com/wp-content/uploads/2019/10/Ben-Thanh-market-Saigon.jpeg",
        description: "Iconic market in the heart of Ho Chi Minh City, established in 1914.",
        location: { lat: 10.7725, lng: 106.698 },
        address: "Le Loi Street, Ben Thanh Ward, District 1, Ho Chi Minh City",
        category: "Shopping",
      },
    ];

    saveItinerary(sampleItinerary);
    setItinerary(sampleItinerary);
  }, []);

  // Add a place to itinerary
  const addToItinerary = (place: TouristPlace) => {
    if (isInItinerary(place.id)) {
      toast.info(`${place.name} is already in your itinerary`);
      return;
    }
    
    const updatedItinerary = addPlace(place);
    setItinerary(updatedItinerary);
    toast.success(`Added ${place.name} to your itinerary`);
  };

  // Remove a place from itinerary
  const removeFromItinerary = (placeId: string) => {
    const placeToRemove = itinerary.find(place => place.id === placeId);
    const updatedItinerary = removePlace(placeId);
    setItinerary(updatedItinerary);
    
    if (placeToRemove) {
      toast.success(`Removed ${placeToRemove.name} from your itinerary`);
    }
  };

  // Clear entire itinerary
  const clearItinerary = () => {
    saveItinerary([]);
    setItinerary([]);
    toast.success("Cleared your itinerary");
  };

  // Check if place is in itinerary
  const isInItinerary = (placeId: string): boolean => {
    return itinerary.some(place => place.id === placeId);
  };

  return (
    <ItineraryContext.Provider
      value={{
        itinerary,
        addToItinerary,
        removeFromItinerary,
        clearItinerary,
        isInItinerary,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error("useItinerary must be used within an ItineraryProvider");
  }
  return context;
};
