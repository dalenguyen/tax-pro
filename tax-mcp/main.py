import hashlib
import json
import os
from datetime import datetime, timezone

import firebase_admin
import uvicorn
from firebase_admin import credentials, firestore
from mcp.server.fastmcp import FastMCP
from starlette.applications import Starlette
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route

# ---------------------------------------------------------------------------
# Firebase — ADC on Cloud Run, service account JSON locally via env var
# ---------------------------------------------------------------------------
if not firebase_admin._apps:
    sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
    if sa_json:
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()  # ADC (automatic on Cloud Run)

db = firestore.client()

# ---------------------------------------------------------------------------
# API key → userId resolution
# ---------------------------------------------------------------------------
def resolve_user_id(api_key: str) -> str:
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    doc = db.collection("apiKeys").document(key_hash).get()
    if not doc.exists:
        raise ValueError("Invalid or revoked API key")
    db.collection("apiKeys").document(key_hash).update(
        {"lastUsedAt": datetime.now(timezone.utc)}
    )
    return doc.to_dict()["userId"]

# ---------------------------------------------------------------------------
# MCP server — one per userId, cached
# ---------------------------------------------------------------------------
_mcp_cache: dict[str, FastMCP] = {}

def get_mcp(user_id: str) -> FastMCP:
    if user_id in _mcp_cache:
        return _mcp_cache[user_id]

    mcp = FastMCP("can-tax-pro")

    from tools.tax_years import register_tax_year_tools
    from tools.income import register_income_tools
    from tools.expenses import register_expense_tools
    from tools.investments import register_investment_tools
    from tools.rental import register_rental_tools
    from tools.receipts import register_receipt_tools
    from tools.reports import register_report_tools

    register_tax_year_tools(mcp, db, user_id)
    register_income_tools(mcp, db, user_id)
    register_expense_tools(mcp, db, user_id)
    register_investment_tools(mcp, db, user_id)
    register_rental_tools(mcp, db, user_id)
    register_receipt_tools(mcp, db, user_id)
    register_report_tools(mcp, db, user_id)

    _mcp_cache[user_id] = mcp
    return mcp

# ---------------------------------------------------------------------------
# Auth middleware — extracts X-API-Key, resolves userId
# ---------------------------------------------------------------------------
class ApiKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)
        api_key = request.headers.get("x-api-key")
        if not api_key:
            return JSONResponse({"error": "X-API-Key header required"}, status_code=401)
        try:
            request.state.user_id = resolve_user_id(api_key)
        except ValueError as e:
            return JSONResponse({"error": str(e)}, status_code=401)
        return await call_next(request)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
async def health(_: Request):
    return JSONResponse({"status": "ok"})

async def mcp_handler(request: Request):
    mcp = get_mcp(request.state.user_id)
    asgi = mcp.streamable_http_app()
    await asgi(request.scope, request._receive, request._send)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = Starlette(
    routes=[
        Route("/health", health),
        Mount("/mcp", app=mcp_handler),
    ]
)
app.add_middleware(ApiKeyMiddleware)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
