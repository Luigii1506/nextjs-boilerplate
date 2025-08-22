/**
 * 🃏 CARD COMPONENT
 * =================
 *
 * Componente de tarjeta reutilizable
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
