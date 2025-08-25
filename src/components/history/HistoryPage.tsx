import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { MealHistoryItem } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';
import { getCachedAnalyses } from '@/services/cacheService';
import { format } from 'date-fns';
import { Calendar, Trash2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function HistoryPage() {
  const { user } = useAuth();
  const [selectedMeal, setSelectedMeal] = useState<MealHistoryItem | null>(null);

  const { data: mealHistory = [], isLoading, refetch } = useQuery({
    queryKey: ['mealHistory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await (supabase as any)
        .from('meal_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        return [];
      }

      return data as MealHistoryItem[];
    },
    enabled: !!user,
  });

  const cachedItems = getCachedAnalyses();

  const deleteMeal = async (id: string) => {
    if (!user) return;

    const { error } = await (supabase as any)
      .from('meal_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      refetch();
      setSelectedMeal(null);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-20 mobile-px">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (selectedMeal) {
    return (
      <div className="pt-20 pb-20 mobile-px space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedMeal(null)}
          >
            ← Back to History
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => deleteMeal(selectedMeal.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedMeal.meal_name}</CardTitle>
            <CardDescription>
              {format(new Date(selectedMeal.created_at), 'PPpp')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMeal.image_url && (
              <div className="aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden">
                <img 
                  src={selectedMeal.image_url} 
                  alt={selectedMeal.meal_name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Calories</div>
                <div className="text-lg font-bold text-primary">
                  {selectedMeal.calories}
                </div>
              </div>
              <div>
                <div className="font-medium">Health Score</div>
                <div className="text-lg font-bold">
                  {selectedMeal.health_score}/100
                </div>
              </div>
              <div>
                <div className="font-medium">Protein</div>
                <div>{selectedMeal.protein}g</div>
              </div>
              <div>
                <div className="font-medium">Carbs</div>
                <div>{selectedMeal.carbs}g</div>
              </div>
              <div>
                <div className="font-medium">Fat</div>
                <div>{selectedMeal.fat}g</div>
              </div>
              <div>
                <div className="font-medium">Fiber</div>
                <div>{selectedMeal.fiber}g</div>
              </div>
            </div>

            {selectedMeal.rationale && (
              <div>
                <div className="font-medium mb-2">Analysis</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedMeal.rationale}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20 mobile-px space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Meal History</h2>
        <p className="text-muted-foreground">
          Track your nutrition journey over time
        </p>
      </div>

      {cachedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Analysis (Offline)</CardTitle>
            <CardDescription>
              Your last few analyses cached locally
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cachedItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center space-x-3 p-3 rounded-lg border"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.imageUrl} 
                    alt={item.analysis.mealName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {item.analysis.mealName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.analysis.calories} cal • 
                    {format(new Date(item.timestamp), 'MMM d, HH:mm')}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Cached
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {mealHistory.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No meal history yet</h3>
            <p className="text-sm text-muted-foreground">
              Start analyzing meals to build your nutrition history
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mealHistory.map((meal) => (
            <Card 
              key={meal.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMeal(meal)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {meal.image_url ? (
                      <img 
                        src={meal.image_url} 
                        alt={meal.meal_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {meal.meal_name || 'Unknown Meal'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {meal.calories} cal • {meal.protein}g protein
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(meal.created_at), 'MMM d, yyyy • HH:mm')}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge 
                      variant="outline"
                      className={
                        (meal.health_score || 0) >= 70 
                          ? 'text-success border-success' 
                          : (meal.health_score || 0) >= 40 
                          ? 'text-warning border-warning' 
                          : 'text-destructive border-destructive'
                      }
                    >
                      {meal.health_score}/100
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}