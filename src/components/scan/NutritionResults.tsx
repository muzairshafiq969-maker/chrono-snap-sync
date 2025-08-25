import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NutritionAnalysis } from '@/types/nutrition';
import { Camera, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NutritionResultsProps {
  analysis: NutritionAnalysis;
  imageUrl: string | null;
  onNewScan: () => void;
}

export function NutritionResults({ analysis, imageUrl, onNewScan }: NutritionResultsProps) {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4" />;
    if (score >= 40) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const confidencePercentage = Math.round(analysis.confidenceScore * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{analysis.mealName}</h2>
        <div className="flex items-center justify-center space-x-2">
          <Badge variant={confidencePercentage > 70 ? "default" : "secondary"}>
            {confidencePercentage}% Confidence
          </Badge>
          <Badge 
            variant="outline" 
            className={`${getHealthScoreColor(analysis.healthScore)} border-current`}
          >
            <span className="flex items-center space-x-1">
              {getHealthScoreIcon(analysis.healthScore)}
              <span>Health Score: {analysis.healthScore}/100</span>
            </span>
          </Badge>
        </div>
      </div>

      {/* Image */}
      {imageUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt={analysis.mealName} 
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Nutrition Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="gradient-accent">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent-foreground">
              {analysis.calories}
            </div>
            <div className="text-sm text-accent-foreground/80">Calories</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {analysis.healthScore}/100
            </div>
            <div className="text-sm text-muted-foreground">Health Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Macronutrients */}
      <Card>
        <CardHeader>
          <CardTitle>Macronutrients</CardTitle>
          <CardDescription>Main nutritional components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-protein"></div>
                <span>Protein</span>
              </span>
              <span className="font-medium">{analysis.protein}g</span>
            </div>
            <Progress value={(analysis.protein / 50) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-carbs"></div>
                <span>Carbohydrates</span>
              </span>
              <span className="font-medium">{analysis.carbs}g</span>
            </div>
            <Progress value={(analysis.carbs / 100) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-fat"></div>
                <span>Fat</span>
              </span>
              <span className="font-medium">{analysis.fat}g</span>
            </div>
            <Progress value={(analysis.fat / 30) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Micronutrients */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Nutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Fiber</span>
              <span className="font-medium">{analysis.fiber}g</span>
            </div>
            <div className="flex justify-between">
              <span>Sugar</span>
              <span className="font-medium">{analysis.sugar}g</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span>Sodium</span>
              <span className="font-medium">{analysis.sodium}mg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Rationale */}
      {analysis.rationale && (
        <Card>
          <CardHeader>
            <CardTitle>Nutritional Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.rationale}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Button onClick={onNewScan} className="w-full" size="lg">
        <Camera className="mr-2 h-4 w-4" />
        Analyze Another Meal
      </Button>
    </div>
  );
}