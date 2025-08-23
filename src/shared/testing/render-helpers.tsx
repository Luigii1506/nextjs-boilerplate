// ⚡ RENDER HELPERS - TANSTACK OPTIMIZED
// =====================================
// Utilidades optimizadas para testing con TanStack Query

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// 🔐 Mock del sistema de autenticación
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-auth-provider">{children}</div>;
};

// 🧩 Provider completo para testing (TanStack Query handles feature flags)
interface TestProvidersProps {
  children: React.ReactNode;
  // TanStack Query eliminates the need for feature flags provider
  // mockUser?: { id: string; name: string; email: string; role: string; } | null;
}

const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return (
    <MockAuthProvider>
      {/* ⚡ No feature flags provider needed - TanStack Query handles everything */}
      {children}
    </MockAuthProvider>
  );
};

// 🎯 Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialFeatureFlags?: Record<string, boolean>;
  mockUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  withoutProviders?: boolean;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    // Future test options:
    // initialFeatureFlags = {},
    // mockUser = null,
    withoutProviders = false,
    ...renderOptions
  } = options;

  // Si no queremos providers, renderizar directamente
  if (withoutProviders) {
    return {
      user: userEvent.setup(),
      ...render(ui, renderOptions),
    };
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders>{children}</TestProviders>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// 🚀 Render con admin user por defecto
export const renderWithAdminUser = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  return renderWithProviders(ui, {
    ...options,
    mockUser: {
      id: "admin-user-id",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    },
  });
};

// 👤 Render con usuario regular por defecto
export const renderWithUser = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  return renderWithProviders(ui, {
    ...options,
    mockUser: {
      id: "user-id",
      name: "Test User",
      email: "user@example.com",
      role: "user",
    },
  });
};

// 🚫 Render sin usuario (guest)
export const renderAsGuest = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  return renderWithProviders(ui, {
    ...options,
    mockUser: null,
  });
};

// ⚡ Render con feature flags específicos (TanStack Query optimized)
// Note: With TanStack Query, feature flags are handled automatically
export const renderWithFeatureFlags = (
  ui: ReactElement,
  featureFlags: Record<string, boolean>,
  options: CustomRenderOptions = {}
) => {
  // For testing, you might want to mock TanStack Query responses instead
  return renderWithProviders(ui, {
    ...options,
    initialFeatureFlags: featureFlags,
  });
};

// 📱 Helpers para testing responsive
export const setMobileViewport = () => {
  global.innerWidth = 375;
  global.innerHeight = 667;
  global.dispatchEvent(new Event("resize"));
};

export const setDesktopViewport = () => {
  global.innerWidth = 1024;
  global.innerHeight = 768;
  global.dispatchEvent(new Event("resize"));
};

export const setTabletViewport = () => {
  global.innerWidth = 768;
  global.innerHeight = 1024;
  global.dispatchEvent(new Event("resize"));
};

// 🔄 Helper para esperar por loading states
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved, queryByTestId } = await import(
    "@testing-library/react"
  );

  // Esperar que desaparezcan indicadores de loading comunes
  const loadingIndicators = [
    "loading-spinner",
    "loading-skeleton",
    "loading-placeholder",
    "loading",
  ];

  for (const testId of loadingIndicators) {
    const element = queryByTestId(document.body, testId);
    if (element) {
      await waitForElementToBeRemoved(element);
    }
  }
};

// Re-export común de testing library para conveniencia
export {
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
  getByRole,
  getByText,
  getByTestId,
  queryByRole,
  queryByText,
  queryByTestId,
  findByRole,
  findByText,
  findByTestId,
} from "@testing-library/react";
