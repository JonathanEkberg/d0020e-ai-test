import clsx from "clsx"
import { Inter } from "next/font/google"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

interface PageProps {
    children: React.ReactNode
}

export function Page({ children }: PageProps) {
    return <div className={inter.className}>{children}</div>
}
