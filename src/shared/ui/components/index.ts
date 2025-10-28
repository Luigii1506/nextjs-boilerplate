// 🎨 Shared UI Components Barrel
// ==============================
// Entry point para componentes UI compartidos

// Basic UI Components
export { Button } from "./Button";
export { Card } from "./Card";
export { Badge } from "./Badge";
export { Input } from "./Input";
export { Label } from "./Label";

// 📄 Layout Components
export { PageHeader, type PageHeaderProps, type StatItem } from "./PageHeader";
export {
  ContentContainer,
  type ContentContainerProps,
} from "./ContentContainer";

// 🧭 Navigation Components
export * from "./HydrationSafeNavItem";

// 🎨 Tab Components
export {
  ReusableTabs,
  TabPanel,
  TabSystem,
  type TabItem,
} from "./ReusableTabs";
export {
  StickyTabsContainer,
  type StickyTabsContainerProps,
} from "./StickyTabsContainer";
export {
  TabHeader,
  type TabHeaderProps,
  type TabHeaderAction,
} from "./tabs/TabHeader";
export { TabWrapper, type TabWrapperProps } from "./tabs/TabWrapper";
export {
  TabSearchBar,
  type TabSearchBarProps,
} from "./tabs/TabSearchBar";
export {
  TabLoadingSkeleton,
  type TabLoadingSkeletonProps,
} from "./tabs/TabLoadingSkeleton";

// 🌙 Theme Components
export * from "./DarkModeToggle";
export * from "./I18nToggle";

// 💀 Loading & Skeletons
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonStatsCard,
  SkeletonList,
  SkeletonFeatureFlagCard,
  SkeletonPage,
} from "./SkeletonLoader";

// 🎭 Modal Components
export {
  BaseModal,
  BaseModalActions,
  BaseModalButton,
  type BaseModalProps,
  type BaseModalActionsProps,
  type BaseModalButtonProps,
} from "./BaseModal";
