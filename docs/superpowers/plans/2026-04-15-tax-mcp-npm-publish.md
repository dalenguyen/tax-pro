# Tax MCP npm Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename all workspace packages from `@can-tax-pro/*` to `@cantax-fyi/*`, rewrite `libs/tax-mcp` as a thin stdio→HTTP proxy, and configure `@nx/esbuild` + `nx release` to publish it to npm.

**Architecture:** The published `@cantax-fyi/tax-mcp` package is a ~25-line Node.js CLI that reads `--apiKey`, connects to the Cloud Run Python server at `https://tax-mcp-371544889573.us-central1.run.app/mcp` via `StreamableHTTPClientTransport` with an `X-API-Key` header, and bridges the connection to stdio. All business logic stays on the server.

**Tech Stack:** TypeScript, `@modelcontextprotocol/sdk@1.26.0`, `@nx/esbuild`, `nx release`, pnpm workspace

---

## File Map

| Action | File |
|--------|------|
| Modify | `tsconfig.base.json` |
| Modify | `package.json` (root) |
| Modify | `libs/db/package.json` |
| Modify | `libs/shared/types/package.json` |
| Modify | `libs/shared/utils/package.json` |
| Modify | `web/vite.config.ts` |
| Modify (bulk sed) | All `*.ts` files importing `@can-tax-pro/*` |
| Rewrite | `libs/tax-mcp/src/main.ts` |
| Rewrite | `libs/tax-mcp/package.json` |
| Rewrite | `libs/tax-mcp/tsconfig.json` |
| Modify | `libs/tax-mcp/project.json` |
| Modify | `nx.json` |
| Delete | `libs/tax-mcp/src/lib/tools/` (7 files) |

---

### Task 1: Rename workspace package names

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.base.json`
- Modify: `libs/db/package.json`
- Modify: `libs/shared/types/package.json`
- Modify: `libs/shared/utils/package.json`

- [ ] **Step 1: Rename root package.json**

In `package.json`, change line 2:
```json
"name": "@cantax-fyi/source",
```

- [ ] **Step 2: Rename lib package.json files**

```bash
# libs/db/package.json — change "name"
sed -i '' 's/"@can-tax-pro\/db"/"@cantax-fyi\/db"/g' libs/db/package.json

# libs/shared/types/package.json — change "name"
sed -i '' 's/"@can-tax-pro\/types"/"@cantax-fyi\/types"/g' libs/shared/types/package.json

# libs/shared/utils/package.json — change "name" and dep reference
sed -i '' 's/"@can-tax-pro\/utils"/"@cantax-fyi\/utils"/g' libs/shared/utils/package.json
sed -i '' 's/"@can-tax-pro\/types"/"@cantax-fyi\/types"/g' libs/shared/utils/package.json

# libs/tax-mcp/package.json — will be fully rewritten in Task 3, skip for now
```

- [ ] **Step 3: Update tsconfig.base.json path aliases**

In `tsconfig.base.json`, replace lines 18-20:
```json
"@cantax-fyi/types": ["libs/shared/types/src/index.ts"],
"@cantax-fyi/utils": ["libs/shared/utils/src/index.ts"],
"@cantax-fyi/db": ["libs/db/src/index.ts"]
```

- [ ] **Step 4: Bulk rename all source file imports**

```bash
# Replace all @can-tax-pro/ import paths in .ts files (excludes node_modules, dist, .nx)
find . -type f -name "*.ts" \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/.nx/*" \
  -exec sed -i '' 's/@can-tax-pro\//@cantax-fyi\//g' {} +
```

- [ ] **Step 5: Update web/vite.config.ts aliases**

In `web/vite.config.ts`, replace the three occurrences:
```ts
inline: ['@cantax-fyi/db', '@cantax-fyi/types', '@cantax-fyi/utils'],
// ...
'@cantax-fyi/db': resolve(__dirname, '../libs/db/src/index.ts'),
'@cantax-fyi/types': resolve(__dirname, '../libs/shared/types/src/index.ts'),
'@cantax-fyi/utils': resolve(__dirname, '../libs/shared/utils/src/index.ts'),
```

- [ ] **Step 6: Verify no @can-tax-pro references remain in source**

```bash
grep -r "@can-tax-pro" . \
  --include="*.ts" --include="*.json" \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=.nx \
  --exclude="package-lock.json"
```

Expected: no output (zero matches).

- [ ] **Step 7: Verify workspace still resolves**

```bash
pnpm nx show project web --json | grep -c "cantax-fyi"
```

Expected: output ≥ 1 (confirms aliases picked up).

- [ ] **Step 8: Commit**

```bash
git add tsconfig.base.json package.json libs/db/package.json \
  libs/shared/types/package.json libs/shared/utils/package.json \
  web/vite.config.ts
git add $(git diff --name-only | grep "\.ts$")
git commit -m "refactor: rename @can-tax-pro/* to @cantax-fyi/*"
```

---

### Task 2: Rewrite libs/tax-mcp as stdio→HTTP proxy

**Files:**
- Rewrite: `libs/tax-mcp/src/main.ts`
- Delete: `libs/tax-mcp/src/lib/tools/` (7 files)

- [ ] **Step 1: Delete tool files**

```bash
rm -rf libs/tax-mcp/src/lib
```

- [ ] **Step 2: Rewrite main.ts**

Replace the entire contents of `libs/tax-mcp/src/main.ts`:

```typescript
#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const SERVER_URL = 'https://tax-mcp-371544889573.us-central1.run.app/mcp';

function getApiKey(): string {
  const idx = process.argv.indexOf('--apiKey');
  const key = idx !== -1 ? process.argv[idx + 1] : undefined;
  if (!key) {
    process.stderr.write(
      'Error: --apiKey <key> is required\nGenerate one at cantax.fyi → Settings → MCP API Keys\n'
    );
    process.exit(1);
  }
  return key;
}

async function main() {
  const apiKey = getApiKey();

  // Raw transport proxy — no Client/Server handshake here.
  // Claude Code sends MCP JSON-RPC on stdin; we forward to HTTP and pipe responses back.
  const http = new StreamableHTTPClientTransport(new URL(SERVER_URL), {
    requestInit: { headers: { 'X-API-Key': apiKey } },
  });

  const stdio = new StdioServerTransport();

  // Wire: stdio → HTTP
  stdio.onmessage = (msg) => http.send(msg);
  // Wire: HTTP → stdio
  http.onmessage = (msg) => stdio.send(msg);

  http.onerror = (err) => {
    process.stderr.write(`MCP error: ${err.message}\n`);
    process.exit(1);
  };

  stdio.onerror = (err) => {
    process.stderr.write(`stdio error: ${err.message}\n`);
    process.exit(1);
  };

  await http.start();
  await stdio.start();
}

main().catch((err) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --project libs/tax-mcp/tsconfig.json --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add libs/tax-mcp/src/
git commit -m "refactor(tax-mcp): rewrite as stdio→HTTP proxy, remove direct Firebase deps"
```

---

### Task 3: Update libs/tax-mcp package.json and tsconfig

**Files:**
- Rewrite: `libs/tax-mcp/package.json`
- Modify: `libs/tax-mcp/tsconfig.json`
- Modify: `libs/tax-mcp/project.json`

- [ ] **Step 1: Rewrite libs/tax-mcp/package.json**

Replace the entire file:

```json
{
  "name": "@cantax-fyi/tax-mcp",
  "version": "0.0.1",
  "description": "MCP server for cantax.fyi — read and write Canadian tax data via AI",
  "type": "commonjs",
  "main": "dist/main.js",
  "bin": {
    "cantax-fyi-mcp": "dist/main.js"
  },
  "files": ["dist"],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.26.0"
  },
  "engines": {
    "node": ">=22"
  }
}
```

- [ ] **Step 2: Update libs/tax-mcp/tsconfig.json outDir**

Change `outDir` to point to the local `dist/` (used only for type-checking, not the actual build output which esbuild handles):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"],
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Remove npm:private tag from project.json**

In `libs/tax-mcp/project.json`, change `"tags"`:
```json
"tags": ["scope:libs", "type:mcp"]
```

- [ ] **Step 4: Commit**

```bash
git add libs/tax-mcp/package.json libs/tax-mcp/tsconfig.json libs/tax-mcp/project.json
git commit -m "chore(tax-mcp): update package.json for npm publish, remove private tag"
```

---

### Task 4: Install @nx/esbuild and add build target

**Files:**
- Modify: `libs/tax-mcp/project.json`

- [ ] **Step 1: Install @nx/esbuild**

```bash
pnpm add -D @nx/esbuild -w
```

- [ ] **Step 2: Add build target to libs/tax-mcp/project.json**

Replace the entire `targets` object:

```json
"targets": {
  "build": {
    "executor": "@nx/esbuild:esbuild",
    "outputs": ["{options.outputPath}"],
    "options": {
      "outputPath": "libs/tax-mcp/dist",
      "main": "libs/tax-mcp/src/main.ts",
      "tsConfig": "libs/tax-mcp/tsconfig.json",
      "bundle": true,
      "format": ["cjs"],
      "platform": "node",
      "target": "node22",
      "minify": false,
      "sourcemap": false,
      "deleteOutputPath": true,
      "generatePackageJson": false
    }
  },
  "serve": {
    "executor": "nx:run-commands",
    "options": {
      "command": "pnpm tsx libs/tax-mcp/src/main.ts"
    }
  }
}
```

- [ ] **Step 3: Run the build**

```bash
pnpm nx run tax-mcp-sdk:build
```

Expected output:
```
> nx run tax-mcp-sdk:build
...
 NX   Successfully ran target build for project tax-mcp-sdk
```

- [ ] **Step 4: Verify dist output**

```bash
ls libs/tax-mcp/dist/
```

Expected: `main.js` present.

```bash
head -1 libs/tax-mcp/dist/main.js
```

Expected: starts with `#!/usr/bin/env node` or compiled JS (not TS source).

- [ ] **Step 5: Commit**

```bash
git add libs/tax-mcp/project.json package.json pnpm-lock.yaml
git commit -m "build(tax-mcp): add @nx/esbuild build target, bundle as CJS for npx"
```

---

### Task 5: Configure nx release and dry-run publish

**Files:**
- Modify: `nx.json`

- [ ] **Step 1: Add release config to nx.json**

Add a `"release"` key to `nx.json` (at the top level, after `"generators"`):

```json
"release": {
  "projects": ["tax-mcp-sdk"],
  "projectsRelationship": "independent",
  "version": {
    "conventionalCommits": true
  },
  "changelog": {
    "projectChangelogs": true
  }
}
```

- [ ] **Step 2: Verify nx release plan (dry run)**

```bash
pnpm nx release --projects=tax-mcp-sdk --dry-run 2>&1 | head -40
```

Expected: shows version bump plan, no errors.

- [ ] **Step 3: Verify npm login**

```bash
npm whoami
```

Expected: your npm username. If not logged in, run `npm login` first.

- [ ] **Step 4: Publish dry run**

```bash
pnpm nx release publish --projects=tax-mcp-sdk --dry-run
```

Expected: shows what would be published to `@cantax-fyi/tax-mcp`, no actual publish.

- [ ] **Step 5: Commit nx.json**

```bash
git add nx.json
git commit -m "chore: configure nx release for @cantax-fyi/tax-mcp"
```

---

### Task 6: Smoke test before publishing

- [ ] **Step 1: Build final artifact**

```bash
pnpm nx run tax-mcp-sdk:build
```

Expected: succeeds, `libs/tax-mcp/dist/main.js` updated.

- [ ] **Step 2: Test --apiKey missing error**

```bash
node libs/tax-mcp/dist/main.js 2>&1
```

Expected:
```
Error: --apiKey <key> is required
Generate one at cantax.fyi → Settings → MCP API Keys
```

- [ ] **Step 3: Verify package contents**

```bash
cd libs/tax-mcp && npm pack --dry-run 2>&1
```

Expected: lists only `dist/main.js` and `package.json`. No `src/`, no `node_modules/`.

- [ ] **Step 4: Publish for real**

```bash
pnpm nx release --projects=tax-mcp-sdk --first-release
```

`--first-release` skips changelog diff since there's no prior git tag.

- [ ] **Step 5: Verify on npm**

```bash
npm info @cantax-fyi/tax-mcp
```

Expected: shows version `0.0.1`, bin `cantax-fyi-mcp`.

- [ ] **Step 6: Update README**

In `libs/tax-mcp/README.md`, replace the `## Setup` section's MCP config example:

```json
{
  "mcpServers": {
    "can-tax-pro": {
      "command": "npx",
      "args": ["@cantax-fyi/tax-mcp", "--apiKey", "<YOUR_MCP_API_KEY>"]
    }
  }
}
```

Remove the old `pnpm tsx` instructions. Remove the `## Publishing to npm` placeholder section.

- [ ] **Step 7: Final commit**

```bash
git add libs/tax-mcp/README.md
git commit -m "docs(tax-mcp): update README with npx install instructions"
```
