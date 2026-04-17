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

function readOptionalInput(name: string): string | undefined {
  const value = core.getInput(name, { required: false }) || process.env[name];
  return value?.trim() || undefined;
}

function readNumberInput(name: string): number | undefined {
  const value = readOptionalInput(name);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ConfigError(`${name} must be a valid number`);
  }

  return parsed;
}

export function loadConfig(): AppConfig {
  const rawConfig = {
    githubToken:
      readOptionalInput("GITHUB_TOKEN") || process.env.GITHUB_TOKEN || "",
    aiApiKey: readOptionalInput("AI_API_KEY") || "",
    aiModelName: readOptionalInput("AI_MODEL_NAME") || "gemini-2.5-flash",
    aiBaseUrl: readOptionalInput("AI_BASE_URL"),
    docsPath: readOptionalInput("DOCS_PATH"),
    maxDiffBytes: readNumberInput("MAX_DIFF_BYTES"),
    maxDiffLines: readNumberInput("MAX_DIFF_LINES"),
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
