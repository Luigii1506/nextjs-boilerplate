// 📅 FILE DATE COMPONENT - ENTERPRISE REUSABLE
// ==============================================
// Componente reutilizable para mostrar fechas de archivos

import React from "react";
import { Calendar } from "lucide-react";
import { formatDate, formatDateSimple } from "../../../utils";

interface FileDateProps {
  dateString: string;
  showIcon?: boolean;
  simple?: boolean;
  className?: string;
  iconSize?: number;
}

/**
 * Componente reutilizable para mostrar fechas formateadas
 */
const FileDate: React.FC<FileDateProps> = React.memo(({
  dateString,
  showIcon = false,
  simple = false,
  className = "text-sm text-slate-600",
  iconSize = 12,
}) => {
  const formattedDate = simple ? formatDateSimple(dateString) : formatDate(dateString);
  
  if (showIcon) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Calendar size={iconSize} />
        <span>{formattedDate}</span>
      </div>
    );
  }
  
  return <span className={className}>{formattedDate}</span>;
});

FileDate.displayName = "FileDate";

export default FileDate;
