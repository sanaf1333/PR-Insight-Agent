import { OpenAiCompatibleProvider } from "./openai.js";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
export class GroqProvider extends OpenAiCompatibleProvider {
    name = "groq";
    async generateText(context, request) {
        return super.generateText({
            ...context,
            baseUrl: context.baseUrl ?? GROQ_BASE_URL,
        }, request);
    }
}
