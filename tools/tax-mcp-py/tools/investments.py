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
