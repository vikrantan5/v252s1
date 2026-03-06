"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const isMountedRef = useRef(true);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startCamera = useCallback(async () => {
    // Prevent starting if camera is already active
    if (cameraActive || loading || streamRef.current) {
      console.log("⚠️ Camera already active or starting");
      return;
    }
    
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      // Log environment for debugging
      console.log("Camera access attempt:", {
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        hostname: window.location.hostname
      });

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false, // Audio handled by VAPI
      });
      
      // Check if component is still mounted
      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        // Assign the stream to the video element
        videoRef.current.srcObject = stream;
        
        // Wait for video metadata to load before playing
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not found"));
            return;
          }

          const videoElement = videoRef.current;

          const onLoadedMetadata = () => {
            videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
            resolve();
          };

          const onError = (e: Event) => {
            videoElement.removeEventListener("error", onError);
            reject(new Error("Video loading error"));
          };

          videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
          videoElement.addEventListener("error", onError);

          // If metadata is already loaded, resolve immediately
          if (videoElement.readyState >= 2) {
            videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
            videoElement.removeEventListener("error", onError);
            resolve();
          }
        });

        // Now play the video with proper error handling
        try {
          await videoRef.current.play();
          console.log("✅ Video playback started successfully");
        } catch (playError: any) {
          console.warn("⚠️ Video autoplay failed, attempting manual play:", playError);
          // Some browsers block autoplay, but the video will still show
          // User interaction might be needed to start playback
        }
      }

      setCameraActive(true);
      setLoading(false);
      
      if (onCameraReady) {
        onCameraReady();
      }

      console.log("✅ User webcam started successfully");
    } catch (err: any) {
      console.error("❌ Camera error:", err);
      
      let errorMessage = "Failed to access camera";
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage = "Camera permission denied";
        setPermissionDenied(true);
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMessage = "No camera found";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMessage = "Camera is already in use";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Camera constraints not supported";
      } else if (err.name === "TypeError" && err.message.includes("getUserMedia")) {
        errorMessage = "Camera access not supported in this context";
      }

      setError(errorMessage);
      setLoading(false);
      
      if (onCameraError) {
        onCameraError(new Error(errorMessage));
      }
    }
  }, [cameraActive, loading, onCameraReady, onCameraError]);

  const stopCamera = useCallback(() => {
    console.log("🛑 Stopping camera...");
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    console.log("🛑 User webcam stopped");
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (autoStart && !cameraActive && !loading && !streamRef.current) {
      console.log("📹 Auto-starting camera...");
      startCamera();
    }

    // Cleanup ONLY on unmount
    return () => {
      console.log("🔄 Component unmounting, cleaning up camera...");
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, [autoStart, cameraActive, loading, startCamera]);

  // Render fallback when camera is not active
  const renderFallback = () => (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-center">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 text-blue-400 animate-spin mx-auto" />
            <p className="text-gray-300 text-sm">Starting camera...</p>
          </div>
        ) : error ? (
          <div className="space-y-4 px-6">
            <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <div>
              <p className="text-red-400 font-semibold mb-2">{error}</p>
              {permissionDenied && (
                <div className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
                  Please allow camera access in your browser settings and refresh the page.
                </div>
              )}
            </div>
            {!permissionDenied && (
              <Button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Camera className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
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
  );

  if (!cameraActive) {
    return <div className={className}>{renderFallback()}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls={false}
        className="w-full h-full min-h-[400px] rounded-lg object-cover bg-black"
        data-testid="user-webcam-video"
        style={{ objectFit: 'cover' }}
      />

      {/* Camera Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <Button
          onClick={stopCamera}
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700"
          data-testid="stop-camera-button"
        >
          <CameraOff className="h-4 w-4 mr-2" />
          Stop Camera
        </Button>
      </div>

      {/* Active Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        Camera Active
      </div>
    </div>
  );
}