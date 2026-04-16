# Can Tax

Canadian tax tracking for freelancers and self-employed individuals. Track income, expenses, rental properties, and investments to simplify your annual tax return.

## Features

- Business income & expense tracking (multi-currency with CAD conversion)
- Rental property income/expense management
- RRSP/TFSA investment contributions
- Receipt upload with AI extraction (Vertex AI OCR)
- Tax reports: T2125, income statement, expense breakdown, investment summary
- **MCP server** — let Claude Code manage your tax data via natural language

## Stack

- [AnalogJS](https://analogjs.org/) (Angular SSR) + h3 server
- Firebase / Firestore
- Google Cloud Storage (receipts)
- Vertex AI (receipt OCR)
- Nx monorepo

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Firebase project
- `gcloud` CLI (for local dev with Application Default Credentials)

### Install

```bash
pnpm install
```

### Environment

Create `web/.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

For server-side Firebase Admin (local dev), authenticate via ADC:

```bash
gcloud auth application-default login
```

Or set `FIREBASE_SERVICE_ACCOUNT` to the JSON of a service account key.

### Run

```bash
pnpm nx serve web
```

App available at `http://localhost:4200`.

## Project Structure

```
can-tax-pro/
├── web/                    # AnalogJS app (Angular SSR + API routes)
│   └── src/
│       ├── app/            # Angular pages, components, services
│       └── server/         # h3 API routes + middleware
├── libs/
│   ├── db/                 # Firebase Admin + Firestore helpers
│   └── shared/
│       ├── types/          # TypeScript interfaces & enums
│       └── utils/          # Zod schemas, currency, tax utilities
└── tools/
    └── tax-mcp/            # MCP server for Claude Code integration
```

## MCP Server

Claude Code can manage your tax data directly. See [tools/tax-mcp/README.md](tools/tax-mcp/README.md) for setup and usage.

## License

MIT
