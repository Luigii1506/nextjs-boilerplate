// 📊 PROGRESS BAR COMPONENT - ENTERPRISE REUSABLE
// ================================================
// Componente reutilizable para barras de progreso

import React from "react";

interface ProgressBarProps {
  progress: number; // 0-100
  status?: "pending" | "uploading" | "completed" | "error";
  height?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  className?: string;
}

/**
 * Componente reutilizable para barras de progreso
 */
const ProgressBar: React.FC<ProgressBarProps> = React.memo(({
  progress,
  status = "uploading",
  height = "md",
  showPercentage = false,
  className = "",
}) => {
  const heightClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const getProgressColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "pending":
        return "bg-slate-300";
      default:
        return "bg-blue-500";
    }
  };

  const displayProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`space-y-1 ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-xs text-slate-600">
          <span>Progreso</span>
          <span>{Math.round(displayProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full ${heightClasses[height]}`}>
        <div
          className={`${heightClasses[height]} rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;
