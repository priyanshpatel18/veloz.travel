"use client";

import { Plan, SubscriptionPlan } from "@prisma/client";
import React, { createContext, useContext, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  subscriptionPlan: SubscriptionPlan;
  credits: number;
  plans: Plan[];
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  user: initialUser,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}