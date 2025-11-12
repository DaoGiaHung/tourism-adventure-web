import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import jsQR from "jsqr";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  checkpointName?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan, checkpointName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);

        // Simple QR code detection using canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const scanInterval = setInterval(() => {
          try {
            if (!videoRef.current || !ctx) return;

            const v = videoRef.current;
            if (v.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) return;

            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code && code.data) {
              // Found QR code
              onScan(code.data);
              stopCamera();
              onClose();
            }
          } catch (err) {
            // ignore errors during scanning
          }
        }, 150);

        // Store interval ID for cleanup
        if (videoRef.current) {
          (videoRef.current as any).scanInterval = scanInterval;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to access camera";
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setStreamActive(false);

      // Clear scan interval
      if ((videoRef.current as any).scanInterval) {
        clearInterval((videoRef.current as any).scanInterval);
      }
    }
  };

  const handleManualScan = () => {
    // For demo purposes, use a sample QR code data
    onScan("checkpoint:cp-1:qr123456");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            {checkpointName && `Point camera at QR code at ${checkpointName}`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {streamActive && (
          <video
            ref={videoRef}
            className="w-full rounded-lg bg-black"
            autoPlay
            playsInline
            style={{ maxHeight: "400px" }}
          />
        )}

        {isScanning && !streamActive && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-accent" />
              <p className="text-sm text-muted-foreground">Requesting camera access...</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleManualScan}>
            Manual Scan (Demo)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
