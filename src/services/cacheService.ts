import { NutritionAnalysis } from '@/types/nutrition';

interface CachedAnalysis {
  id: string;
  analysis: NutritionAnalysis;
  imageUrl: string;
  timestamp: number;
}

const CACHE_KEY = 'nutrisnap-cache';
const MAX_CACHE_SIZE = 5;

export function getCachedAnalyses(): CachedAnalysis[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export function addToCache(id: string, analysis: NutritionAnalysis, imageUrl: string) {
  try {
    const cached = getCachedAnalyses();
    const newItem: CachedAnalysis = {
      id,
      analysis,
      imageUrl,
      timestamp: Date.now()
    };

    // Add to beginning and keep only last 5
    const updated = [newItem, ...cached].slice(0, MAX_CACHE_SIZE);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Cache error:', error);
  }
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Clear cache error:', error);
  }
}
