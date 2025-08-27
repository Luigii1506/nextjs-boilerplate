/**
 * ❤️ ANIMATED HEART BUTTON - X.COM/INSTAGRAM STYLE
 * ================================================
 *
 * Botón de corazón súper animado estilo redes sociales
 * con efectos de partículas, gradientes y transiciones fluidas
 *
 * Enterprise: 2025-01-26 - Animated wishlist button
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/shared/utils";
import type { ProductForCustomer } from "../../types/shared";

interface AnimatedHeartButtonProps {
  product: ProductForCustomer;
  isWishlisted?: boolean;
  isLoading?: boolean;
  onToggle?: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  size?: "sm" | "md" | "lg";
  variant?: "floating" | "inline" | "overlay";
  showSparkles?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  color: string;
}

export const AnimatedHeartButton: React.FC<AnimatedHeartButtonProps> = ({
  product,
  isWishlisted = false,
  isLoading = false,
  onToggle,
  size = "md",
  variant = "inline",
  showSparkles = true,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);

  // Update local state when prop changes
  useEffect(() => {
    setLocalWishlisted(isWishlisted);
  }, [isWishlisted]);

  const createParticles = useCallback(() => {
    if (!showSparkles) return;

    const newParticles: Particle[] = [];
    const colors = ["#ff6b6b", "#ff8e8e", "#ffa8a8", "#ffb3b3", "#ffc1c1"];

    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * 40 - 20, // -20px to +20px from center
        y: Math.random() * 40 - 20,
        scale: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles(newParticles);

    // Clean up particles after animation
    setTimeout(() => setParticles([]), 1000);
  }, [showSparkles]);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLoading || isAnimating) return;

      console.log("❤️ [AnimatedHeartButton] Click!", {
        productId: product.id,
        productName: product.name,
        currentlyWishlisted: localWishlisted,
      });

      setIsAnimating(true);

      // Create particles effect immediately for visual feedback
      if (!localWishlisted) {
        createParticles();
      }

      // Optimistic update
      const newWishlistedState = !localWishlisted;
      setLocalWishlisted(newWishlistedState);

      try {
        if (onToggle) {
          const result = await onToggle(product);

          if (!result.success) {
            // Revert optimistic update on failure
            setLocalWishlisted(!newWishlistedState);
            console.error(
              "❌ [AnimatedHeartButton] Toggle failed:",
              result.message
            );
          } else {
            console.log("✅ [AnimatedHeartButton] Toggle success!");
          }
        }
      } catch (error) {
        // Revert optimistic update on error
        setLocalWishlisted(!newWishlistedState);
        console.error("❌ [AnimatedHeartButton] Toggle error:", error);
      } finally {
        setTimeout(() => setIsAnimating(false), 300);
      }
    },
    [
      isLoading,
      isAnimating,
      localWishlisted,
      product,
      onToggle,
      createParticles,
    ]
  );

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      icon: "w-4 h-4",
      text: "text-sm",
      padding: "p-1.5",
    },
    md: {
      container: "w-10 h-10",
      icon: "w-5 h-5",
      text: "text-base",
      padding: "p-2",
    },
    lg: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
      text: "text-lg",
      padding: "p-2.5",
    },
  };

  // Variant configurations
  const variantConfig = {
    floating: "fixed bottom-20 right-6 z-50 shadow-2xl",
    inline: "relative",
    overlay: "absolute top-3 right-3 z-50",
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("relative", variantConfig[variant])}>
      {/* Particles */}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute top-1/2 left-1/2 pointer-events-none animate-sparkleFloat"
              style={{
                transform: `translate(${particle.x}px, ${particle.y}px) scale(${particle.scale})`,
                opacity: particle.opacity,
              }}
            >
              <Sparkles className="w-3 h-3" style={{ color: particle.color }} />
            </div>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          // Base styles
          "relative group rounded-full transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-4 focus:ring-pink-500/30",
          "active:scale-95",
          "drop-shadow-lg", // Always visible shadow

          // Size
          config.container,
          config.padding,

          // Background & Colors
          localWishlisted
            ? [
                // Liked state - Beautiful gradient
                "bg-gradient-to-r from-pink-500 via-red-500 to-rose-500",
                "hover:from-pink-600 hover:via-red-600 hover:to-rose-600",
                "shadow-lg shadow-red-500/25",
                "hover:shadow-xl hover:shadow-red-500/30",
              ]
            : [
                // Unliked state - Subtle with hover effects
                "bg-white/90 dark:bg-gray-800/90",
                "hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50",
                "dark:hover:from-pink-900/30 dark:hover:to-red-900/30",
                "shadow-md shadow-black/10",
                "hover:shadow-lg hover:shadow-red-500/20",
                "border border-gray-200 dark:border-gray-700",
                "hover:border-red-300 dark:hover:border-red-600",
              ],

          // Animation states
          isAnimating && [
            localWishlisted ? "animate-heartPop" : "animate-pulse",
          ],

          // Glow effect for liked items
          localWishlisted && !isAnimating && "animate-glowPulse",

          // Loading state
          isLoading && "cursor-not-allowed opacity-75",

          // Custom className
          className
        )}
        title={localWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        {/* Heart Icon */}
        <Heart
          className={cn(
            config.icon,
            "transition-all duration-300 ease-out",

            localWishlisted
              ? [
                  // Filled heart - white color
                  "text-white fill-current",
                  "drop-shadow-sm",
                  isAnimating && "animate-heartPop",
                ]
              : [
                  // Empty heart - gray with hover effects
                  "text-gray-600 dark:text-gray-400",
                  "group-hover:text-red-500 dark:group-hover:text-red-400",
                  "group-hover:scale-110",
                  "group-active:scale-95",
                ],

            // Loading state
            isLoading && "animate-pulse"
          )}
        />

        {/* Animated Background Pulse (when liked) */}
        {localWishlisted && (
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-r from-pink-400 to-red-400",
              "animate-ping opacity-20",
              isAnimating && "opacity-40"
            )}
          />
        )}

        {/* Hover Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full opacity-0",
            "group-hover:opacity-20 transition-opacity duration-300",
            localWishlisted
              ? "bg-gradient-to-r from-pink-300 to-red-300"
              : "bg-gradient-to-r from-pink-500 to-red-500"
          )}
        />
      </button>

      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
        </div>
      )}

      <style jsx>{`
        @keyframes heartParticle {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(var(--tw-translate-x), var(--tw-translate-y))
              scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(
                calc(var(--tw-translate-x) * 2),
                calc(var(--tw-translate-y) * 2)
              )
              scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedHeartButton;
