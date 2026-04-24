import json
from datetime import datetime, timezone
from typing import Optional
from google.cloud.firestore import Client
from mcp.server.fastmcp import FastMCP


def _compute_amount_cad(amount: float, currency: str, exchange_rate: Optional[float]) -> float:
    if currency == "CAD":
        return amount
    if not exchange_rate:
        raise ValueError("exchangeRate required for non-CAD currency")
    return round(amount * exchange_rate, 2)


def _expense_col(db: Client, user_id: str, tax_year_id: str):
    return (
        db.collection("users").document(user_id)
        .collection("taxYears").document(tax_year_id)
        .collection("expenseEntries")
    )


def register_expense_tools(mcp: FastMCP, db: Client, user_id: str):

    @mcp.tool()
    def list_expenses(tax_year_id: str, category: Optional[str] = None) -> str:
        """List expense entries. category: EMAIL | GCP | NAMECHEAP | PHONE | INTERNET | ADS | HOSTING | SOFTWARE | OTHER"""
        q = _expense_col(db, user_id, tax_year_id).order_by("date", direction="DESCENDING")
        if category:
            q = q.where("category", "==", category)
        return json.dumps([{"id": d.id, **d.to_dict()} for d in q.stream()], default=str)

    @mcp.tool()
    def create_expense(
        tax_year_id: str,
        category: str,
        amount: float,
        date: str,
        currency: str = "CAD",
        exchange_rate: Optional[float] = None,
        vendor: Optional[str] = None,
        description: Optional[str] = None,
        payment_method: Optional[str] = None,
    ) -> str:
        """Create a single expense entry. date: YYYY-MM-DD. category: EMAIL | GCP | NAMECHEAP | PHONE | INTERNET | ADS | HOSTING | SOFTWARE | OTHER"""
        amount_cad = _compute_amount_cad(amount, currency, exchange_rate)
        now = datetime.now(timezone.utc)
        data = {
            "category": category,
            "amount": amount,
            "currency": currency,
            "exchangeRate": exchange_rate,
            "amountCad": amount_cad,
            "date": datetime.fromisoformat(date),
            "vendor": vendor,
            "description": description,
            "paymentMethod": payment_method,
            "createdAt": now,
            "updatedAt": now,
        }
        ref = _expense_col(db, user_id, tax_year_id).document()
        ref.set({k: v for k, v in data.items() if v is not None})
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)

    @mcp.tool()
    def delete_expense(tax_year_id: str, expense_id: str) -> str:
        """Delete a single expense entry by ID."""
        _expense_col(db, user_id, tax_year_id).document(expense_id).delete()
        return json.dumps({"deleted": expense_id})

    @mcp.tool()
    def bulk_import_expenses(tax_year_id: str, entries: str) -> str:
        """Batch-import multiple expense entries. entries: JSON string array, each item: {category, amount, date, currency?, exchangeRate?, vendor?, description?}"""
        parsed: list[dict] = json.loads(entries)
        col = _expense_col(db, user_id, tax_year_id)
        batch = db.batch()
        now = datetime.now(timezone.utc)
        for entry in parsed:
            currency = entry.get("currency", "CAD")
            amount_cad = _compute_amount_cad(entry["amount"], currency, entry.get("exchangeRate"))
            ref = col.document()
            batch.set(ref, {
                "category": entry["category"],
                "amount": entry["amount"],
                "currency": currency,
                "exchangeRate": entry.get("exchangeRate"),
                "amountCad": amount_cad,
                "date": datetime.fromisoformat(entry["date"]),
                "vendor": entry.get("vendor"),
                "description": entry.get("description"),
                "paymentMethod": entry.get("paymentMethod"),
                "createdAt": now,
                "updatedAt": now,
            })
        batch.commit()
        return json.dumps({"imported": len(parsed)})
