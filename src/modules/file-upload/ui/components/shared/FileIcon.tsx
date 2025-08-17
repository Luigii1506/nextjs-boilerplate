// 🎨 FILE ICON COMPONENT - ENTERPRISE REUSABLE
// ==============================================
// Componente reutilizable para íconos de archivos

import React from "react";
import { getFileIcon } from "../../../utils";

interface FileIconProps {
  mimeType: string;
  size?: number;
  className?: string;
}

/**
 * Componente reutilizable para mostrar íconos de archivos
 * Usa el utility compartido para consistencia
 */
const FileIcon: React.FC<FileIconProps> = React.memo(
  ({ mimeType, size = 24, className = "" }) => {
    const icon = getFileIcon(mimeType, size);

    // Aplicar className adicional si se proporciona
    if (className) {
      const iconProps = icon.props as { className?: string };
      return React.cloneElement(
        icon as React.ReactElement<{ className?: string }>,
        {
          className: `${iconProps.className || ""} ${className}`.trim(),
        }
      );
    }

    return icon;
  }
);

FileIcon.displayName = "FileIcon";

export default FileIcon;
