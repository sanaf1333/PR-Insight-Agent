import { readFile } from "node:fs/promises";
import { toRelativePath } from "./resolver.js";
export async function readDocFiles(paths) {
    const docs = await Promise.all(paths.map(async (filePath) => ({
        path: toRelativePath(filePath),
        content: await readFile(filePath, "utf8"),
    })));
    return docs;
}
