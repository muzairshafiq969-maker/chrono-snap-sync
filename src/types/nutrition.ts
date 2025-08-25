export interface NutritionAnalysis {
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  confidenceScore: number;
  healthScore: number;
  rationale: string;
}

export interface MealHistoryItem {
  id: string;
  user_id: string;
  image_url?: string;
  meal_name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence_score?: number;
  health_score?: number;
  rationale?: string;
  analysis: NutritionAnalysis;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  dietary_preferences?: string;
  created_at: string;
  updated_at: string;
}