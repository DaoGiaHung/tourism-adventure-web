import React, { useEffect, useState } from "react";
import { useLocation, Checkpoint, VisitRecord } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QRScanner } from "@/components/QRScanner";
import { CheckpointQuiz } from "@/components/CheckpointQuiz";
import Map from "@/components/Map";
import {
  MapPin,
  Navigation,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Trophy,
  Compass,
  Zap,
} from "lucide-react";

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

const typeIcons: Record<string, React.ReactNode> = {
  landmark: "🏛️",
  museum: "🏺",
  restaurant: "🍽️",
  natural: "🌳",
  adventure: "🎢",
};

export const CheckpointDiscovery: React.FC = () => {
  const { userLocation, error, isWatching, startWatching, stopWatching, nearbyCheckpoints, visitCheckpoint, calculateDistance, visitedCheckpoints } =
    useLocation();

  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(false);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  useEffect(() => {
    setVisitedIds(new Set(visitedCheckpoints.map((v) => v.checkpointId)));
  }, [visitedCheckpoints]);

  useEffect(() => {
    if (!isWatching && !userLocation) {
      startWatching();
    }
  }, []);

  const handleUnlock = (checkpoint: Checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setUnlockDialogOpen(true);
  };

  const handleQRScan = (data: string) => {
    if (selectedCheckpoint) {
      visitCheckpoint(selectedCheckpoint.id, "qr");
      setVisitedIds(new Set([...visitedIds, selectedCheckpoint.id]));
      setShowQRScanner(false);
      setUnlockDialogOpen(false);

      // Show success message
      setTimeout(() => {
        alert(`✅ Unlocked: ${selectedCheckpoint.name}!`);
      }, 300);
    }
  };

  const handleQuizComplete = () => {
    if (selectedCheckpoint) {
      visitCheckpoint(selectedCheckpoint.id, "quiz");
      setVisitedIds(new Set([...visitedIds, selectedCheckpoint.id]));
      setShowQuiz(false);
      setUnlockDialogOpen(false);

      setTimeout(() => {
        alert(`✅ Unlocked: ${selectedCheckpoint.name}!`);
      }, 300);
    }
  };

  const isCheckpointVisited = (checkpointId: string) => visitedIds.has(checkpointId);
  const isCheckpointNearby = (checkpoint: Checkpoint) => {
    if (!userLocation) return false;
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      checkpoint.latitude,
      checkpoint.longitude
    );
    // Match the provider's nearby buffer (larger radius so users see more points)
    // Using 100 km (100000 meters) per request
    const BUFFER_METERS = 100000;
    return distance <= checkpoint.radius + BUFFER_METERS;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Adventure Map</h1>
          <p className="text-muted-foreground">Discover checkpoints around you</p>
        </div>

        {/* GPS Status */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isWatching && !userLocation && (
          <Alert>
            <Compass className="h-4 w-4" />
            <AlertDescription>
              <Button
                size="sm"
                onClick={startWatching}
                className="ml-2"
              >
                Enable Location
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {userLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Latitude</p>
                  <p className="font-mono">{userLocation.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longitude</p>
                  <p className="font-mono">{userLocation.longitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="font-mono">±{userLocation.accuracy.toFixed(1)}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Checkpoints Nearby</p>
                  <p className="font-mono text-accent text-lg font-bold">{nearbyCheckpoints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checkpoints Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Nearby Checkpoints</h2>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{nearbyCheckpoints.length} found</Badge>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant={showMap ? "outline" : "ghost"} onClick={() => setShowMap(false)}>List</Button>
                <Button size="sm" variant={showMap ? "ghost" : "outline"} onClick={() => setShowMap(true)}>Map</Button>
              </div>
            </div>
          </div>

          {nearbyCheckpoints.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <p>No checkpoints nearby. Explore more areas!</p>
              </CardContent>
            </Card>
          ) : showMap ? (
            <div>
              <Map
                places={nearbyCheckpoints.map((cp) => ({
                  id: cp.id,
                  name: cp.name,
                  location: { lat: cp.latitude, lng: cp.longitude },
                  category: cp.type,
                  address: cp.address || undefined,
                  rating: Math.max(3, Math.round((Math.random() * 2 + 3) * 10) / 10),
                  businessFeatures: { isBusinessFriendly: false }
                })) as any}
                center={userLocation ? [userLocation.latitude, userLocation.longitude] : undefined}
                zoom={userLocation ? 14 : 6}
                className="w-full h-96 rounded-md"
                hoveredPlaceId={hoveredPlaceId}
                userLocation={userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : null}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyCheckpoints.map((checkpoint) => {
                const distance =
                  userLocation &&
                  calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    checkpoint.latitude,
                    checkpoint.longitude
                  );
                const isVisited = isCheckpointVisited(checkpoint.id);
                const isNearby = isCheckpointNearby(checkpoint);

                return (
                  <Card key={checkpoint.id} className={`overflow-hidden transition-all ${isVisited ? "border-green-500" : ""}`}
                    onMouseEnter={() => setHoveredPlaceId(checkpoint.id)}
                    onMouseLeave={() => setHoveredPlaceId(null)}
                  >
                    {checkpoint.imageUrl && (
                      <img src={checkpoint.imageUrl} alt={checkpoint.name} className="w-full h-40 object-cover" />
                    )}

                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <span>{typeIcons[checkpoint.type] || "📍"}</span>
                            {checkpoint.name}
                          </CardTitle>
                          <CardDescription>{checkpoint.description}</CardDescription>
                          {checkpoint.address && (
                            <p className="text-sm text-muted-foreground mt-1">{checkpoint.address}</p>
                          )}
                        </div>
                        {isVisited && <Trophy className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Badges */}
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={difficultyColors[checkpoint.difficulty]}>
                          {checkpoint.difficulty}
                        </Badge>
                        {isNearby && (
                          <Badge className="bg-green-100 text-green-800 animate-pulse">
                            <Zap className="h-3 w-3 mr-1" />
                            In Range
                          </Badge>
                        )}
                        {isVisited && <Badge className="bg-green-100 text-green-800">Visited</Badge>}
                      </div>

                      {/* Distance */}
                      {typeof distance === "number" && (
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Distance: <span className="font-mono">{(distance / 1000).toFixed(2)}km</span>
                          </p>
                        </div>
                      )}

                      {/* Reward */}
                      {checkpoint.reward && (
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>{checkpoint.reward}</span>
                        </div>
                      )}

                      {/* Action Button */}
                      {isVisited ? (
                        <Button disabled className="w-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Unlocked
                        </Button>
                      ) : isNearby ? (
                        <Button
                          onClick={() => handleUnlock(checkpoint)}
                          className="w-full bg-accent hover:bg-accent/90"
                        >
                          <Unlock className="h-4 w-4 mr-2" />
                          Unlock Now
                        </Button>
                      ) : (
                        <Button disabled variant="outline" className="w-full">
                          <Lock className="h-4 w-4 mr-2" />
                          Get Closer
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        checkpointName={selectedCheckpoint?.name}
      />

      {/* Quiz Dialog */}
      {selectedCheckpoint?.questions && (
        <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
          <DialogContent className="max-w-2xl">
            <CheckpointQuiz
              checkpointName={selectedCheckpoint.name}
              questions={selectedCheckpoint.questions}
              onComplete={handleQuizComplete}
              onSkip={() => setShowQuiz(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Unlock Method Selection Dialog */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock: {selectedCheckpoint?.name}</DialogTitle>
            <DialogDescription>Choose how you want to verify your visit</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setShowQRScanner(true);
                setUnlockDialogOpen(false);
              }}
              variant="outline"
              className="h-auto p-4 flex flex-col"
            >
              <span className="text-2xl mb-2">📱</span>
              <span className="font-semibold">Scan QR Code</span>
              <span className="text-xs text-muted-foreground mt-1">Quick verification</span>
            </Button>

            {selectedCheckpoint?.questions && selectedCheckpoint.questions.length > 0 && (
              <Button
                onClick={() => {
                  setShowQuiz(true);
                  setUnlockDialogOpen(false);
                }}
                variant="outline"
                className="h-auto p-4 flex flex-col"
              >
                <span className="text-2xl mb-2">❓</span>
                <span className="font-semibold">Answer Questions</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {selectedCheckpoint.questions.length} questions
                </span>
              </Button>
            )}
          </div>

          <Button variant="outline" onClick={() => setUnlockDialogOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
