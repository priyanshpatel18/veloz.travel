import { Button } from "@/components/ui/button";
import {
  BellDotIcon,
  CompassIcon,
  PlusCircleIcon,
  SearchIcon,
  User2Icon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";


const TopDockNavbar = () => {
  const menuItems = [
    { icon: SearchIcon, label: 'Search' },
    { icon: PlusCircleIcon, label: 'New Tour' },
    { icon: CompassIcon, label: 'Destinations' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-between w-full max-w-7xl mx-4 border border-gray-200">
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
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="flex items-center p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="ml-2 text-sm hidden sm:block">{item.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 p-2">
          <Button
            variant="ghost"
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <BellDotIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <div className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center bg-purple-200 rounded-full">
            <User2Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDockNavbar;