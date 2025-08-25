import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';

interface CameraOptions {
  source?: CameraSource;
  quality?: number;
}

export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);

  const isNative = Capacitor.isNativePlatform();
  const isCapacitorAvailable = Capacitor.isPluginAvailable('Camera');

  const captureImage = async (options: CameraOptions = {}) => {
    try {
      setIsCapturing(true);
      
      // Check if we're in a native environment with camera support
      if (isNative && isCapacitorAvailable) {
        const image = await Camera.getPhoto({
          quality: options.quality || 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: options.source || CameraSource.Camera,
        });
        return image;
      } else {
        // Web fallback - return null to trigger file input
        console.log('Camera not available, falling back to file input');
        return null;
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Not Available",
        description: "Camera is not available in web browser. Please use the file upload option instead.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const takePhoto = async () => {
    if (!isNative && !isCapacitorAvailable) {
      toast({
        title: "Camera Not Available",
        description: "Camera is only available on mobile devices. Please use 'Upload File' instead.",
        variant: "destructive"
      });
      return null;
    }
    return captureImage({ source: CameraSource.Camera });
  };
  
  const selectFromGallery = async () => {
    if (!isNative && !isCapacitorAvailable) {
      toast({
        title: "Gallery Not Available", 
        description: "Gallery is only available on mobile devices. Please use 'Upload File' instead.",
        variant: "destructive"
      });
      return null;
    }
    return captureImage({ source: CameraSource.Photos });
  };

  return {
    captureImage,
    takePhoto,
    selectFromGallery,
    isCapturing,
    isNative,
    isCapacitorAvailable
  };
}