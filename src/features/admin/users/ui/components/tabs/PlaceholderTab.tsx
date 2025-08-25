"use client";

import React from "react";

/**
 * 🧪 PLACEHOLDER TAB
 * =================
 *
 * Componente temporal para tabs que están siendo desarrollados
 * o que han sido deshabilitados temporalmente.
 */

interface PlaceholderTabProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({
  title,
  icon: Icon,
  description,
}) => {
  return (
    <div className="p-6 text-center animate-fadeInUp">
      <Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-scaleIn" />
      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 animate-slideInUp stagger-1">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 animate-fadeInScale stagger-2">
        {description}
      </p>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          🚧 Este tab está temporalmente deshabilitado mientras se resuelven
          algunos issues técnicos.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderTab;
