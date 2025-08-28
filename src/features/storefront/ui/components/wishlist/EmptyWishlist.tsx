/**
 * 💔 EMPTY WISHLIST COMPONENT
 * ===========================
 *
 * Component para mostrar el estado vacío del wishlist cuando no hay productos.
 * Diseño profesional con llamadas a la acción.
 *
 * @version 2.0.0 - Clean Architecture
 */

import React from "react";
import { HeartOff, Package } from "lucide-react";

export const EmptyWishlist: React.FC = () => {
  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto">
          <HeartOff className="w-12 h-12 text-gray-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tu Wishlist Está Vacía
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Explora nuestros productos y guarda tus favoritos haciendo clic en
            el ícono del corazón
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Explorar Productos</span>
          </button>
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300">
            Ver Categorías
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyWishlist;
