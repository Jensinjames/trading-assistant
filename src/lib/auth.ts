import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { type NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
            }
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            throw new Error("Please use the appropriate sign-in method");
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      console.log("User signed in:", user.email);
    },
    async signOut({ token }) {
      console.log("User signed out:", token.email);
    },
  },
  debug: process.env.NODE_ENV === "development",
};