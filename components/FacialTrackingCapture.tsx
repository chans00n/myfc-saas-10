"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Camera, SunMedium, AlertTriangle, Check } from "lucide-react";

const FacialTrackingCapture = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [lightingScore, setLightingScore] = useState<number>(0);
  const [alignmentScore, setAlignmentScore] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when component mounts or when camera is switched
  useEffect(() => {
    // Initialize camera for steps 1 and 2
    if (step === 1 || step === 2) {
      initializeCamera();
    }

    return () => {
      // Only stop camera when moving away from steps that need it
      if (step > 2 && streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isFrontCamera]);

  // Handle step changes without reinitializing camera
  useEffect(() => {
    // If moving from step 3 or 4 back to step 1 or 2, reinitialize camera
    if ((step === 1 || step === 2) && !streamRef.current) {
      initializeCamera();
    } else if ((step === 1 || step === 2) && streamRef.current && videoRef.current) {
      // Ensure video element has the stream when switching between steps 1 and 2
      videoRef.current.srcObject = streamRef.current;
    }
    
    // If moving away from camera steps, stop the stream
    if (step > 2 && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [step]);

  const initializeCamera = async () => {
    try {
      setCameraError(null);
      
      // Only stop the current stream if switching cameras
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Simulate lighting and alignment detection
        setTimeout(() => {
          setLightingScore(Math.floor(Math.random() * 40) + 60); // 60-100
          setAlignmentScore(Math.floor(Math.random() * 40) + 60); // 60-100
          setIsReady(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Unable to access camera. Please check permissions and try again.");
    }
  };

  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const photoData = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(photoData);
        
        // Move to next step
        setStep(3);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setStep(2);
  };

  const savePhoto = async () => {
    if (!capturedPhoto) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Prepare metadata
      const metadata = {
        captureTime: new Date().toISOString(),
        device: navigator.userAgent,
        isFrontCamera: isFrontCamera
      };
      
      // Send photo to API
      const response = await fetch('/api/facial-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: capturedPhoto,
          lightingScore,
          alignmentScore,
          metadata
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Move to completion step
      setStep(4);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const startNewCapture = () => {
    setCapturedPhoto(null);
    setStep(1);
  };

  const proceedToAlignment = () => {
    setStep(2);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center">
        <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step === 1 ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-200 text-neutral-600'}`}>
          1
        </div>
        <div className="w-16 h-1 bg-neutral-200">
          <div className={`h-full bg-neutral-800 ${step > 1 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step === 2 ? 'bg-neutral-800 text-neutral-100' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
          2
        </div>
        <div className="w-16 h-1 bg-neutral-200">
          <div className={`h-full bg-neutral-800 ${step > 2 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step === 3 ? 'bg-neutral-800 text-neutral-100' : step > 3 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
          3
        </div>
        <div className="w-16 h-1 bg-neutral-200">
          <div className={`h-full bg-neutral-800 ${step > 3 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step === 4 ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-200 text-neutral-600'}`}>
          4
        </div>
      </div>
    </div>
  );

  const renderStepLabel = () => (
    <div className="flex justify-center mb-4 text-sm text-neutral-600">
      <div className="flex w-full max-w-md justify-between px-4">
        <div className="text-center">Set up</div>
        <div className="text-center">Align</div>
        <div className="text-center">Capture</div>
        <div className="text-center">Verify</div>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-neutral-900">Facial Fitness Photo Capture</CardTitle>
        <CardDescription className="text-center">
          Create consistent, high-quality photos to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button 
            className="w-full py-4 text-lg"
            onClick={step === 1 ? proceedToAlignment : 
                     step === 2 ? capturePhoto : 
                     step === 3 ? savePhoto : 
                     startNewCapture}
            disabled={isUploading || (step === 3 && !capturedPhoto)}
          >
            {isUploading ? 'Uploading...' : 
             step === 1 ? "Capture Your Progress Photo" : 
             step === 2 ? "Capture Photo" : 
             step === 3 ? "Save Photo" : 
             "Start New Capture"}
          </Button>
        </div>

        {renderStepIndicator()}
        {renderStepLabel()}

        {cameraError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}
        
        {uploadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="text-center">
            <p className="mb-4 text-neutral-600">
              Please allow camera access to capture your progress photos.
            </p>
            <div className="aspect-[3/4] bg-black rounded-lg overflow-hidden relative mb-4">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="aspect-[3/4] bg-black rounded-lg overflow-hidden relative mb-4">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border-4 border-dashed border-white/50 rounded-full transform scale-75"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50"></div>
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50"></div>
              </div>

              {/* Lighting indicator */}
              <div className="absolute top-3 right-3 flex items-center bg-black/70 rounded-full px-2 py-1">
                <SunMedium className="h-4 w-4 text-yellow-400 mr-1" />
                <div className="w-16 h-2 bg-neutral-200 rounded-full">
                  <div 
                    className={`h-full rounded-full ${
                      lightingScore < 70 ? 'bg-destructive' : 
                      lightingScore < 85 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`} 
                    style={{width: `${lightingScore}%`}}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mb-4">
              <Button 
                variant="outline" 
                onClick={switchCamera} 
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" /> Switch Camera
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="aspect-[3/4] bg-black rounded-lg overflow-hidden relative mb-4">
              {capturedPhoto && <img src={capturedPhoto} alt="Captured facial progress" className="w-full h-full object-cover" />}
            </div>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={retakePhoto} 
                className="flex-1"
                disabled={isUploading}
              >
                Retake
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-6">
            <div className="mb-4 flex justify-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-full">
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Photo Saved Successfully!</h3>
            <p className="text-neutral-600 mb-6">Your progress photo has been saved to your gallery.</p>
          </div>
        )}

        {/* Hidden canvas for capturing photos */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        {step === 1 && (
          <div className="mt-6 bg-neutral-100 p-4 rounded-lg">
            <h3 className="text-neutral-900 font-medium mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Tips for perfect progress photos
            </h3>
            <ul className="text-neutral-600 text-sm space-y-2">
              <li className="flex">
                <span className="mr-2 text-neutral-800">•</span>
                <span>Use natural light if possible, facing a window for even lighting</span>
              </li>
              <li className="flex">
                <span className="mr-2 text-neutral-800">•</span>
                <span>Keep a neutral facial expression (no smiling or frowning)</span>
              </li>
              <li className="flex">
                <span className="mr-2 text-neutral-800">•</span>
                <span>Position your face in the oval outline with eyes at the horizontal line</span>
              </li>
              <li className="flex">
                <span className="mr-2 text-neutral-800">•</span>
                <span>Remove glasses, hats, or anything covering your face</span>
              </li>
              <li className="flex">
                <span className="mr-2 text-neutral-800">•</span>
                <span>Take photos at the same time of day for consistency</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacialTrackingCapture; 