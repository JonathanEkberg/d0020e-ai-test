"use client"

import { MantineProvider } from "@mantine/core"
import React from "react"
import { theme } from "../lib/mantine/theme"

interface MantineWrapperProps {
    children: React.ReactNode
}

export function MantineWrapper({ children }: MantineWrapperProps) {
    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            {children}
        </MantineProvider>
    )
}
