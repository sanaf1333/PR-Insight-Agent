import type {
  AiProvider,
  GenerateTextRequest,
  GenerateTextResponse,
  ProviderContext,
} from "../types.js";
import { ProviderError } from "../../utils/errors.js";

const DEFAULT_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";

  async generateText(
    context: ProviderContext,
    request: GenerateTextRequest,
  ): Promise<GenerateTextResponse> {
    const baseUrl = context.baseUrl ?? DEFAULT_BASE_URL;
    const url = `${baseUrl}/${context.model}:generateContent?key=${encodeURIComponent(
      context.apiKey,
    )}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a pull request analysis assistant. Return concise markdown.\n\n${request.prompt}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new ProviderError(
        `Gemini request failed with status ${response.status}`,
        await response.text(),
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      throw new ProviderError("Gemini response did not contain text");
    }

    return {
      text,
      model: context.model,
      provider: this.name,
    };
  }
}
