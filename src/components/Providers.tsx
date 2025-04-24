import syncUser from "@/actions/syncUser";
import { ClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"
import { UserProvider } from "./UserContext";

interface ProvidersProps {
  children: ReactNode
}

export default async function Providers({ children }: ProvidersProps) {
  const user = await syncUser();

  return (
    <UserProvider user={user || null}>
      <ClerkProvider>
        {children}
      </ClerkProvider>
    </UserProvider>
  )
}
