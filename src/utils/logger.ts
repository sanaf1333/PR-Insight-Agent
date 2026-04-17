import * as core from "@actions/core";

function formatDetails(details?: Record<string, unknown>): string {
  if (!details || Object.keys(details).length === 0) {
    return "";
  }

  return ` ${JSON.stringify(details)}`;
}

export const logger = {
  info(message: string, details?: Record<string, unknown>): void {
    core.info(`${message}${formatDetails(details)}`);
  },

  warning(message: string, details?: Record<string, unknown>): void {
    core.warning(`${message}${formatDetails(details)}`);
  },

  error(message: string, details?: Record<string, unknown>): void {
    core.error(`${message}${formatDetails(details)}`);
  },
};
