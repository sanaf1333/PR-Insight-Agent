import fg from "fast-glob";
import path from "node:path";

export async function resolveDocsPaths(
  docsPath: string | undefined,
  cwd = process.cwd(),
): Promise<string[]> {
  if (!docsPath) {
    return [];
  }

  const patterns = docsPath
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (patterns.length === 0) {
    return [];
  }

  const matches = await fg(patterns, {
    cwd,
    onlyFiles: true,
    absolute: true,
  });

  return [...new Set(matches)].sort((left, right) => left.localeCompare(right));
}

export function toRelativePath(filePath: string, cwd = process.cwd()): string {
  return path.relative(cwd, filePath) || filePath;
}
