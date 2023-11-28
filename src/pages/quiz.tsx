import React, { useState } from "react"
import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core"
import { Page } from "@/components/Page"

interface QuizProps {}

export default function Quiz({}: QuizProps) {
    const [data, setData] = useState<string | null>(null)

    async function onClick() {
        const res = await fetch("/api/stream")
        console.log(res)
        const reader = res.body?.getReader()

        if (!reader) {
            throw new Error("No reader")
        }

        setData("")
        while (true) {
            const { done, value } = await reader.read()

            if (done) {
                break
            }

            if (value === undefined) {
                continue
            }

            console.log(value)
            const str = new TextDecoder().decode(value)
            console.log(str)
            console.log()
            setData((current) => (current += str))
        }
    }

    return (
        <Page>
            <Container size="xs" w="100%">
                <Stack>
                    <Stack>
                        <Title>Generate Quiz</Title>
                    </Stack>
                    <Stack w="100%">
                        <Button onClick={onClick}>Generate</Button>
                        {data !== null && <Text>{data}</Text>}
                    </Stack>
                </Stack>
            </Container>
        </Page>
    )
}
