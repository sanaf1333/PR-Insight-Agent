import * as core from "@actions/core";
import { z } from "zod";

import { ConfigError } from "../utils/errors.js";

const configSchema = z.object({
  githubToken: z.string().min(1, "GITHUB_TOKEN is required"),
  aiApiKey: z.string().min(1, "AI_API_KEY is required"),
  aiModelName: z.string().min(1, "AI_MODEL_NAME is required"),
  aiBaseUrl: z.string().optional(),
  docsPath: z.string().optional(),
  maxDiffBytes: z.number().int().positive().default(60 * 1024),
  maxDiffLines: z.number().int().positive().default(1500),
});

export type AppConfig = z.infer<typeof configSchema>;

function readOptionalValue(options: {
  inputs: string[];
  env: string[];
}): string | undefined {
  for (const inputName of options.inputs) {
    const value = core.getInput(inputName, { required: false });
    if (value && value.trim()) {
      return value.trim();
    }
  }

  for (const envName of options.env) {
    const value = process.env[envName];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function readNumberValue(options: { inputs: string[]; env: string[] }): number | undefined {
  const value = readOptionalValue(options);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ConfigError("Configured value must be a valid number");
  }

  return parsed;
}

export function loadConfig(): AppConfig {
  const rawConfig = {
    githubToken:
      readOptionalValue({ inputs: ["github_token", "GITHUB_TOKEN"], env: ["GITHUB_TOKEN"] }) ||
      "",
    aiApiKey:
      readOptionalValue({ inputs: ["ai_api_key", "AI_API_KEY"], env: ["AI_API_KEY"] }) || "",
    aiModelName:
      readOptionalValue({ inputs: ["ai_model_name", "AI_MODEL_NAME"], env: ["AI_MODEL_NAME"] }) ||
      "gemini-2.5-flash-lite",
    aiBaseUrl: readOptionalValue({ inputs: ["ai_base_url", "AI_BASE_URL"], env: ["AI_BASE_URL"] }),
    docsPath: readOptionalValue({ inputs: ["docs_path", "DOCS_PATH"], env: ["DOCS_PATH"] }),
    maxDiffBytes: readNumberValue({
      inputs: ["max_diff_bytes", "MAX_DIFF_BYTES"],
      env: ["MAX_DIFF_BYTES"],
    }),
    maxDiffLines: readNumberValue({
      inputs: ["max_diff_lines", "MAX_DIFF_LINES"],
      env: ["MAX_DIFF_LINES"],
    }),
  };

  const parsed = configSchema.safeParse(rawConfig);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new ConfigError(message);
  }

  core.setSecret(parsed.data.aiApiKey);
  if (parsed.data.githubToken) {
    core.setSecret(parsed.data.githubToken);
  }

  return parsed.data;
}
