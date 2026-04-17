import type { AppConfig } from "../config/env.js";
import { ProviderError } from "../utils/errors.js";
import { GeminiProvider } from "./providers/gemini.js";
import { GroqProvider } from "./providers/groq.js";
import { OpenAiCompatibleProvider } from "./providers/openai.js";
import type { AiProvider, GenerateTextRequest, GenerateTextResponse } from "./types.js";

function selectProvider(model: string): AiProvider {
  const normalized = model.toLowerCase();

  if (normalized.includes("gemini")) {
    return new GeminiProvider();
  }

  if (normalized.includes("llama") || normalized.includes("groq")) {
    return new GroqProvider();
  }

  return new OpenAiCompatibleProvider();
}

export async function generateAnalysis(
  config: AppConfig,
  request: GenerateTextRequest,
): Promise<GenerateTextResponse> {
  const provider = selectProvider(config.aiModelName);

  try {
    return await provider.generateText(
      {
        apiKey: config.aiApiKey,
        model: config.aiModelName,
        baseUrl: config.aiBaseUrl,
      },
      request,
    );
  } catch (error) {
    const details =
      error instanceof Error ? `: ${error.message}` : `: ${String(error)}`;
    throw new ProviderError(
      `Failed to generate ${request.kind} using provider ${provider.name}${details}`,
      error,
    );
  }
}
