import React, { useMemo, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Trophy, Download, Trash2, BarChart3 } from "lucide-react";

const typeIcons: Record<string, string> = {
  landmark: "🏛️",
  museum: "🏺",
  restaurant: "🍽️",
  natural: "🌳",
  adventure: "🎢",
};

export const TravelHistory: React.FC = () => {
  const { visitedCheckpoints, checkpoints } = useLocation();
  const [filterMethod, setFilterMethod] = useState<"all" | "qr" | "quiz" | "manual">("all");

  // Group visits by date
  const visitsByDate = useMemo(() => {
    const grouped = new Map<string, typeof visitedCheckpoints>();

    visitedCheckpoints.forEach((visit) => {
      const date = new Date(visit.visitedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(visit);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [visitedCheckpoints]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalVisits: visitedCheckpoints.length,
      uniqueCheckpoints: new Set(visitedCheckpoints.map((v) => v.checkpointId)).size,
      qrScans: visitedCheckpoints.filter((v) => v.method === "qr").length,
      quizzes: visitedCheckpoints.filter((v) => v.method === "quiz").length,
      manualChecks: visitedCheckpoints.filter((v) => v.method === "manual").length,
      totalDistance: visitedCheckpoints.reduce((acc, visit, idx, arr) => {
        if (idx === 0) return 0;
        const prev = arr[idx - 1];
        const R = 6371000; // Earth's radius in meters
        const φ1 = (prev.location.latitude * Math.PI) / 180;
        const φ2 = (visit.location.latitude * Math.PI) / 180;
        const Δφ = ((visit.location.latitude - prev.location.latitude) * Math.PI) / 180;
        const Δλ = ((visit.location.longitude - prev.location.longitude) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return acc + R * c;
      }, 0),
    };
  }, [visitedCheckpoints]);

  const filteredVisits =
    filterMethod === "all" ? visitedCheckpoints : visitedCheckpoints.filter((v) => v.method === filterMethod);

  const getCheckpointInfo = (checkpointId: string) => {
    return checkpoints.find((cp) => cp.id === checkpointId);
  };

  const methodLabels: Record<string, { label: string; color: string; icon: string }> = {
    qr: { label: "QR Scan", color: "bg-blue-100 text-blue-800", icon: "📱" },
    quiz: { label: "Quiz", color: "bg-purple-100 text-purple-800", icon: "❓" },
    manual: { label: "Manual", color: "bg-gray-100 text-gray-800", icon: "✓" },
  };

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      stats,
      visits: visitedCheckpoints.map((visit) => ({
        checkpoint: getCheckpointInfo(visit.checkpointId),
        ...visit,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `travel-history-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your travel history? This action cannot be undone.")) {
      localStorage.removeItem("visitedCheckpoints");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Travel History</h1>
          <p className="text-muted-foreground">Track your adventures and discoveries</p>
        </div>

        {/* Statistics */}
        {visitedCheckpoints.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVisits}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.uniqueCheckpoints} unique places</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Distance Traveled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.totalDistance / 1000).toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">kilometers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">QR Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.qrScans}</div>
                <p className="text-xs text-muted-foreground mt-1">quick verifications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.quizzes}</div>
                <p className="text-xs text-muted-foreground mt-1">challenges passed</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleExportData} variant="outline" disabled={visitedCheckpoints.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button
            onClick={handleClearHistory}
            variant="destructive"
            disabled={visitedCheckpoints.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>

        {/* History List */}
        {visitedCheckpoints.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="h-12 w-12 mx-auto opacity-20 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No visits yet</h3>
              <p className="text-muted-foreground">Start exploring to build your travel history!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Filter Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="qr">QR</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {renderVisitsList(visitedCheckpoints, checkpoints, methodLabels)}
              </TabsContent>

              <TabsContent value="qr" className="space-y-4">
                {renderVisitsList(
                  visitedCheckpoints.filter((v) => v.method === "qr"),
                  checkpoints,
                  methodLabels
                )}
              </TabsContent>

              <TabsContent value="quiz" className="space-y-4">
                {renderVisitsList(
                  visitedCheckpoints.filter((v) => v.method === "quiz"),
                  checkpoints,
                  methodLabels
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                {renderVisitsList(
                  visitedCheckpoints.filter((v) => v.method === "manual"),
                  checkpoints,
                  methodLabels
                )}
              </TabsContent>
            </Tabs>

            {/* Timeline View */}
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Timeline</h3>
              {visitsByDate.map(([date, visits]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {date}
                    </CardTitle>
                    <CardDescription>{visits.length} visits on this day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {visits.map((visit, idx) => {
                        const checkpoint = getCheckpointInfo(visit.checkpointId);
                        const methodInfo = methodLabels[visit.method];

                        return (
                          <div key={`${visit.checkpointId}-${idx}`} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-2xl">{checkpoint && typeIcons[checkpoint.type]}</span>
                              <div className="flex-1">
                                <p className="font-medium">{checkpoint?.name || "Unknown Location"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(visit.visitedAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <Badge className={methodInfo.color}>
                              <span className="mr-1">{methodInfo.icon}</span>
                              {methodInfo.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function renderVisitsList(
  visits: any[],
  checkpoints: any[],
  methodLabels: Record<string, any>
) {
  if (visits.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
          No visits recorded with this method
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {visits.map((visit, idx) => {
        const checkpoint = checkpoints.find((cp) => cp.id === visit.checkpointId);
        const methodInfo = methodLabels[visit.method];

        return (
          <Card key={`${visit.checkpointId}-${idx}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-3xl">{checkpoint && typeIcons[checkpoint.type]}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{checkpoint?.name || "Unknown Location"}</h3>
                    <p className="text-sm text-muted-foreground">{checkpoint?.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(visit.visitedAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {visit.location.latitude.toFixed(4)}, {visit.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={methodInfo.color}>
                  <span className="mr-1">{methodInfo.icon}</span>
                  {methodInfo.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
