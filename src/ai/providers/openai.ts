import type {
  AiProvider,
  GenerateTextRequest,
  GenerateTextResponse,
  ProviderContext,
} from "../types.js";
import { ProviderError } from "../../utils/errors.js";

const DEFAULT_BASE_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAiCompatibleProvider implements AiProvider {
  readonly name: string = "openai-compatible";

  async generateText(
    context: ProviderContext,
    request: GenerateTextRequest,
  ): Promise<GenerateTextResponse> {
    const response = await fetch(context.baseUrl ?? DEFAULT_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${context.apiKey}`,
      },
      body: JSON.stringify({
        model: context.model,
        messages: [
          {
            role: "system",
            content:
              "You are a pull request analysis assistant. Return concise markdown.",
          },
          { role: "user", content: request.prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new ProviderError(
        `OpenAI-compatible request failed with status ${response.status}`,
        await response.text(),
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new ProviderError("OpenAI-compatible response did not contain text");
    }

    return {
      text,
      model: context.model,
      provider: this.name,
    };
  }
}
