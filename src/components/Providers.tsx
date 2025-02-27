import { ClerkProvider } from "@clerk/nextjs"
import { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}
