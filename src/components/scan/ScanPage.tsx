import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCamera } from '@/hooks/useCamera';
import { analyzeImage, isUnidentifiableMeal } from '@/services/nutritionAnalysis';
import { uploadImage } from '@/services/storageService';
import { addToCache } from '@/services/cacheService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Camera, ImageIcon, Loader2 } from 'lucide-react';
import { NutritionAnalysis } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';
import { NutritionResults } from './NutritionResults';

export function ScanPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const { takePhoto, selectFromGallery, isCapturing } = useCamera();
  const { user } = useAuth();

  const handleImageCapture = async (imageResult: any) => {
    if (!imageResult) return;

    try {
      // Convert URI to File for web upload
      const response = await fetch(imageResult.webPath || imageResult.path);
      const blob = await response.blob();
      const file = new File([blob], `meal-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      setImageFile(file);
      setSelectedImage(imageResult.webPath || imageResult.path);
      setAnalysis(null);
    } catch (error) {
      console.error('Image processing error:', error);
      toast({
        title: "Image Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTakePhoto = async () => {
    const image = await takePhoto();
    if (image) handleImageCapture(image);
  };

  const handleSelectFromGallery = async () => {
    const image = await selectFromGallery();
    if (image) handleImageCapture(image);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !user) return;

    setIsAnalyzing(true);
    try {
      // 1. Upload image to Supabase Storage
      const imageUrl = await uploadImage(imageFile, user.id);
      
      // 2. Analyze image via n8n webhook
      const result = await analyzeImage(imageFile);
      
      // 3. Save to database
      const { data, error } = await (supabase as any)
        .from('meal_history')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          meal_name: result.mealName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          fiber: result.fiber,
          sugar: result.sugar,
          sodium: result.sodium,
          confidence_score: result.confidenceScore,
          health_score: result.healthScore,
          rationale: result.rationale,
          analysis: result
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Save Error",
          description: "Analysis completed but failed to save. Please try again.",
          variant: "destructive"
        });
      } else {
        // 4. Add to local cache
        if (data) addToCache(data.id, result, imageUrl);
        
        // 5. Show results
        setAnalysis(result);

        if (isUnidentifiableMeal(result)) {
          toast({
            title: "Meal Not Recognized",
            description: "The image could not be identified as a meal. Try a clearer photo.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Analysis Complete!",
            description: `Identified: ${result.mealName}`,
          });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAnalysis(null);
  };

  if (analysis) {
    return (
      <div className="pt-20 pb-20 mobile-px">
        <NutritionResults 
          analysis={analysis} 
          imageUrl={selectedImage}
          onNewScan={resetScan}
        />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20 mobile-px space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Analyze Your Meal</h2>
        <p className="text-muted-foreground">
          Take a photo or upload an image to get instant nutrition analysis
        </p>
      </div>

      {!selectedImage ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Capture Image</span>
              </CardTitle>
              <CardDescription>
                Use your camera or select from gallery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleTakePhoto}
                className="w-full"
                size="lg"
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Camera...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSelectFromGallery}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isCapturing}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Choose from Gallery
              </Button>
              
              {/* Web fallback file input */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isCapturing}
                />
                <Button 
                  variant="secondary"
                  className="w-full"
                  size="lg"
                  disabled={isCapturing}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload File (Web)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-square w-full max-w-sm mx-auto rounded-lg overflow-hidden">
                <img 
                  src={selectedImage} 
                  alt="Selected meal" 
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button 
              onClick={resetScan}
              variant="outline"
              className="flex-1"
              disabled={isAnalyzing}
            >
              Choose Different Image
            </Button>
            
            <Button 
              onClick={handleAnalyze}
              className="flex-1"
              disabled={isAnalyzing || !imageFile}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Meal'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}