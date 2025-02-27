import syncUser from "@/actions/syncUser";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await syncUser();

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
