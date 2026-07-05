# Windsor.ai MCP integration

This repo ships a project-scoped [Model Context Protocol](https://modelcontextprotocol.io)
server config for [Windsor.ai](https://windsor.ai) in [`.mcp.json`](../.mcp.json).
It lets MCP-compatible AI clients (Claude Code, Cursor, etc.) query live
marketing data — Meta Ads, Google Ads, TikTok Ads, GA4, HubSpot and 325+ other
sources — directly while working in this repository. Useful here for analyzing
patient-acquisition ad campaigns.

This is **developer/agent tooling only**. It does not run as part of the app and
adds no runtime dependency.

## Setup

1. Create a Windsor.ai account and connect at least one data source at
   <https://onboard.windsor.ai>.
2. Copy your API key from Windsor.ai settings (API Access section).
3. Add it to your local environment (never commit it — `.env*` is gitignored):

   ```bash
   cp .env.example .env
   # then edit .env and set WINDSOR_API_KEY=...
   ```

   Or export it in your shell before launching your MCP client:

   ```bash
   export WINDSOR_API_KEY="your-key-here"
   ```

4. Open the repo in your MCP client. It reads `.mcp.json` and exposes the
   `windsor` server. In Claude Code, approve the project MCP server when prompted
   and confirm with `/mcp`.

## Authentication

`.mcp.json` sends the key as `Authorization: Bearer ${WINDSOR_API_KEY}`, expanded
from your environment so no secret is stored in the repo.

Clients that support OAuth 2.0 can instead connect to `https://mcp.windsor.ai/`
with no header and complete a one-time browser login — drop the `headers` block
in that case.

## Available tools

Windsor's MCP exposes data-discovery and retrieval tools. Start with
`get_connectors` to list the data sources and account IDs you've connected, then
query metrics from there.

See the [Windsor MCP docs](https://windsor.ai/documentation/windsor-mcp/) for the
full tool reference.
