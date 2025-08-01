declare module "better-auth" {
  export function betterAuth(config: any): any;
}

declare module "better-auth/adapters/prisma" {
  const prismaAdapter: (client: any) => any;
  export { prismaAdapter };
}

declare module "better-auth/providers/google" {
  const google: (options: any) => any;
  export { google };
}

declare module "better-auth/providers/email" {
  const email: (options: any) => any;
  export { email };
}
