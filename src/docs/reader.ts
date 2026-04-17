import { readFile } from "node:fs/promises";

import { toRelativePath } from "./resolver.js";

export interface DocFile {
  path: string;
  content: string;
}

export async function readDocFiles(paths: string[]): Promise<DocFile[]> {
  const docs = await Promise.all(
    paths.map(async (filePath) => ({
      path: toRelativePath(filePath),
      content: await readFile(filePath, "utf8"),
    })),
  );

  return docs;
}
