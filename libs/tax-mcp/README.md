# @cantax-fyi/tax-mcp

MCP (Model Context Protocol) server for [Can Tax](https://cantax.fyi). Lets Claude Code and other MCP-compatible AI assistants read and write your Canadian tax data directly via natural language.

## Tools (26 total)

### Tax Years
| Tool | Description |
|------|-------------|
| `list_tax_years` | List all tax years, newest first |
| `create_tax_year` | Create a new tax year (2000–2100) |
| `delete_tax_year` | Delete a tax year and all its data (income, expenses, investments, receipts, rentals) |

### Business Income
| Tool | Description |
|------|-------------|
| `list_income` | List income entries, optionally filter by `sourceType` (`RENTAL`, `INTERNET_BUSINESS`, `STRIPE`) |
| `create_income` | Add a single income entry |
| `delete_income` | Delete a single income entry by ID |
| `bulk_import_income` | Batch-import multiple income entries |

### Business Expenses
| Tool | Description |
|------|-------------|
| `list_expenses` | List expense entries, optionally filter by `category` |
| `create_expense` | Add a single expense entry |
| `delete_expense` | Delete a single expense entry by ID |
| `bulk_import_expenses` | Batch-import multiple expense entries |

### Investments
| Tool | Description |
|------|-------------|
| `list_investments` | List RRSP/TFSA contributions, optionally filter by `accountType` |
| `create_investment` | Record a new RRSP or TFSA contribution |
| `delete_investment` | Delete a single investment contribution by ID |

### Rental Properties
| Tool | Description |
|------|-------------|
| `list_rental_properties` | List all rental properties for a tax year |
| `create_rental_property` | Add a new rental property |
| `delete_rental_property` | Delete a rental property and all its income/expenses |
| `list_rental_income` | List income entries for a property |
| `add_rental_income` | Record rental income for a property |
| `delete_rental_income` | Delete a single rental income entry |
| `list_rental_expenses` | List expenses for a property, optionally filter by `category` |
| `add_rental_expense` | Record a rental expense for a property |
| `delete_rental_expense` | Delete a single rental expense entry |

### Receipts
| Tool | Description |
|------|-------------|
| `list_receipts` | List receipts, optionally filter by `status` (`PENDING`, `EXTRACTED`, `VERIFIED`, etc.) |
| `get_receipt` | Get a single receipt by ID |

### Reports
| Tool | Description |
|------|-------------|
| `get_tax_summary` | Full tax summary: income, expenses, rental, investments, estimated federal tax |

## Prerequisites

- A Can Tax account at [cantax.fyi](https://cantax.fyi)

## Setup

### 1. Generate an API key

Log in → **Settings → MCP API Keys → Generate key**. Copy the key — it's shown only once.

### 2. Configure your MCP client

**Option A — Streamable HTTP (recommended)**

Supported by Claude Code and any client with native `streamable-http` support. No local install required.

```json
{
  "mcpServers": {
    "cantax-fyi": {
      "type": "streamable-http",
      "url": "https://tax-mcp-371544889573.us-central1.run.app/mcp",
      "headers": {
        "x-api-key": "<YOUR_MCP_API_KEY>"
      }
    }
  }
}
```

**Option B — stdio proxy via npx (fallback)**

For clients that only support `command`-based (stdio) MCP servers. Requires Node.js 22+. The `@cantax-fyi/tax-mcp` package acts as a local stdio↔HTTP proxy that forwards requests to the same Cloud Run server.

Pass the key via `--apiKey` flag or `CANTAX_API_KEY` environment variable (recommended — keeps the key out of config files):

```json
{
  "mcpServers": {
    "cantax-fyi": {
      "command": "npx",
      "args": ["@cantax-fyi/tax-mcp"],
      "env": {
        "CANTAX_API_KEY": "<YOUR_MCP_API_KEY>"
      }
    }
  }
}
```

Or with the flag directly:

```json
{
  "mcpServers": {
    "cantax-fyi": {
      "command": "npx",
      "args": ["@cantax-fyi/tax-mcp", "--apiKey", "<YOUR_MCP_API_KEY>"]
    }
  }
}
```

> **Note:** If Claude Desktop picks up an older Node.js version, use `"command": "/bin/bash"` with `"args": ["-lc", "npx @cantax-fyi/tax-mcp"]` so your shell profile (and nvm) loads the correct version.

### 3. Restart your MCP client

Run `/mcp` in Claude Code — you should see `cantax-fyi` listed with 26 tools.

### Revoking a key

Settings → MCP API Keys → **Revoke** next to the key. The server immediately rejects that key.

## Usage Examples

Once connected, talk to Claude naturally:

```
Add a $1,200 USD Stripe income entry for 2024-03-15, exchange rate 1.36

Import these expenses for tax year <id>:
- GCP hosting, $45.00 CAD, 2024-01-01
- Phone, $80.00 CAD, 2024-01-05

Show me a tax summary for 2024

List all PENDING receipts for tax year <id>
```

## Supported Enums

**Income source types:** `RENTAL` `INTERNET_BUSINESS` `STRIPE`

**Expense categories:** `EMAIL` `GCP` `NAMECHEAP` `PHONE` `INTERNET` `ADS` `HOSTING` `SOFTWARE` `OTHER`

**Rental expense categories:** `WATER` `PROPERTY_TAX` `INSURANCE` `MORTGAGE` `LAWYER` `RENOVATION` `HYDRO` `OTHER`

**Investment account types:** `RRSP` `TFSA`

**Receipt statuses:** `PENDING` `PROCESSING` `EXTRACTED` `VERIFIED` `FAILED`

**Currencies:** `CAD` `USD`
