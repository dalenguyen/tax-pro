import json
from datetime import datetime, timezone
from google.cloud.firestore import Client
from mcp.server.fastmcp import FastMCP


def register_tax_year_tools(mcp: FastMCP, db: Client, user_id: str):

    @mcp.tool()
    def list_tax_years() -> str:
        """List all tax years, newest first."""
        docs = (
            db.collection("users").document(user_id)
            .collection("taxYears")
            .order_by("year", direction="DESCENDING")
            .stream()
        )
        return json.dumps([{"id": d.id, **d.to_dict()} for d in docs], default=str)

    @mcp.tool()
    def create_tax_year(year: int, notes: str = "") -> str:
        """Create a new tax year (2000–2100). Fails if year already exists."""
        if not (2000 <= year <= 2100):
            raise ValueError("year must be between 2000 and 2100")
        col = db.collection("users").document(user_id).collection("taxYears")
        existing = list(col.where("year", "==", year).limit(1).stream())
        if existing:
            raise ValueError(f"Tax year {year} already exists")
        now = datetime.now(timezone.utc)
        ref = col.document()
        ref.set({"year": year, "notes": notes or None, "createdAt": now, "updatedAt": now})
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)

    @mcp.tool()
    def delete_tax_year(tax_year_id: str) -> str:
        """Delete a tax year and all its subcollections (income, expenses, investments, receipts, rental properties)."""
        year_ref = db.collection("users").document(user_id).collection("taxYears").document(tax_year_id)
        subcollections = ["incomeEntries", "expenseEntries", "investments", "receipts"]
        for sub in subcollections:
            for doc in year_ref.collection(sub).stream():
                doc.reference.delete()
        for prop in year_ref.collection("rentalProperties").stream():
            for inc in prop.reference.collection("rentalIncomes").stream():
                inc.reference.delete()
            for exp in prop.reference.collection("rentalExpenses").stream():
                exp.reference.delete()
            prop.reference.delete()
        year_ref.delete()
        return json.dumps({"deleted": tax_year_id})
