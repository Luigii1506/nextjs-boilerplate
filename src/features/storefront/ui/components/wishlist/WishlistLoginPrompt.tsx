/**
 * 🔐 WISHLIST LOGIN PROMPT COMPONENT
 * ===================================
 *
 * Component para mostrar el prompt de login cuando el usuario no está autenticado.
 * Diseño profesional con call-to-action prominente.
 *
 * @version 2.0.0 - Clean Architecture
 */

import React from "react";
import { Heart } from "lucide-react";
import { WishlistLoginPromptProps } from "./types";

export const WishlistLoginPrompt: React.FC<WishlistLoginPromptProps> = ({
  onLogin,
}) => {
  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/20 dark:to-red-900/20 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-12 h-12 text-pink-500 dark:text-pink-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Inicia Sesión para Ver tu Wishlist
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Guarda tus productos favoritos y accede a ellos desde cualquier
            dispositivo
          </p>
        </div>
        <button
          onClick={onLogin}
          className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
        >
          <Heart className="w-5 h-5" />
          <span>Iniciar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default WishlistLoginPrompt;
