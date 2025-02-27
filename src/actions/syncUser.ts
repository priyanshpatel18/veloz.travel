"use server";

import prisma from "@/db";
import { generateToken } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { User } from "@prisma/client";

export default async function syncUser() {
  const user = await currentUser();

  if (!user) return;

  const token = await generateToken({
    userId: user.id,
    email: user.emailAddresses[0].emailAddress,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
  });

  try {
    await createOrUpdateUser({
      id: user.id,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      imageUrl: user.imageUrl ?? "",
      externalAccounts: user.externalAccounts?.map((acc) => ({ provider: acc.provider })) ?? [],
      email: user.emailAddresses[0].emailAddress,
      token
    });

    console.log("✅ User sync successful");
  } catch (error) {
    console.error("❌ Error syncing user:", error);
  }
}

interface ExternalAccount {
  provider: string;
}

interface ClerkUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  externalAccounts?: ExternalAccount[];
  email: string;
  token: string;
}

export async function createOrUpdateUser(clerkUser: ClerkUser): Promise<User> {
  const providerList: string[] = clerkUser.externalAccounts?.map((acc) => acc.provider) || [];

  return await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      imageUrl: clerkUser.imageUrl ?? null,
      provider: providerList.join(","),
      email: clerkUser.email,
      token: clerkUser.token,
    },
    create: {
      clerkId: clerkUser.id,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      imageUrl: clerkUser.imageUrl ?? null,
      provider: providerList.join(","),
      email: clerkUser.email,
      token: clerkUser.token,
    },
  });
}
