import "@mantine/core/styles.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MantineWrapper } from "./components/MantineWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Llama-GPT",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/lama.png" sizes="any" />
            </head>
            <body className={inter.className}>
                <MantineWrapper>{children}</MantineWrapper>
            </body>
        </html>
    )
}
