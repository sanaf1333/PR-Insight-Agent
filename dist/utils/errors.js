export class AppError extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = "AppError";
    }
}
export class ConfigError extends AppError {
    constructor(message) {
        super(message, "CONFIG_ERROR");
        this.name = "ConfigError";
    }
}
export class ProviderError extends AppError {
    constructor(message, cause) {
        super(message, "PROVIDER_ERROR", cause);
        this.name = "ProviderError";
    }
}
export class GitHubApiError extends AppError {
    constructor(message, cause) {
        super(message, "GITHUB_API_ERROR", cause);
        this.name = "GitHubApiError";
    }
}
