import { ProviderError } from "../../utils/errors.js";
const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const MAX_DELAY_MS = 10_000;
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
export function calculateRetryDelay(attempt) {
    return Math.min(RETRY_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 1000, MAX_DELAY_MS);
}
export class GeminiProvider {
    name = "gemini";
    async generateText(context, request) {
        const baseUrl = context.baseUrl ?? DEFAULT_BASE_URL;
        const url = `${baseUrl}/${context.model}:generateContent?key=${encodeURIComponent(context.apiKey)}`;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
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
            if (response.ok) {
                const data = (await response.json());
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
            const responseBody = await response.text();
            const isRetriable = response.status === 503 || response.status === 429;
            if (!isRetriable || attempt === MAX_RETRIES) {
                throw new ProviderError(`Gemini request failed with status ${response.status}: ${responseBody}`, responseBody);
            }
            await sleep(calculateRetryDelay(attempt));
        }
        throw new ProviderError("Gemini request failed after retries");
    }
}
