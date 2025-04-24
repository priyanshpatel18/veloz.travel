"use client";

import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 flex justify-center p-4 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        className={`${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-lg border border-gray-200" : "bg-transparent"
        } rounded-2xl flex items-center justify-between w-full max-w-7xl mx-4 transition-all duration-300`}
      >
        <div className="flex items-center p-2">
          <Link href="/" className="w-10 h-10 rounded-xl flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
          </Link>
          <span className="ml-2 font-bold text-primary hidden sm:block">veloz.travel</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 p-2">
          <Button
            variant="ghost"
            className="p-2 hover:bg-secondary rounded-xl transition-all duration-200"
            asChild
          >
            <Link href="/signin">
              <span className="text-sm">Sign In</span>
            </Link>
          </Button>
          
          <div className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full">
            <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 p-1 bg-secondary rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}