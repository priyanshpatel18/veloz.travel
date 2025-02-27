import Appbar from "@/components/Appbar"
import { ReactNode } from "react"

interface PagesLayoutProps {
  children: ReactNode
}

export default function PagesLayout({ children }: PagesLayoutProps) {
  return (
    <main>
      <Appbar />
      {children}
    </main>
  )
}
