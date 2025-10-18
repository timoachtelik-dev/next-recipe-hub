/**
 * Nutrition Progress Bar Component
 * Visual representation of nutrient as a percentage of daily value
 */

interface NutritionProgressBarProps {
  label: string;
  amount: number;
  unit: string;
  percentage: number;
  color?: "blue" | "green" | "orange" | "red";
}

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

export function NutritionProgressBar({
  label,
  amount,
  unit,
  percentage,
  color = "blue",
}: NutritionProgressBarProps) {
  // Cap percentage at 100% for display
  const displayPercentage = Math.min(percentage, 100);
  const barColor = colorClasses[color];

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {amount}
          {unit} ({percentage}%)
        </span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
    </div>
  );
}

