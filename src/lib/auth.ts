import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { UserType } from "@prisma/client";

/**
 * OAuth Configuration Instructions:
 *
 * GOOGLE OAUTH SETUP:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create a new project (or select existing)
 * 3. Enable Google+ API or Google Identity API
 * 4. Create credentials → OAuth 2.0 Client ID → Web application
 * 5. Add these Authorized redirect URIs:
 *    - http://localhost:3000/api/auth/callback/google (for development)
 *    - https://yourdomain.com/api/auth/callback/google (for production)
 * 6. Copy the Client ID and Client Secret to your .env file:
 *    GOOGLE_CLIENT_ID=your_actual_client_id_here
 *    GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
 *
 * APPLE OAUTH SETUP (OPTIONAL - REQUIRES $99/YEAR DEVELOPER ACCOUNT):
 * 1. Enroll in Apple Developer Program ($99/year)
 * 2. Create an App ID
 * 3. Create a Service ID
 * 4. Configure Sign in with Apple
 * 5. Create a private key
 * Note: Apple OAuth is complex to set up. Consider skipping for MVP.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userType: UserType;
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    userType: UserType;
    avatarUrl?: string | null;
  }
}

// Check if Google OAuth is properly configured
const isGoogleOAuthConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret";

// Build providers array dynamically
const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Missing email or password");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.passwordHash) {
        throw new Error("Invalid email or password");
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      };
    },
  }),
];

// Only add Google provider if properly configured
if (isGoogleOAuthConfigured) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

// Note: Apple OAuth removed - requires expensive developer account
// Can be added later when Apple Developer account is available

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth users, create or update user in database
      if (account?.provider !== "credentials") {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new OAuth user with CUSTOMER as default
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              avatarUrl: user.image,
              userType: UserType.CUSTOMER,
              provider: account?.provider,
              providerId: account?.providerAccountId,
            },
          });
        } else if (!existingUser.userType) {
          // Update existing OAuth user without userType
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { userType: UserType.CUSTOMER },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (user) {
          session.user.id = user.id;
          session.user.userType = user.userType;
          session.user.avatarUrl = user.avatarUrl;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.userType = user.userType;
      }
      return token;
    },
  },
});

// Export OAuth configuration status for UI
export const oauthConfig = {
  googleEnabled: isGoogleOAuthConfigured,
  appleEnabled: false, // Disabled for pre-launch (requires $99/year developer account)
};
