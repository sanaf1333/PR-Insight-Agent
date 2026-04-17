import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { resolveDocsPaths } from "../src/docs/resolver.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (dir) => {
      await import("node:fs/promises").then(({ rm }) =>
        rm(dir, { recursive: true, force: true }),
      );
    }),
  );
});

describe("resolveDocsPaths", () => {
  it("returns matching markdown files", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "pr-insight-agent-"));
    tempDirs.push(dir);

    await writeFile(path.join(dir, "README.md"), "# Test\n");
    await writeFile(path.join(dir, "guide.md"), "# Guide\n");

    const files = await resolveDocsPaths("*.md", dir);
    expect(files).toHaveLength(2);
  });
});
