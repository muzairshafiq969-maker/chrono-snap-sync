import { NutritionAnalysis } from '@/types/nutrition';

const WEBHOOK_URL = 'https://khan23.app.n8n.cloud/webhook/fb1795ae-7290-48be-8c52-27b50eb32691';

export async function analyzeImage(imageFile: File): Promise<NutritionAnalysis> {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Validate the response has the expected structure
    if (!result.mealName || typeof result.calories !== 'number') {
      throw new Error('Invalid response format from analysis service');
    }

    return result as NutritionAnalysis;
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    throw new Error('Unable to analyze image. Please try again.');
  }
}

export function isUnidentifiableMeal(analysis: NutritionAnalysis): boolean {
  return analysis.confidenceScore === 0.0 && analysis.mealName === "Unidentifiable";
}