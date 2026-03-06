"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserWebcamProps {
  userName: string;
  userPhotoURL?: string | null;
  className?: string;
  autoStart?: boolean;
  onCameraReady?: () => void;
  onCameraError?: (error: Error) => void;
}

export default function UserWebcam({
  userName,
  userPhotoURL,
  className = "",
  autoStart = true,
  onCameraReady,
  onCameraError,
}: UserWebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasStartedRef = useRef(false);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    // Prevent duplicate calls
    if (hasStartedRef.current || streamRef.current) {
      console.log("⚠️ Camera already initialized");
      return;
    }

    hasStartedRef.current = true;
    setLoading(true);
    setError(null);

    console.log("📹 Requesting camera access...");

    try {
      // Request ONLY video, no audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: "user",
        },
        audio: false, // Explicitly no audio
      });

      console.log("✅ Camera stream obtained:", stream.getVideoTracks().length, "video tracks");

      // Store the stream
      streamRef.current = stream;

      // Wait for video element to be ready
      if (videoRef.current) {
        // Set srcObject
        videoRef.current.srcObject = stream;

        // Wait for metadata to load
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error("Video element disappeared"));
            return;
          }

          const handleLoadedMetadata = () => {
            console.log("✅ Video metadata loaded");
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("error", handleError);
            resolve();
          };

          const handleError = () => {
            console.error("❌ Video element error");
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("error", handleError);
            reject(new Error("Video loading failed"));
          };

          video.addEventListener("loadedmetadata", handleLoadedMetadata);
          video.addEventListener("error", handleError);

          // If already loaded
          if (video.readyState >= 2) {
            handleLoadedMetadata();
          }
        });

        // Play the video
        try {
          await videoRef.current.play();
          console.log("✅ Video playback started");
        } catch (playErr) {
          console.warn("⚠️ Autoplay blocked, but video will still display:", playErr);
          // Video will still display even if autoplay is blocked
        }
      }

      setCameraActive(true);
      setLoading(false);
      console.log("✅ Camera fully active");

      if (onCameraReady) {
        onCameraReady();
      }
    } catch (err: any) {
      console.error("❌ Camera access error:", err);
      hasStartedRef.current = false;

      let errorMessage = "Failed to access camera";

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage = "Camera permission denied. Please allow camera access and refresh.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMessage = "No camera found on this device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMessage = "Camera is already in use by another application.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Camera doesn't support the requested settings.";
      } else if (err.name === "TypeError") {
        errorMessage = "Camera access not available (check HTTPS).";
      }

      setError(errorMessage);
      setLoading(false);

      if (onCameraError) {
        onCameraError(new Error(errorMessage));
      }
    }
  };

  const stopCamera = () => {
    console.log("🛑 Stopping camera...");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind, track.label);
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    hasStartedRef.current = false;
    console.log("✅ Camera stopped");
  };

  // Mount effect - runs once
  useEffect(() => {
    if (autoStart) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        startCamera();
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      // Cleanup on unmount only
      if (streamRef.current) {
        console.log("🔄 Component unmounting, cleaning up...");
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Run only once on mount

  // Fallback UI when camera is not active
  if (!cameraActive) {
    return (
      <div className={className}>
        <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center px-6">
            {loading ? (
              <div className="space-y-4">
                <Loader2 className="h-16 w-16 text-blue-400 animate-spin mx-auto" />
                <p className="text-gray-300 text-base font-medium">Starting camera...</p>
                <p className="text-gray-500 text-sm">Please allow camera access when prompted</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                </div>
                <div>
                  <p className="text-red-400 font-semibold mb-2">{error}</p>
                  <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
                    Make sure you're using HTTPS and camera permissions are enabled in your browser.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    hasStartedRef.current = false;
                    startCamera();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* User Avatar Placeholder */}
                <div className="h-48 w-48 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center mx-auto shadow-2xl overflow-hidden">
                  {userPhotoURL ? (
                    <img
                      src={userPhotoURL}
                      alt={userName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                      <span className="text-6xl font-bold text-white">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={startCamera}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active camera UI
  return (
    <div className={`relative ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls={false}
        className="w-full h-full min-h-[400px] rounded-lg object-cover bg-black shadow-2xl"
        style={{ 
          objectFit: 'cover',
          transform: 'scaleX(-1)', // Mirror effect for natural view
        }}
        data-testid="user-webcam-video"
      />

      {/* Camera Active Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        Camera Active
      </div>

      {/* Stop Button */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button
          onClick={stopCamera}
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 shadow-lg"
          data-testid="stop-camera-button"
        >
          <CameraOff className="h-4 w-4 mr-2" />
          Stop Camera
        </Button>
      </div>
    </div>
  );
}
