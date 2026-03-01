import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { UserType } from "@prisma/client";

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
  ],
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
