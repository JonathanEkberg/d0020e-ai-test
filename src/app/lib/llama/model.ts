import { LlamaContext, LlamaModel } from "node-llama-cpp"
import path from "path"
import fs from "fs"

declare global {
    var llamaModel: LlamaModel | undefined
    var llamaCtx: LlamaContext | undefined
}

function createModel() {
    if (process.env.BUILDING === "1") {
        return {} as never
    }

    const modelPath = path.resolve(
        process.env.MODEL_PATH || "s:/models/llama-2-13b-chat.Q4_K_M.gguf",
    )

    if (!fs.existsSync(modelPath)) {
        throw new Error(`Could not find model at path '${modelPath}'`)
    }

    const layers = process.env.GPU_LAYERS
    const gpuLayers = layers ? parseInt(layers) : undefined

    console.log("Loading model")
    return new LlamaModel({
        modelPath,
        gpuLayers: gpuLayers,
    })
}

function createContext() {
    if (process.env.BUILDING === "1") {
        return {} as never
    }

    console.log("Loading model")
    return new LlamaContext({ model: llamaModel })
}

const llamaModel = global.llamaModel || createModel()
const llamaContext = global.llamaCtx || createContext()

if (process.env.NODE_ENV !== "production") {
    global.llamaModel = llamaModel
    global.llamaCtx = llamaContext
}

export { llamaModel, llamaContext }
