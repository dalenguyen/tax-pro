# @can-tax-pro/tax-mcp

MCP (Model Context Protocol) server for [Can Tax](https://cantax.fyi). Lets Claude Code and other MCP-compatible AI assistants read and write your Canadian tax data directly via natural language.

## Tools (18 total)

### Tax Years
| Tool | Description |
|------|-------------|
| `list_tax_years` | List all tax years, newest first |
| `create_tax_year` | Create a new tax year (2000–2100) |

### Business Income
| Tool | Description |
|------|-------------|
| `list_income` | List income entries, optionally filter by `sourceType` (`RENTAL`, `INTERNET_BUSINESS`, `STRIPE`) |
| `create_income` | Add a single income entry |
| `bulk_import_income` | Batch-import multiple income entries |

### Business Expenses
| Tool | Description |
|------|-------------|
| `list_expenses` | List expense entries, optionally filter by `category` |
| `create_expense` | Add a single expense entry |
| `bulk_import_expenses` | Batch-import multiple expense entries |

### Investments
| Tool | Description |
|------|-------------|
| `list_investments` | List RRSP/TFSA contributions, optionally filter by `accountType` |
| `create_investment` | Record a new RRSP or TFSA contribution |

### Rental Properties
| Tool | Description |
|------|-------------|
| `list_rental_properties` | List all rental properties for a tax year |
| `create_rental_property` | Add a new rental property |
| `list_rental_income` | List income entries for a property |
| `add_rental_income` | Record rental income for a property |
| `list_rental_expenses` | List expenses for a property, optionally filter by `category` |
| `add_rental_expense` | Record a rental expense for a property |

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

- Node.js 22+
- pnpm (or npx once published)
- A Can Tax account at [cantax.fyi](https://cantax.fyi)

## Setup

### 1. Generate an API key

Log in → **Settings → MCP API Keys → Generate key**. Copy the key — it's shown only once.

### 2. Configure Claude Code

Add or update `.mcp.json` at your project root:

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

### 3. Restart Claude Code

Run `/mcp` — you should see `can-tax-pro` listed with 18 tools.

### Revoking a key

Settings → MCP API Keys → **Revoke** next to the key. The MCP server will immediately return an error for that key.

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

## Data Model

All data is scoped per user in Firestore:

```
users/{userId}/
  taxYears/{taxYearId}/
    incomeEntries/
    expenseEntries/
    investments/
    receipts/
    rentalProperties/{propertyId}/
      rentalIncomes/
      rentalExpenses/
```

## Supported Enums

**Income source types:** `RENTAL` `INTERNET_BUSINESS` `STRIPE`

**Expense categories:** `EMAIL` `GCP` `NAMECHEAP` `PHONE` `INTERNET` `ADS` `HOSTING` `OTHER`

**Rental expense categories:** `WATER` `PROPERTY_TAX` `INSURANCE` `MORTGAGE` `LAWYER` `RENOVATION` `HYDRO` `OTHER`

**Investment account types:** `RRSP` `TFSA`

**Receipt statuses:** `PENDING` `PROCESSING` `EXTRACTED` `VERIFIED` `FAILED`

**Currencies:** `CAD` `USD`
