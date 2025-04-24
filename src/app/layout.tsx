import syncUser from "@/actions/syncUser";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatBot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
