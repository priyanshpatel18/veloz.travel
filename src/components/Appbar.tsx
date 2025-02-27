"use client";

import { Button } from "@/components/ui/button";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  BellDotIcon,
  CompassIcon,
  LogOutIcon,
  PlusCircleIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  User2Icon,
  UserIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function Appbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const menuItems = [
    { icon: SearchIcon, label: 'Search' },
    { icon: PlusCircleIcon, label: 'New Tour', href: '/new' },
    { icon: CompassIcon, label: 'Destinations', href: '/destinations' },
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
              onClick={() => {
                if (item.href) {
                  router.push(item.href);
                }
              }}
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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-0 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <User2Icon className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-200 rounded-full p-1" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                    <p className="text-xs leading-none text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => {
                    toast.info('Profile page coming soon!')
                  }}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    toast.info('Settings coming soon!')
                  }}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    toast.info('Upgrade to Pro coming soon!')
                  }}>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    <span>Upgrade to Pro</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-full">
              <User2Icon className="w-full h-full p-2 bg-purple-200 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}