/**
 * 🎯 HERO SECTION COMPONENT
 * =========================
 *
 * Component hero principal del OverviewTab con search bar profesional.
 * Diseño moderno con gradientes y animaciones.
 *
 * @version 2.0.0 - Clean Architecture
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, ShoppingCart, Star } from "lucide-react";
import { HeroSectionProps } from "./types";

export const HeroSection: React.FC<HeroSectionProps> = ({
  globalSearchTerm,
  onSearchChange,
  isAuthenticated,
  allowAnimations,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 dark:from-gray-900/50" />

      <div className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Welcome Message */}
          <div
            className={cn(
              "space-y-6",
              allowAnimations && "animate-customerFadeInUp"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Bienvenido a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                ShopPro
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              Descubre productos increíbles con la mejor calidad y precios
              competitivos
            </p>
          </div>

          {/* Search Bar */}
          <div
            className={cn(
              "max-w-2xl mx-auto",
              allowAnimations && "animate-customerFadeInUp customer-stagger-1"
            )}
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="¿Qué estás buscando hoy?"
                  value={localSearchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-14 pr-32 py-6 text-lg border-2 border-gray-200 dark:border-gray-600 
                           rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                           text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400
                           transition-all duration-300 shadow-xl hover:shadow-2xl"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-8 bg-gradient-to-r from-blue-600 to-purple-600 
                           hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl
                           transition-all duration-300 shadow-lg hover:shadow-xl
                           flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Stats Cards */}
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8",
              allowAnimations && "animate-customerFadeInUp customer-stagger-2"
            )}
          >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    1000+
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Productos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-current" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    4.8
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Calificación
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 text-white font-bold text-sm">
                    24/7
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    24/7
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Soporte
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message for Authenticated Users */}
          {isAuthenticated && (
            <div
              className={cn(
                "bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800",
                allowAnimations && "animate-customerFadeInUp customer-stagger-3"
              )}
            >
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                🎉 ¡Bienvenido de vuelta! Explora nuestras nuevas ofertas y
                productos destacados.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
