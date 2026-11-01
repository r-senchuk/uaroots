"""Fresh-process MCP initialization, tool discovery and read-only smoke verification."""
import asyncio
import json
import pathlib
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def verify():
    script=pathlib.Path(__file__).with_name('server.py').resolve()
    params=StdioServerParameters(command=sys.executable,args=[str(script)])
    async with stdio_client(params) as (read,write):
        async with ClientSession(read,write) as session:
            initialized=await session.initialize()
            catalog=await session.list_tools()
            names=[tool.name for tool in catalog.tools]
            expected={
                'get_user_sites', 'get_feeds', 'get_crawl_stats', 'get_crawl_issues',
                'get_rank_and_traffic_stats', 'get_query_stats', 'get_page_stats',
                'get_url_info', 'get_page_query_stats', 'get_keyword_stats',
                'get_url_traffic_info', 'get_query_traffic_stats', 'get_link_counts',
                'get_url_links', 'get_crawl_settings', 'get_url_submission_quota',
                'get_blocked_urls'
            }
            assert set(names)==expected and all(tool.annotations.readOnlyHint for tool in catalog.tools)
            results=[]
            smoke_calls = [
                ('get_user_sites', {}),
                ('get_feeds', {}),
                ('get_url_info', {'url': 'https://uaroute.com/'}),
                ('get_keyword_stats', {'q': 'lviv', 'country': 'ua', 'language': 'uk'}),
                ('get_crawl_settings', {}),
            ]
            for name, args in smoke_calls:
                result = await session.call_tool(name, args)
                assert not result.isError
                data = result.structuredContent or json.loads(result.content[0].text)
                assert data['status'] != 'REQUEST_FAILED', data.get('error')
                results.append({'tool': name, 'status': data['status'], 'row_count': data.get('row_count')})
            return {'server': initialized.serverInfo.name, 'tool_count': len(names), 'tools': sorted(names), 'results': results}

if __name__=='__main__':
    result=asyncio.run(verify())
    destination=pathlib.Path('output/bing-mcp-2026-11-01/mcp-client-verification.json')
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'server':result['server'],'tool_count':result['tool_count'],'statuses':[r['status'] for r in result['results']]}))
