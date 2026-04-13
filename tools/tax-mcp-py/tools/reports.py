import json
from google.cloud.firestore import Client
from mcp.server.fastmcp import FastMCP


def _estimate_federal_tax(taxable_income: float) -> float:
    """2024 federal tax brackets (approximate)."""
    brackets = [
        (55867, 0.15),
        (55866, 0.205),
        (66083, 0.26),
        (79214, 0.29),
        (float("inf"), 0.33),
    ]
    tax = 0.0
    remaining = max(0, taxable_income)
    for limit, rate in brackets:
        chunk = min(remaining, limit)
        tax += chunk * rate
        remaining -= chunk
        if remaining <= 0:
            break
    return round(tax, 2)


def register_report_tools(mcp: FastMCP, db: Client, user_id: str):

    @mcp.tool()
    def get_tax_summary(tax_year_id: str) -> str:
        """Compute full tax summary: income, expenses, rental, investments, estimated federal tax."""
        user_ref = db.collection("users").document(user_id)
        tax_year_ref = user_ref.collection("taxYears").document(tax_year_id)

        tax_year_doc = tax_year_ref.get()
        if not tax_year_doc.exists:
            raise ValueError("Tax year not found")

        income_docs = list(tax_year_ref.collection("incomeEntries").stream())
        expense_docs = list(tax_year_ref.collection("expenseEntries").stream())
        props_docs = list(tax_year_ref.collection("rentalProperties").stream())
        invest_docs = list(tax_year_ref.collection("investments").stream())

        # Business income (INTERNET_BUSINESS + STRIPE only)
        total_business_income = sum(
            d.to_dict().get("amountCad") or d.to_dict().get("amount") or 0
            for d in income_docs
            if d.to_dict().get("sourceType") in ("INTERNET_BUSINESS", "STRIPE")
        )

        total_business_expenses = sum(
            d.to_dict().get("amountCad") or d.to_dict().get("amount") or 0
            for d in expense_docs
        )

        # Rental
        total_rental_income = 0.0
        total_rental_expenses = 0.0
        for prop in props_docs:
            for inc in tax_year_ref.collection("rentalProperties").document(prop.id).collection("rentalIncomes").stream():
                total_rental_income += inc.to_dict().get("amount") or 0
            for exp in tax_year_ref.collection("rentalProperties").document(prop.id).collection("rentalExpenses").stream():
                total_rental_expenses += exp.to_dict().get("amount") or 0

        # Investments
        rrsp = sum(
            d.to_dict().get("amountCad") or d.to_dict().get("amount") or 0
            for d in invest_docs if d.to_dict().get("accountType") == "RRSP"
        )
        tfsa = sum(
            d.to_dict().get("amountCad") or d.to_dict().get("amount") or 0
            for d in invest_docs if d.to_dict().get("accountType") == "TFSA"
        )

        total_income = total_business_income + total_rental_income
        total_deductions = total_business_expenses + rrsp
        taxable_income = total_income - total_deductions

        summary = {
            "taxYear": tax_year_doc.to_dict().get("year", 0),
            "totalBusinessIncome": total_business_income,
            "totalBusinessExpenses": total_business_expenses,
            "netBusinessIncome": total_business_income - total_business_expenses,
            "totalRentalIncome": total_rental_income,
            "totalRentalExpenses": total_rental_expenses,
            "netRentalIncome": total_rental_income - total_rental_expenses,
            "rrspContributions": rrsp,
            "tfsaContributions": tfsa,
            "totalIncome": total_income,
            "totalDeductions": total_deductions,
            "estimatedTax": _estimate_federal_tax(taxable_income),
        }
        return json.dumps(summary)
