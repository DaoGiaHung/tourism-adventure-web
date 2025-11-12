import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: "landmark" | "museum" | "restaurant" | "natural" | "adventure";
  difficulty: "easy" | "medium" | "hard";
  qrCode?: string;
  questions?: Question[];
  reward?: string;
  unlocksNearby?: string[]; // IDs of nearby checkpoints
  imageUrl?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface VisitRecord {
  checkpointId: string;
  visitedAt: number;
  completedAt?: number;
  method: "qr" | "quiz" | "manual";
  location: UserLocation;
}

interface LocationContextType {
  userLocation: UserLocation | null;
  error: string | null;
  isWatching: boolean;
  startWatching: () => void;
  stopWatching: () => void;
  checkpoints: Checkpoint[];
  visitedCheckpoints: VisitRecord[];
  nearbyCheckpoints: Checkpoint[];
  visitCheckpoint: (checkpointId: string, method: "qr" | "quiz" | "manual") => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Checkpoints state - attempt to load from backend, fallback to local sample
  const sampleCheckpoints: Checkpoint[] = [
    {
      id: "cp-1",
      name: "Grand Central Terminal",
      description: "Historic transportation hub",
      address: "89 E 42nd St, New York, NY 10017, USA",
      latitude: 40.7527,
      longitude: -73.9772,
      radius: 100,
      type: "landmark",
      difficulty: "easy",
      reward: "5 coins",
      unlocksNearby: ["cp-2", "cp-3"],
    },
    {
      id: "cp-2",
      name: "Times Square",
      description: "Famous entertainment district",
      address: "Manhattan, NY 10036, USA",
      latitude: 40.758,
      longitude: -73.9855,
      radius: 150,
      type: "landmark",
      difficulty: "medium",
      reward: "10 coins",
    },
    {
      id: "cp-3",
      name: "Bryant Park",
      description: "Public park in midtown",
      address: "Between 40th and 42nd St & 5th and 6th Ave, New York, NY 10018, USA",
      latitude: 40.7536,
      longitude: -73.9832,
      radius: 80,
      type: "natural",
      difficulty: "easy",
      reward: "3 coins",
    },
  ];

  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(sampleCheckpoints);

  // Try to load checkpoints from backend if available
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/checkpoints");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          setCheckpoints(data);
        }
      } catch (e) {
        // backend not available, keep sample
        // console.debug("No backend for /api/checkpoints or fetch failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [visitedCheckpoints, setVisitedCheckpoints] = useState<VisitRecord[]>(() => {
    try {
      const saved = localStorage.getItem("visitedCheckpoints");
      if (saved) return JSON.parse(saved);

      // Seed sample visit history using sampleCheckpoints so History isn't empty
      const now = Date.now();
      const seeded: VisitRecord[] = sampleCheckpoints.slice(0, 3).map((cp, idx) => ({
        checkpointId: cp.id,
        visitedAt: now - (idx + 1) * 3600 * 1000,
        completedAt: now - (idx + 1) * 3500 * 1000,
        method: idx % 2 === 0 ? "qr" : "quiz",
        location: {
          latitude: cp.latitude,
          longitude: cp.longitude,
          accuracy: 12 + idx * 5,
          timestamp: now - (idx + 1) * 3600 * 1000,
        },
      }));

      localStorage.setItem("visitedCheckpoints", JSON.stringify(seeded));
      return seeded;
    } catch (err) {
      return [];
    }
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const getNearbyCheckpoints = (location: UserLocation): Checkpoint[] => {
    // Increase buffer so users see more checkpoints even when not extremely close.
    // Set to 100 km (100000 meters) as requested.
    const BUFFER_METERS = 100000; // show checkpoints within cp.radius + 100000m (100 km)

    const found = checkpoints.filter((cp) => {
      const distance = calculateDistance(location.latitude, location.longitude, cp.latitude, cp.longitude);
      return distance <= cp.radius + BUFFER_METERS;
    });

    if (found.length > 0) return found;

    // If no checkpoints found from backend/sample, generate synthetic nearby checkpoints
    const generated = generateSyntheticCheckpoints(location, 6, 3000); // 6 items within 3km

    // Merge generated into checkpoints for this session so they persist in-memory
    setCheckpoints((prev) => {
      // Avoid duplicating if already merged
      const existingGenerated = prev.filter((p) => p.id.startsWith("gen-"));
      if (existingGenerated.length > 0) return prev;
      return [...prev, ...generated];
    });

    return generated;
  };

  // Procedurally generate N checkpoints around user's position
  const generateSyntheticCheckpoints = (location: UserLocation, count = 5, maxDistanceMeters = 2000): Checkpoint[] => {
    const items: Checkpoint[] = [];
    const R = 6371000; // earth radius meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    for (let i = 0; i < count; i++) {
      // random distance between 200m and maxDistanceMeters
      const d = 200 + Math.random() * (maxDistanceMeters - 200);
      const bearing = Math.random() * Math.PI * 2; // radians

      const φ1 = toRad(location.latitude);
      const λ1 = toRad(location.longitude);
      const δ = d / R; // angular distance

      const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(bearing));
      const λ2 = λ1 + Math.atan2(Math.sin(bearing) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

      const lat2 = toDeg(φ2);
      const lon2 = toDeg(λ2);

      const id = `gen-${Date.now()}-${i}`;
      items.push({
        id,
        name: `Local Checkpoint ${i + 1}`,
        description: "Auto-generated checkpoint",
        address: `Approx. ${lat2.toFixed(5)}, ${lon2.toFixed(5)}`,
        latitude: Number(lat2.toFixed(6)),
        longitude: Number(lon2.toFixed(6)),
        radius: 100 + Math.round(Math.random() * 200),
        type: "landmark",
        difficulty: Math.random() > 0.7 ? "medium" : "easy",
        reward: `${5 + Math.round(Math.random() * 10)} coins`,
      });
    }

    return items;
  };

  const startWatching = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsWatching(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        setUserLocation(newLocation);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsWatching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
  };

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsWatching(false);
  };

  const visitCheckpoint = (checkpointId: string, method: "qr" | "quiz" | "manual") => {
    if (!userLocation) return;

    const record: VisitRecord = {
      checkpointId,
      visitedAt: Date.now(),
      completedAt: Date.now(),
      method,
      location: userLocation,
    };

    const updated = [...visitedCheckpoints, record];
    setVisitedCheckpoints(updated);
    localStorage.setItem("visitedCheckpoints", JSON.stringify(updated));
  };

  const value: LocationContextType = {
    userLocation,
    error,
    isWatching,
    startWatching,
    stopWatching,
    checkpoints,
    visitedCheckpoints,
    nearbyCheckpoints: userLocation ? getNearbyCheckpoints(userLocation) : [],
    visitCheckpoint,
    calculateDistance,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
};
