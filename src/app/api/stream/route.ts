import { Message, StreamingTextResponse } from "ai"
import {
    LlamaContext,
    LlamaChatSession,
    ConversationInteraction,
} from "node-llama-cpp"
import { llamaContext, llamaModel } from "@/app/lib/llama/model"

// const openai = new OpenAI({
//     // Local Open-AI API running Llama-2 13b-chat model using
//     // https://github.com/abetlen/llama-cpp-python/tree/main#web-server
//     baseURL: "http://localhost:8000/v1",
//     // Needs to be set to something otherwise it crashes
//     apiKey: "",
// })
// // const openai = new OpenAI({
// //     // Local Open-AI API running Llama-2 13b-chat model using
// //     // https://github.com/abetlen/llama-cpp-python/tree/main#web-server
// //     baseURL: "https://api.fireworks.ai/inference/v1",
// //     // Needs to be set to something otherwise it crashes
// //     apiKey: "QstqVPKtXVa6IxyLh4FsKebbtJ83wqn9Eu5cjFgFjwJ54U5I",
// // })

// function filterMessages(
//     messages: ChatCompletionMessageParam[],
// ): ChatCompletionMessageParam[] {
//     function reduce(
//         messages: ChatCompletionMessageParam[],
//     ): ChatCompletionMessageParam[] {
//         const MAX_CHARS = 1000
//         const MAX_MESSAGES = 10

//         function calculateTotalChars(messages: ChatCompletionMessageParam[]) {
//             return messages
//                 .map((message) => (message.content as string).length)
//                 .reduce((prev, curr) => prev + curr)
//         }
//         const totalChars: number = calculateTotalChars(messages)

//         if (messages.length <= MAX_MESSAGES && totalChars <= MAX_CHARS) {
//             return messages
//         }

//         do {
//             messages = messages.slice(1)

//             const chars = calculateTotalChars(messages)
//             if (chars <= MAX_CHARS) {
//                 return messages
//             }
//         } while (messages.length > 1)

//         return messages
//     }
//     const systemMessages = messages.filter(
//         (message) => message.role === "system",
//     )

//     return [
//         ...systemMessages,
//         ...reduce(messages.filter((message) => message.role !== "assistant")),
//     ]
// }

// async function* streamAnswer(prompt: string) {
//     const ctx = new LlamaContext({ model: llamaModel })

//     let resolveNext: ((value: string) => void) | null = null
//     const queue: string[] = []

//     // This function waits until the queue is not empty, then returns the next value.
//     async function getNextString() {
//         if (queue.length > 0) {
//             return queue.shift()
//         }
//         // Wait for `onToken` to push a new string and call resolveNext.
//         return new Promise<string>((resolve) => {
//             resolveNext = resolve
//         })
//     }

//     // This is called whenever a new token is ready.
//     function onToken(chunk: Token[] | null) {
//         if (chunk == null) {
//             return
//         }

//         const string = ctx.decode(chunk)
//         if (resolveNext) {
//             // If getNextString is waiting, resolve it immediately.
//             resolveNext(string)
//             resolveNext = null
//         } else {
//             // Otherwise, enqueue the string.
//             queue.push(string)
//         }
//     }

//     const session = new LlamaChatSession({
//         context: ctx,
//     })
//     session
//         .prompt(prompt, {
//             onToken,
//         })
//         .then(() => onToken(null))

//     let string
//     while ((string = await getNextString()) !== undefined) {
//         yield string
//     }
// }
const systemPrompt = [
    "You are lama assistant.",
    // "If the users asks a question in a non english language you must answer in the same language as their question is.",
    "Every user prompt is from a student styding the course E0013E which is a basics course in electrical engineering.",
    "Here is the course description in swedish: 'E0013E är en grundkurs som ger en bred översikt av ämnet. Det förutsätts inte att du har några kunskaper inom elektroteknik förutom att du kan en del grundläggande matematik som t.ex. komplexa tal och ordinära differentialekvationer. Kursens mål är att ge dig kunskap om och hantera grundläggande principer för kretsanalys samt lära dig hantera passiva komponenter, som resistor, kondensator och spole, samt aktiva komponenter som operationsförstärkare. Kursen täcker även de teoretiska grunderna för ideal transformator samt likströms- och växelströmsmotorer. Kunskap  om diskreta halvledare, som t.ex. transistorer och dioder lämnas till nästa kurs i kurskedjan.'",
    "You help students with questions they might have and your answers must be professional.",
    "Write as little text as possbile in your answer.",
].join(" ")

function streamAnswer(
    prompt: string,
    history?: ConversationInteraction[],
    abortSignal?: AbortSignal,
): ReadableStream<string> {
    const session = new LlamaChatSession({
        context: new LlamaContext({ model: llamaModel }),
        systemPrompt,
        conversationHistory: history,
    })
    let canceled = false

    return new ReadableStream<string>({
        async start(controller) {
            console.log("Stream started")
            await session.prompt(prompt, {
                signal: abortSignal,
                // grammar: await LlamaGrammar.getFor(""),
                temperature: 0.75,
                repeatPenalty: { frequencyPenalty: 1 / 0.85 },
                topP: 1,
                topK: 40,
                maxTokens: 512,
                onToken: (token) => {
                    const decoded = llamaContext.decode(token)
                    process.stdout.write(decoded)

                    if (!canceled) {
                        controller.enqueue(decoded)
                    } else {
                        controller.close()
                    }
                },
            })
            controller.close()
            process.stdout.write("\n")
            console.log("Stream closed")
        },
        cancel(reason) {
            canceled = true
            process.stdout.write("\n")
            console.log(`Stream closed (${reason})`)
        },
    })
}

export async function POST(req: Request) {
    const { messages, ...rest } = await req.json()
    console.log("Rest params:", rest)
    const prompt = (messages as Message[]).at(-1)!.content as string

    if (!prompt) {
        throw new Error("Didn't find question")
    }

    const history: ConversationInteraction[] | undefined = (function () {
        let msgs = (messages as Message[]).filter(
            (message) => message.role !== "system",
        )

        if (msgs.length === 0) {
            return undefined
        }

        const interactions: ConversationInteraction[] = []

        while (msgs.length > 1) {
            const first = msgs.at(0)
            const second = msgs.at(1)

            if (!first || !second) {
                break
            }

            if (first.role !== "user") {
                throw new Error("First message has to be from user")
            }

            interactions.push({
                prompt: first.content,
                response: second.content,
            })
            msgs = msgs.slice(2)
        }

        return interactions
    })()?.slice(-3)
    console.log("History:", history)

    const stream = streamAnswer(prompt, history, req.signal)
    return new StreamingTextResponse(stream)
}
