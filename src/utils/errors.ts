export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ConfigError extends AppError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR");
    this.name = "ConfigError";
  }
}

export class ProviderError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, "PROVIDER_ERROR", cause);
    this.name = "ProviderError";
  }
}

export class GitHubApiError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, "GITHUB_API_ERROR", cause);
    this.name = "GitHubApiError";
  }
}
