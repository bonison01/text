
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon } from './Icons';

interface WebcamCaptureProps {
  onPhotoTaken: (imageDataUrl: string) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onPhotoTaken }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCamera]);


  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onPhotoTaken(imageDataUrl);
    stopCamera();
  };

  if (error) {
    return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <div className="relative w-full aspect-video bg-base-100 rounded-lg overflow-hidden shadow-lg border-2 border-base-300">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <button
        onClick={handleTakePhoto}
        disabled={!stream}
        className="mt-6 bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center"
      >
        <CameraIcon className="w-6 h-6 mr-3" />
        Take Photo
      </button>
    </div>
  );
};
