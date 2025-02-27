import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <main className="flex justify-center items-center m-auto h-screen">{children}</main>
}