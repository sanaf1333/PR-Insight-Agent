export type AnalysisKind = "pr-summary" | "risk-analysis" | "doc-sync";

export interface GenerateTextRequest {
  kind: AnalysisKind;
  prompt: string;
}

export interface GenerateTextResponse {
  text: string;
  model: string;
  provider: string;
}

export interface ProviderContext {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface AiProvider {
  readonly name: string;
  generateText(
    context: ProviderContext,
    request: GenerateTextRequest,
  ): Promise<GenerateTextResponse>;
}
