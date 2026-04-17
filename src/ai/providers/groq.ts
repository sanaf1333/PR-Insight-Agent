import { OpenAiCompatibleProvider } from "./openai.js";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

export class GroqProvider extends OpenAiCompatibleProvider {
  readonly name = "groq";

  override async generateText(context: Parameters<OpenAiCompatibleProvider["generateText"]>[0], request: Parameters<OpenAiCompatibleProvider["generateText"]>[1]) {
    return super.generateText(
      {
        ...context,
        baseUrl: context.baseUrl ?? GROQ_BASE_URL,
      },
      request,
    );
  }
}
