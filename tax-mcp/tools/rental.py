import json
from datetime import datetime, timezone
from typing import Optional
from google.cloud.firestore import Client
from mcp.server.fastmcp import FastMCP


def register_rental_tools(mcp: FastMCP, db: Client, user_id: str):

    def _props_col(tax_year_id: str):
        return (
            db.collection("users").document(user_id)
            .collection("taxYears").document(tax_year_id)
            .collection("rentalProperties")
        )

    def _incomes_col(tax_year_id: str, property_id: str):
        return _props_col(tax_year_id).document(property_id).collection("rentalIncomes")

    def _expenses_col(tax_year_id: str, property_id: str):
        return _props_col(tax_year_id).document(property_id).collection("rentalExpenses")

    @mcp.tool()
    def list_rental_properties(tax_year_id: str) -> str:
        """List all rental properties for a tax year."""
        docs = _props_col(tax_year_id).stream()
        return json.dumps([{"id": d.id, **d.to_dict()} for d in docs], default=str)

    @mcp.tool()
    def create_rental_property(tax_year_id: str, address: str) -> str:
        """Add a new rental property for a tax year."""
        now = datetime.now(timezone.utc)
        ref = _props_col(tax_year_id).document()
        ref.set({"address": address, "createdAt": now, "updatedAt": now})
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)

    @mcp.tool()
    def list_rental_income(tax_year_id: str, property_id: str) -> str:
        """List all rental income entries for a property."""
        docs = _incomes_col(tax_year_id, property_id).order_by("date", direction="DESCENDING").stream()
        return json.dumps([{"id": d.id, **d.to_dict()} for d in docs], default=str)

    @mcp.tool()
    def add_rental_income(
        tax_year_id: str,
        property_id: str,
        amount: float,
        date: str,
        description: Optional[str] = None,
    ) -> str:
        """Record rental income for a property. date: YYYY-MM-DD"""
        now = datetime.now(timezone.utc)
        data = {
            "amount": amount,
            "date": datetime.fromisoformat(date),
            "description": description,
            "createdAt": now,
            "updatedAt": now,
        }
        ref = _incomes_col(tax_year_id, property_id).document()
        ref.set({k: v for k, v in data.items() if v is not None})
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)

    @mcp.tool()
    def list_rental_expenses(tax_year_id: str, property_id: str, category: Optional[str] = None) -> str:
        """List rental expenses for a property. category: WATER | PROPERTY_TAX | INSURANCE | MORTGAGE | LAWYER | RENOVATION | HYDRO | OTHER"""
        q = _expenses_col(tax_year_id, property_id).order_by("date", direction="DESCENDING")
        if category:
            q = q.where("category", "==", category)
        return json.dumps([{"id": d.id, **d.to_dict()} for d in q.stream()], default=str)

    @mcp.tool()
    def delete_rental_property(tax_year_id: str, property_id: str) -> str:
        """Delete a rental property and all its income/expense subcollections."""
        prop_ref = _props_col(tax_year_id).document(property_id)
        for inc in _incomes_col(tax_year_id, property_id).stream():
            inc.reference.delete()
        for exp in _expenses_col(tax_year_id, property_id).stream():
            exp.reference.delete()
        prop_ref.delete()
        return json.dumps({"deleted": property_id})

    @mcp.tool()
    def delete_rental_income(tax_year_id: str, property_id: str, income_id: str) -> str:
        """Delete a single rental income entry."""
        _incomes_col(tax_year_id, property_id).document(income_id).delete()
        return json.dumps({"deleted": income_id})

    @mcp.tool()
    def update_rental_income(
        tax_year_id: str,
        property_id: str,
        income_id: str,
        amount: Optional[float] = None,
        date: Optional[str] = None,
        description: Optional[str] = None,
    ) -> str:
        """Update fields on a rental income entry. Only provided fields are changed. Pass empty string to clear description."""
        ref = _incomes_col(tax_year_id, property_id).document(income_id)
        update_data: dict = {"updatedAt": datetime.now(timezone.utc)}
        if amount is not None:
            update_data["amount"] = amount
        if date is not None:
            update_data["date"] = datetime.fromisoformat(date)
        if description is not None:
            update_data["description"] = description or None
        ref.update(update_data)
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)

    @mcp.tool()
    def delete_rental_expense(tax_year_id: str, property_id: str, expense_id: str) -> str:
        """Delete a single rental expense entry."""
        _expenses_col(tax_year_id, property_id).document(expense_id).delete()
        return json.dumps({"deleted": expense_id})

    @mcp.tool()
    def update_rental_expense(
        tax_year_id: str,
        property_id: str,
        expense_id: str,
        category: Optional[str] = None,
        amount: Optional[float] = None,
        date: Optional[str] = None,
        description: Optional[str] = None,
    ) -> str:
        """Update fields on a rental expense entry. Only provided fields are changed. Pass empty string to clear description.
        category: WATER | PROPERTY_TAX | INSURANCE | MORTGAGE | LAWYER | RENOVATION | HYDRO | GAS | INTERNET | OTHER"""
        ref = _expenses_col(tax_year_id, property_id).document(expense_id)
        update_data: dict = {"updatedAt": datetime.now(timezone.utc)}
        if category is not None:
            update_data["category"] = category
        if amount is not None:
            update_data["amount"] = amount
        if date is not None:
            update_data["date"] = datetime.fromisoformat(date)
        if description is not None:
            update_data["description"] = description or None
        ref.update(update_data)
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)

    @mcp.tool()
    def add_rental_expense(
        tax_year_id: str,
        property_id: str,
        category: str,
        amount: float,
        date: str,
        description: Optional[str] = None,
    ) -> str:
        """Record a rental expense for a property. date: YYYY-MM-DD. category: WATER | PROPERTY_TAX | INSURANCE | MORTGAGE | LAWYER | RENOVATION | HYDRO | OTHER"""
        now = datetime.now(timezone.utc)
        data = {
            "category": category,
            "amount": amount,
            "date": datetime.fromisoformat(date),
            "description": description,
            "createdAt": now,
            "updatedAt": now,
        }
        ref = _expenses_col(tax_year_id, property_id).document()
        ref.set({k: v for k, v in data.items() if v is not None})
        doc = ref.get()
        return json.dumps({"id": doc.id, **doc.to_dict()}, default=str)
