/**
 * 📚 USE SCROLL HEADER - EXAMPLES
 * ===============================
 *
 * Ejemplos de uso del hook useScrollHeader para módulos futuros
 * Casos de uso comunes y configuraciones recomendadas
 *
 * Created: 2025-01-17 - Reusable Hook Examples
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { useScrollHeader } from "./useScrollHeader";

// 📚 EXAMPLE 1: Basic Usage - Simple Header Hide/Show
export const BasicScrollHeaderExample: React.FC = () => {
  const { isHeaderVisible, scrollY } = useScrollHeader();

  return (
    <div className="min-h-screen">
      {/* Header that hides on scroll */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 bg-white dark:bg-gray-800 shadow-md",
          "transition-all duration-300 ease-out transform-gpu",
          isHeaderVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">My App ({scrollY}px)</h1>
        </div>
      </header>

      {/* Content */}
      <div className="pt-20 p-8">
        <div className="space-y-8">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
            >
              <p>Content Block {i + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 📚 EXAMPLE 2: Advanced Configuration - E-commerce Module
export const EcommerceScrollHeaderExample: React.FC = () => {
  const {
    isHeaderVisible,
    isPastThreshold,
    scrollY,
    isWheelSimulationActive,
    isNativeScrollWorking,
  } = useScrollHeader({
    threshold: 80, // Hide after scrolling 80px
    wheelSensitivity: 0.3, // Slower wheel simulation
    debounceDelay: 10, // Slight debounce for performance
    useWheelFallback: true,
    debug: false,
  });

  return (
    <div className="min-h-screen">
      {/* Sticky Header with Backdrop Blur */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500 ease-out transform-gpu",
          isPastThreshold && "backdrop-blur-md bg-white/80 dark:bg-gray-800/80",
          isHeaderVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-full opacity-0 scale-95"
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">E-Commerce Store</h1>

            {/* Scroll Status (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs space-x-2">
                <span className="px-2 py-1 bg-blue-100 rounded">
                  {scrollY}px
                </span>
                <span
                  className={cn(
                    "px-2 py-1 rounded text-white",
                    isNativeScrollWorking ? "bg-green-500" : "bg-orange-500"
                  )}
                >
                  {isNativeScrollWorking ? "Native" : "Wheel"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progressive Enhancement: Show search bar when scrolled */}
        <div
          className={cn(
            "border-t border-gray-200 dark:border-gray-600",
            "transition-all duration-300 ease-out",
            isPastThreshold
              ? "max-h-16 opacity-100 py-3"
              : "max-h-0 opacity-0 py-0 overflow-hidden"
          )}
        >
          <div className="container mx-auto px-4">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-32 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-sm"
            >
              <p className="text-lg font-semibold">Product {i + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 📚 EXAMPLE 3: Dashboard Module - Complex Layout
export const DashboardScrollHeaderExample: React.FC = () => {
  const { isHeaderVisible, isPastThreshold, scrollY, setScrollPosition } =
    useScrollHeader({
      threshold: 60,
      wheelSensitivity: 0.4,
      useWheelFallback: true,
      debug: false,
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Multi-level Header */}
      <header className="fixed top-0 w-full z-50">
        {/* Top Header - Always visible */}
        <div className="bg-gray-800 text-white py-2">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <span className="text-sm">Dashboard v2.0</span>
            <button
              onClick={() => setScrollPosition(0)}
              className="text-sm px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Back to Top
            </button>
          </div>
        </div>

        {/* Main Header - Hides on scroll */}
        <div
          className={cn(
            "bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700",
            "transition-all duration-400 ease-out transform-gpu",
            isHeaderVisible
              ? "translate-y-0 opacity-100 max-h-24"
              : "-translate-y-full opacity-0 max-h-0 overflow-hidden"
          )}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Analytics Dashboard
              </h1>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Scroll: {scrollY}px
                </span>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Export
                  </button>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Navigation - Shows when main header is hidden */}
        <div
          className={cn(
            "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600",
            "transition-all duration-400 ease-out transform-gpu",
            !isHeaderVisible && isPastThreshold
              ? "translate-y-0 opacity-100 max-h-16"
              : "-translate-y-full opacity-0 max-h-0 overflow-hidden"
          )}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Analytics
              </span>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded">
                  📊
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded">
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content with proper spacing */}
      <div className="pt-32">
        {/* Stats Cards */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {["Revenue", "Users", "Orders", "Conversion"].map((stat) => (
              <div
                key={stat}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-2">{stat}</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.floor(Math.random() * 10000)}
                </p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="space-y-8">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4">
                  Chart Section {i + 1}
                </h3>
                <div className="h-64 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    Chart Placeholder {i + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 📚 EXAMPLE 4: Minimal Configuration - Blog Module
export const BlogScrollHeaderExample: React.FC = () => {
  const { isHeaderVisible } = useScrollHeader({
    threshold: 100, // Only hide after scrolling quite a bit
    debug: false,
  });

  return (
    <div className="min-h-screen">
      {/* Simple Blog Header */}
      <header
        className={cn(
          "sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40",
          "transition-transform duration-300 ease-out",
          isHeaderVisible ? "transform-none" : "-translate-y-full"
        )}
      >
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">My Blog</h1>
        </div>
      </header>

      {/* Blog Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="prose dark:prose-invert max-w-none">
          <h1>Understanding Scroll Detection</h1>
          <p>
            This is an example of how the useScrollHeader hook can be used in a
            blog context with minimal configuration...
          </p>

          {/* Generate lots of content */}
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i}>
              <h2>Section {i + 1}</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
            </div>
          ))}
        </article>
      </main>
    </div>
  );
};

// 🎯 USAGE GUIDE COMPONENT
export const UseScrollHeaderGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">useScrollHeader Hook Guide</h1>

      <div className="space-y-8">
        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            {`import { useScrollHeader } from '@/shared/hooks';

const MyComponent = () => {
  const { isHeaderVisible, scrollY } = useScrollHeader();
  
  return (
    <header className={isHeaderVisible ? 'visible' : 'hidden'}>
      Current scroll: {scrollY}px
    </header>
  );
};`}
          </pre>
        </section>

        {/* Configuration Options */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Configuration Options</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <ul className="space-y-2">
              <li>
                <code>threshold</code>: Pixels to scroll before hiding (default:
                50)
              </li>
              <li>
                <code>wheelSensitivity</code>: Wheel simulation sensitivity
                (default: 0.5)
              </li>
              <li>
                <code>debounceDelay</code>: Debounce scroll events in ms
                (default: 0)
              </li>
              <li>
                <code>useWheelFallback</code>: Enable wheel simulation fallback
                (default: true)
              </li>
              <li>
                <code>debug</code>: Enable console logging (default: false)
              </li>
            </ul>
          </div>
        </section>

        {/* Advanced Configuration */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Advanced Configuration
          </h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            {`const {
  scrollY,
  isHeaderVisible,
  isPastThreshold,
  isNativeScrollWorking,
  isWheelSimulationActive,
  setScrollPosition
} = useScrollHeader({
  threshold: 100,
  wheelSensitivity: 0.3,
  debounceDelay: 16, // ~60fps
  useWheelFallback: true,
  debug: process.env.NODE_ENV === 'development'
});`}
          </pre>
        </section>

        {/* Return Values */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Return Values</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Property</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t dark:border-gray-600">
                  <td className="px-4 py-2 font-mono">scrollY</td>
                  <td className="px-4 py-2">number</td>
                  <td className="px-4 py-2">Current scroll position</td>
                </tr>
                <tr className="border-t dark:border-gray-600">
                  <td className="px-4 py-2 font-mono">isHeaderVisible</td>
                  <td className="px-4 py-2">boolean</td>
                  <td className="px-4 py-2">
                    True if header should be visible
                  </td>
                </tr>
                <tr className="border-t dark:border-gray-600">
                  <td className="px-4 py-2 font-mono">isPastThreshold</td>
                  <td className="px-4 py-2">boolean</td>
                  <td className="px-4 py-2">True if scrolled past threshold</td>
                </tr>
                <tr className="border-t dark:border-gray-600">
                  <td className="px-4 py-2 font-mono">isNativeScrollWorking</td>
                  <td className="px-4 py-2">boolean</td>
                  <td className="px-4 py-2">
                    True if native scroll is working
                  </td>
                </tr>
                <tr className="border-t dark:border-gray-600">
                  <td className="px-4 py-2 font-mono">
                    isWheelSimulationActive
                  </td>
                  <td className="px-4 py-2">boolean</td>
                  <td className="px-4 py-2">True if using wheel simulation</td>
                </tr>
                <tr className="border-t dark:border-gray-600">
                  <td className="px-4 py-2 font-mono">setScrollPosition</td>
                  <td className="px-4 py-2">function</td>
                  <td className="px-4 py-2">Manually set scroll position</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
