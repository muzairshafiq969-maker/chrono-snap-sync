import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { toast } from '@/hooks/use-toast';

interface CameraOptions {
  source?: CameraSource;
  quality?: number;
}

export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureImage = async (options: CameraOptions = {}) => {
    try {
      setIsCapturing(true);
      
      const image = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: options.source || CameraSource.Camera,
      });

      return image;
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const takePhoto = () => captureImage({ source: CameraSource.Camera });
  
  const selectFromGallery = () => captureImage({ source: CameraSource.Photos });

  return {
    captureImage,
    takePhoto,
    selectFromGallery,
    isCapturing
  };
}