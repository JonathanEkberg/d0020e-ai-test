import OpenAI from "openai"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { NextRequest } from "next/server"
import { ChatCompletionMessageParam, Models } from "openai/resources/index.mjs"

const openai = new OpenAI({
    // Local Open-AI API running Llama-2 13b-chat model using
    // https://github.com/abetlen/llama-cpp-python/tree/main#web-server
    baseURL: "http://localhost:8000/v1",
    // Needs to be set to something otherwise it crashes
    apiKey: "",
})
// const openai = new OpenAI({
//     // Local Open-AI API running Llama-2 13b-chat model using
//     // https://github.com/abetlen/llama-cpp-python/tree/main#web-server
//     baseURL: "https://api.fireworks.ai/inference/v1",
//     // Needs to be set to something otherwise it crashes
//     apiKey: "QstqVPKtXVa6IxyLh4FsKebbtJ83wqn9Eu5cjFgFjwJ54U5I",
// })

function filterMessages(
    messages: ChatCompletionMessageParam[],
): ChatCompletionMessageParam[] {
    function reduce(
        messages: ChatCompletionMessageParam[],
    ): ChatCompletionMessageParam[] {
        const MAX_CHARS = 1000
        const MAX_MESSAGES = 10

        function calculateTotalChars(messages: ChatCompletionMessageParam[]) {
            return messages
                .map((message) => (message.content as string).length)
                .reduce((prev, curr) => prev + curr)
        }
        const totalChars: number = calculateTotalChars(messages)

        if (messages.length <= MAX_MESSAGES && totalChars <= MAX_CHARS) {
            return messages
        }

        do {
            messages = messages.slice(1)

            const chars = calculateTotalChars(messages)
            if (chars <= MAX_CHARS) {
                return messages
            }
        } while (messages.length > 1)

        return messages
    }
    const systemMessages = messages.filter(
        (message) => message.role === "system",
    )

    return [
        ...systemMessages,
        ...reduce(messages.filter((message) => message.role !== "assistant")),
    ]
}

export async function POST(req: NextRequest) {
    const { messages } = (await req.json()) as {
        messages: ChatCompletionMessageParam[]
    }

    const filteredMessages = filterMessages(messages)

    if (filteredMessages.length !== messages.length) {
        console.log("Filtered from:", messages)
        console.log("To:", filteredMessages)
    }

    const response = await openai.chat.completions.create({
        // model: "accounts/fireworks/models/llama-v2-70b-chat",
        model: "gpt-4",
        stream: true,
        messages: filteredMessages,
        temperature: 0.75,
        frequency_penalty: 1 / 0.85,
        top_p: 1,
        ["top_k" as any]: 40,
        max_tokens: 1000,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
}
