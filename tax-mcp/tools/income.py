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


def _income_col(db: Client, user_id: str, tax_year_id: str):
    return (
        db.collection("users").document(user_id)
        .collection("taxYears").document(tax_year_id)
        .collection("incomeEntries")
    )


def register_income_tools(mcp: FastMCP, db: Client, user_id: str):

    @mcp.tool()
    def list_income(tax_year_id: str, source_type: Optional[str] = None) -> str:
        """List income entries for a tax year. source_type: RENTAL | INTERNET_BUSINESS | STRIPE"""
        q = _income_col(db, user_id, tax_year_id).order_by("date", direction="DESCENDING")
        if source_type:
            q = q.where("sourceType", "==", source_type)
        return json.dumps([{"id": d.id, **d.to_dict()} for d in q.stream()], default=str)

    @mcp.tool()
    def create_income(
        tax_year_id: str,
        source_type: str,
        amount: float,
        date: str,
        currency: str = "CAD",
        exchange_rate: Optional[float] = None,
        description: Optional[str] = None,
        category: Optional[str] = None,
    ) -> str:
        """Create a single income entry. date: YYYY-MM-DD. source_type: RENTAL | INTERNET_BUSINESS | STRIPE"""
        amount_cad = _compute_amount_cad(amount, currency, exchange_rate)
        now = datetime.now(timezone.utc)
        data = {
            "sourceType": source_type,
            "amount": amount,
            "currency": currency,
            "exchangeRate": exchange_rate,
            "amountCad": amount_cad,
            "date": datetime.fromisoformat(date),
            "description": description,
            "category": category,
            "createdAt": now,
            "updatedAt": now,
        }
        ref = _income_col(db, user_id, tax_year_id).document()
        ref.set({k: v for k, v in data.items() if v is not None})
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)

    @mcp.tool()
    def delete_income(tax_year_id: str, income_id: str) -> str:
        """Delete a single income entry by ID."""
        _income_col(db, user_id, tax_year_id).document(income_id).delete()
        return json.dumps({"deleted": income_id})

    @mcp.tool()
    def bulk_import_income(tax_year_id: str, entries: list[dict]) -> str:
        """Batch-import multiple income entries. Each entry: {sourceType, amount, date, currency?, exchangeRate?, description?}"""
        col = _income_col(db, user_id, tax_year_id)
        batch = db.batch()
        now = datetime.now(timezone.utc)
        for entry in entries:
            currency = entry.get("currency", "CAD")
            amount_cad = _compute_amount_cad(entry["amount"], currency, entry.get("exchangeRate"))
            ref = col.document()
            batch.set(ref, {
                "sourceType": entry["sourceType"],
                "amount": entry["amount"],
                "currency": currency,
                "exchangeRate": entry.get("exchangeRate"),
                "amountCad": amount_cad,
                "date": datetime.fromisoformat(entry["date"]),
                "description": entry.get("description"),
                "category": entry.get("category"),
                "createdAt": now,
                "updatedAt": now,
            })
        batch.commit()
        return json.dumps({"imported": len(entries)})
