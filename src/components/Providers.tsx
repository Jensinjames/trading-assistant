"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
}