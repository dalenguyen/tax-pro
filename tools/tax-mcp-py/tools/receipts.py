import json
from typing import Optional
from google.cloud.firestore import Client
from mcp.server.fastmcp import FastMCP


def register_receipt_tools(mcp: FastMCP, db: Client, user_id: str):

    def _col(tax_year_id: str):
        return (
            db.collection("users").document(user_id)
            .collection("taxYears").document(tax_year_id)
            .collection("receipts")
        )

    @mcp.tool()
    def list_receipts(tax_year_id: str, status: Optional[str] = None) -> str:
        """List receipts. status: PENDING | PROCESSING | EXTRACTED | VERIFIED | FAILED"""
        q = _col(tax_year_id).order_by("createdAt", direction="DESCENDING")
        if status:
            q = q.where("status", "==", status)
        return json.dumps([{"id": d.id, **d.to_dict()} for d in q.stream()], default=str)

    @mcp.tool()
    def get_receipt(tax_year_id: str, receipt_id: str) -> str:
        """Get a single receipt by ID."""
        doc = _col(tax_year_id).document(receipt_id).get()
        if not doc.exists:
            raise ValueError(f"Receipt {receipt_id} not found")
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)
