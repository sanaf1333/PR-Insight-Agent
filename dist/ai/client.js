import { ProviderError } from "../utils/errors.js";
import { GeminiProvider } from "./providers/gemini.js";
import { GroqProvider } from "./providers/groq.js";
import { OpenAiCompatibleProvider } from "./providers/openai.js";
function selectProvider(model) {
    const normalized = model.toLowerCase();
    if (normalized.includes("gemini")) {
        return new GeminiProvider();
    }
    if (normalized.includes("llama") || normalized.includes("groq")) {
        return new GroqProvider();
    }
    return new OpenAiCompatibleProvider();
}
export async function generateAnalysis(config, request) {
    const provider = selectProvider(config.aiModelName);
    try {
        return await provider.generateText({
            apiKey: config.aiApiKey,
            model: config.aiModelName,
            baseUrl: config.aiBaseUrl,
        }, request);
    }
    catch (error) {
        const details = error instanceof Error ? `: ${error.message}` : `: ${String(error)}`;
        throw new ProviderError(`Failed to generate ${request.kind} using provider ${provider.name}${details}`, error);
    }
}
