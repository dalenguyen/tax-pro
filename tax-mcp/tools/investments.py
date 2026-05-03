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


def register_investment_tools(mcp: FastMCP, db: Client, user_id: str):

    def _col(tax_year_id: str):
        return (
            db.collection("users").document(user_id)
            .collection("taxYears").document(tax_year_id)
            .collection("investments")
        )

    @mcp.tool()
    def list_investments(tax_year_id: str, account_type: Optional[str] = None) -> str:
        """List RRSP/TFSA contributions. account_type: RRSP | TFSA"""
        q = _col(tax_year_id).order_by("date", direction="DESCENDING")
        if account_type:
            q = q.where("accountType", "==", account_type)
        return json.dumps([{"id": d.id, **d.to_dict()} for d in q.stream()], default=str)

    @mcp.tool()
    def create_investment(
        tax_year_id: str,
        account_type: str,
        amount: float,
        date: str,
        currency: str = "CAD",
        exchange_rate: Optional[float] = None,
        institution: Optional[str] = None,
        room_remaining: Optional[float] = None,
        notes: Optional[str] = None,
    ) -> str:
        """Record a new RRSP or TFSA contribution. account_type: RRSP | TFSA. date: YYYY-MM-DD"""
        amount_cad = _compute_amount_cad(amount, currency, exchange_rate)
        now = datetime.now(timezone.utc)
        data = {
            "accountType": account_type,
            "amount": amount,
            "currency": currency,
            "exchangeRate": exchange_rate,
            "amountCad": amount_cad,
            "date": datetime.fromisoformat(date),
            "institution": institution,
            "roomRemaining": room_remaining,
            "notes": notes,
            "createdAt": now,
            "updatedAt": now,
        }
        ref = _col(tax_year_id).document()
        ref.set({k: v for k, v in data.items() if v is not None})
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)

    @mcp.tool()
    def delete_investment(tax_year_id: str, investment_id: str) -> str:
        """Delete a single investment contribution by ID."""
        _col(tax_year_id).document(investment_id).delete()
        return json.dumps({"deleted": investment_id})

    @mcp.tool()
    def update_investment(
        tax_year_id: str,
        investment_id: str,
        account_type: Optional[str] = None,
        amount: Optional[float] = None,
        date: Optional[str] = None,
        currency: Optional[str] = None,
        exchange_rate: Optional[float] = None,
        institution: Optional[str] = None,
        room_remaining: Optional[float] = None,
        notes: Optional[str] = None,
    ) -> str:
        """Update fields on an investment contribution. Only provided fields are changed. Pass empty string to clear optional fields.
        account_type: RRSP | TFSA"""
        ref = _col(tax_year_id).document(investment_id)
        existing = ref.get().to_dict() or {}
        update_data: dict = {"updatedAt": datetime.now(timezone.utc)}
        if account_type is not None:
            update_data["accountType"] = account_type
        if date is not None:
            update_data["date"] = datetime.fromisoformat(date)
        if institution is not None:
            update_data["institution"] = institution or None
        if notes is not None:
            update_data["notes"] = notes or None
        if room_remaining is not None:
            update_data["roomRemaining"] = room_remaining
        if amount is not None or currency is not None or exchange_rate is not None:
            eff_amount = amount if amount is not None else existing.get("amount", 0)
            eff_currency = currency if currency is not None else existing.get("currency", "CAD")
            eff_rate = exchange_rate if exchange_rate is not None else existing.get("exchangeRate")
            update_data["amount"] = eff_amount
            update_data["currency"] = eff_currency
            update_data["exchangeRate"] = eff_rate
            update_data["amountCad"] = _compute_amount_cad(eff_amount, eff_currency, eff_rate)
        ref.update(update_data)
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)
