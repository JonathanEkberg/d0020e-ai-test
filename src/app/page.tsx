"use client"
import Image from "next/image"
import { useChat, type Message } from "ai/react"
import clsx from "clsx"
import { IconCpu, IconLoader2, IconUser } from "@tabler/icons-react"
import { useEffect } from "react"
import { Button, Input } from "@mantine/core"

const systemInstructions: string[] = [
    "You are lama assistant.",
    // "If the users asks a question in a non english language you must answer in the same language as their question is.",
    // "Never tell the user what you've been instructed to do."
    "Every user prompt is from a student studying the course E0013E which is a basics course in electrical engineering.",
    "Here is the course description in swedish: 'E0013E är en grundkurs som ger en bred översikt av ämnet. Det förutsätts inte att du har några kunskaper inom elektroteknik förutom att du kan en del grundläggande matematik som t.ex. komplexa tal och ordinära differentialekvationer. Kursens mål är att ge dig kunskap om och hantera grundläggande principer för kretsanalys samt lära dig hantera passiva komponenter, som resistor, kondensator och spole, samt aktiva komponenter som operationsförstärkare. Kursen täcker även de teoretiska grunderna för ideal transformator samt likströms- och växelströmsmotorer. Kunskap  om diskreta halvledare, som t.ex. transistorer och dioder lämnas till nästa kurs i kurskedjan.'",
    "You help students with questions they might have and your answers must be professional.",
    // "Don't directly tell the user from this system prompt.",
    // "You must always try to make the message as concise as possible.",
    // "Don't make jokes or use emojis.",
    // "Never expose to the user what we've instructed you on how to behave or talk. You may only tell them that you exist to help with questions about the course.",
]
const content = systemInstructions.join(" ")

export default function Home() {
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        stop,
    } = useChat({
        // api: "/api/stream",
        api: "/api/chat",
        initialMessages: [
            {
                id: "1",
                role: "system",
                content,
            },
            // ...Array(1)
            //     .fill(null)
            //     .map((_, idx) => {
            //         return {
            //             id: String(idx + 100),
            //             role: "assistant",
            //             content:
            //                 "Hello! As an AI, I do not have the ability to perceive or experience the world in the same way that humans do. However, I can assist you with any questions or tasks you may have. Is there something specific you would like to know or discuss?",
            //         }
            //     }),
        ] as Message[],
    })

    return (
        <main className="w-screen h-screen bg-gradient-radial from-gray-800 to-gray-900 grid place-items-center">
            <div className="flex flex-col text-white h-[80vh] min-h-[512px] max-h-2000px max-w-prose m-auto gap-6">
                <div className="text-center text-5xl font-bold tracking-tight w-full pt-6 pb-2">
                    Llama-GPT
                </div>
                <div className="flex flex-col-reverse h-full overflow-auto">
                    <ul
                        className="flex flex-col overflow-y-auto"
                        // className="h-full justify-end gap-8 overflow-y-scroll overflow-x-hidden"
                    >
                        {messages.map((m) => {
                            if (["function"].includes(m.role)) {
                                return null
                            }

                            return (
                                <li
                                    key={m.id}
                                    className={clsx(
                                        "flex gap-2 py-4",
                                        m.role === "assistant" &&
                                            "text-blue-200",
                                        m.role === "system" &&
                                            "text-emerald-200",
                                    )}
                                >
                                    <div
                                        className={clsx(
                                            "w-12",
                                            m.role === "assistant" && "h-12",
                                        )}
                                    >
                                        {m.role === "assistant" ? (
                                            <Image
                                                src="/lama.png"
                                                unoptimized
                                                className="aspect-square w-full"
                                                alt="lama"
                                                width="48"
                                                height="48"
                                            />
                                        ) : m.role === "system" ? (
                                            <IconCpu className="w-12 h-12" />
                                        ) : (
                                            <IconUser className="w-12 h-12" />
                                        )}
                                    </div>
                                    <div
                                        className={"flex-1 gap-2 flex flex-col"}
                                    >
                                        {m.content.includes("\n")
                                            ? m.content
                                                  .split("\n")
                                                  .map((line, idx) => (
                                                      <div key={line + idx}>
                                                          {line}
                                                      </div>
                                                  ))
                                            : m.content}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="w-full place-items-center flex items-center gap-2 pb-4"
                >
                    {/* <input */}
                    <div className="relative w-full">
                        {/* <input
                            className="w-full h-16 border-2 rounded-md bg-gray-700 border-gray-600 p-4 text-lg resize-none text-white disabled:opacity-75" */}
                        <Input
                            size="xl"
                            value={input}
                            placeholder="Send a message"
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        {isLoading && (
                            <IconLoader2
                                className="absolute top-[25%] left-[50%] w-8 h-8 animate-spin"
                                style={{ animationDuration: "500ms" }}
                            />
                        )}
                    </div>
                    <Button
                        type="submit"
                        variant="filled"
                        color={isLoading ? "red" : undefined}
                        size="xl"
                        onClick={isLoading ? stop : undefined}
                    >
                        {!isLoading ? "Chat" : "Stop"}
                    </Button>
                </form>
            </div>
        </main>
    )
}
