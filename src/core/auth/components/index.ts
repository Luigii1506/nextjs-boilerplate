// 🎨 Auth UI Components
export { default as AuthContainer } from "./AuthContainer";
export { default as InputField } from "./InputField";
export { default as Button } from "./Button";
export { default as SocialButton } from "./SocialButton";
export { default as LoginView } from "./LoginView";
export { default as RegisterView } from "./RegisterView";
export { default as ForgotPasswordView } from "./ForgotPasswordView";

// 🛡️ Protection Components (re-export from shared)
export {
  Protected,
  RoleProtected,
  LevelProtected,
  AdminOnly,
  SuperAdminOnly,
  NoAccess,
} from "@/shared/components/Protected";
