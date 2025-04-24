"use server";

import { User } from "@/components/UserContext";
import prisma from "@/db";
import { currentUser } from "@clerk/nextjs/server";

export default async function syncUser() {
  const user = await currentUser();

  if (!user || !user.emailAddresses[0].emailAddress) return null;

  try {
    return await createOrUpdateUser({
      id: user.id,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      imageUrl: user.imageUrl ?? "",
      externalAccounts: user.externalAccounts?.map((acc) => ({ provider: acc.provider })) ?? [],
      email: user.emailAddresses[0].emailAddress,
    });
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
    },
    create: {
      clerkId: clerkUser.id,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      imageUrl: clerkUser.imageUrl ?? null,
      provider: providerList.join(","),
      email: clerkUser.email,
    },
    include: {
      plans: true
    }
  });
}
