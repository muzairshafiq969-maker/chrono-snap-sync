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
  const { takePhoto, selectFromGallery, isCapturing, isNative, isCapacitorAvailable } = useCamera();
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
      <div className="min-h-screen bg-gradient-hero pt-20 pb-20 mobile-px">
        <NutritionResults 
          analysis={analysis} 
          imageUrl={selectedImage}
          onNewScan={resetScan}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pt-20 pb-20 mobile-px space-y-8 animate-fade-in">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow animate-float">
          <Camera className="w-12 h-12 text-primary-foreground" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gradient">Analyze Your Meal</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Take a photo or upload an image to get instant nutrition analysis
          </p>
        </div>
      </div>

      {!selectedImage ? (
        <div className="space-y-6">
          <Card className="card-gradient border-0 shadow-card hover-lift">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-3 text-xl">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-gradient">Capture Image</span>
              </CardTitle>
              <CardDescription className="text-base">
                Use your camera or select from gallery to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show native camera buttons only on mobile */}
              {isNative && isCapacitorAvailable && (
                <>
                  <Button 
                    onClick={handleTakePhoto}
                    className="w-full btn-gradient"
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
                    className="w-full hover-lift border-primary/20 hover:border-primary hover:bg-primary/5"
                    size="lg"
                    disabled={isCapturing}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Choose from Gallery
                  </Button>
                </>
              )}
              
              {/* Web file input - always available */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isCapturing}
                />
                <Button 
                  variant={(!isNative || !isCapacitorAvailable) ? "default" : "secondary"}
                  className="w-full"
                  size="lg"
                  disabled={isCapturing}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {(!isNative || !isCapacitorAvailable) ? "Take Photo / Upload" : "Upload File"}
                </Button>
              </div>
              
              {(!isNative || !isCapacitorAvailable) && (
                <p className="text-xs text-muted-foreground text-center">
                  On mobile devices, camera and gallery access will be available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-scale-in">
          <Card className="card-gradient border-0 shadow-card overflow-hidden">
            <CardContent className="p-6">
              <div className="aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-soft">
                <img 
                  src={selectedImage} 
                  alt="Selected meal" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              onClick={resetScan}
              variant="outline"
              className="flex-1 hover-lift border-primary/20 hover:border-primary"
              size="lg"
              disabled={isAnalyzing}
            >
              Choose Different Image
            </Button>
            
            <Button 
              onClick={handleAnalyze}
              className="flex-1 btn-gradient"
              size="lg"
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