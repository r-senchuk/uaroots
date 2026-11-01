"""Fresh-process MCP initialization, tool discovery, and read-only smoke verification for uaroute-search-console."""
import asyncio
import json
import pathlib
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def verify():
    script = pathlib.Path(__file__).with_name('server.py').resolve()
    params = StdioServerParameters(command=sys.executable, args=[str(script)])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            initialized = await session.initialize()
            catalog = await session.list_tools()
            names = [tool.name for tool in catalog.tools]
            expected = {'get_property', 'list_sitemaps', 'inspect_url', 'query_search_analytics', 'query_pages'}
            assert set(names) == expected and all(tool.annotations.readOnlyHint for tool in catalog.tools)
            results = []
            smoke_calls = [
                ('get_property', {}),
                ('list_sitemaps', {}),
                ('inspect_url', {'url': 'https://uaroute.com/routes/lviv-hannover/'}),
                ('query_pages', {'start_date': '2026-10-01', 'end_date': '2026-10-31'}),
            ]
            for name, args in smoke_calls:
                result = await session.call_tool(name, args)
                assert not result.isError
                data = result.structuredContent or json.loads(result.content[0].text)
                assert data['status'] not in ('AUTH_REQUIRED', 'ISOLATION_BLOCKED', 'API_ERROR'), data.get('error')
                results.append({'tool': name, 'status': data['status'], 'row_count': data.get('row_count')})
            return {'server': initialized.serverInfo.name, 'tool_count': len(names), 'tools': sorted(names), 'results': results}

if __name__ == '__main__':
    result = asyncio.run(verify())
    destination = pathlib.Path('output/gsc-mcp-2026-11-01/mcp-client-verification.json')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'server': result['server'], 'tool_count': result['tool_count'], 'statuses': [r['status'] for r in result['results']]}))
