import io
import json
import time
import socket
import threading
from http.server import BaseHTTPRequestHandler
import unittest
import urllib.error
from unittest.mock import patch
import auth
import server

class Response(io.BytesIO):
    def __enter__(self): return self
    def __exit__(self,*args): self.close()
class Opener:
    def __init__(self, replies): self.replies=list(replies); self.calls=[]
    def open(self, request, timeout):
        self.calls.append(request)
        reply=self.replies.pop(0)
        if isinstance(reply,Exception): raise reply
        return Response(json.dumps(reply).encode())
class Token:
    def get(self,force=False): return 'SENSITIVE_TOKEN'
class Tests(unittest.TestCase):
    def test_domain_boundaries(self):
        self.assertEqual(server.validate_url('https://uaroute.com/cities/lviv/'),'https://uaroute.com/cities/lviv/')
        for url in ['https://other.com/','https://uaroute.com.evil/','http://uaroute.com/','https://user@uaroute.com/','https://uaroute.com:443/','https://uaroute.com:bad/','https://www.uaroute.com/','https://uaroute.com/?phone=123','https://uaroute.com/#secret','https://uaroute.com/\\x','https://uaroute.com/\nx']:
            with self.subTest(url=url), self.assertRaises(auth.SafeError): server.validate_url(url)
    def test_registered_canonical_mismatch_explicit_only(self):
        with self.assertRaises(auth.SafeError): server.validate_url('https://www.garnebo.com/', 'https://garnebo.com/')
        self.assertEqual(server.validate_url('https://www.garnebo.com/','https://garnebo.com/',('https://www.garnebo.com',)), 'https://www.garnebo.com/')
    def test_read_methods_only(self):
        for method in ['SubmitUrl','DeleteFeed','https://evil/','GetUserSites/../SubmitUrl']:
            with self.assertRaises(auth.SafeError): server.call_api(method,tokens=Token())
        with self.assertRaises(auth.SafeError): server.call_api('GetFeeds',{'siteUrl':'https://garnebo.com/'},tokens=Token())
        opener=Opener([{'d':[]}])
        server.call_api('GetFeeds',tokens=Token(),opener=opener)
        req=opener.calls[0]
        self.assertEqual(req.method,'GET')
        self.assertNotIn('SENSITIVE_TOKEN',req.full_url)
        self.assertEqual(req.get_header('Authorization'),'Bearer SENSITIVE_TOKEN')
    def test_redaction_and_retry_bounds(self):
        failure=urllib.error.HTTPError('https://secret.example/?token=SENSITIVE_TOKEN',403,'SENSITIVE_TOKEN',{},io.BytesIO(b'SENSITIVE_TOKEN'))
        opener=Opener([failure])
        with self.assertRaises(auth.SafeError) as result: server.call_api('GetFeeds',tokens=Token(),opener=opener)
        self.assertEqual(str(result.exception),'AUTHENTICATION_OR_PERMISSION_FAILED')
        self.assertEqual(len(opener.calls),1)
        opener=Opener([urllib.error.HTTPError('https://bing/',503,'oops',{},None),{'d':[]}])
        self.assertEqual(server.call_api('GetFeeds',tokens=Token(),opener=opener,pause=lambda _:None),[])
        self.assertEqual(len(opener.calls),2)
    def test_data_states_and_periods(self):
        self.assertEqual(server.envelope('GetQueryStats',[])['status'],'NO_ROWS')
        self.assertEqual(server.envelope('GetCrawlIssues',[])['status'],'EMPTY_ISSUE_LIST')
        self.assertEqual(server.envelope('GetQueryStats',[{'Clicks':0,'Impressions':0}])['status'],'EXPLICIT_ZERO_RECORDS')
        self.assertEqual(server.envelope('GetQueryStats',[{'Unknown':0}])['status'],'DATA_RETURNED')
        self.assertIsNone(server.envelope('GetQueryStats',[])['period']['start'])
        self.assertEqual(server.envelope('GetQueryStats',[{'Date':'2026-10-30T00:00:00Z','Clicks':2}])['period']['start'],'2026-10-30T00:00:00Z')
    def test_callback_state(self):
        state=auth.CallbackState(); good='/oauth/callback?state='+state.state+'&code=private'
        for host,url in [('evil',good),(auth.HOST,good.replace('/oauth/callback','/else')),(auth.HOST,'/oauth/callback?state=wrong&code=private'),(auth.HOST,good+'&state=other')]:
            with self.assertRaises(auth.SafeError): state.validate(host,url)
        self.assertEqual(state.validate(auth.HOST,good),'private')
        with self.assertRaises(auth.SafeError):state.validate(auth.HOST,good)
        state=auth.CallbackState(); state.deadline=time.monotonic()-1
        with self.assertRaises(auth.SafeError):state.validate(auth.HOST,'/oauth/callback?state='+state.state+'&code=x')
    def test_refresh_cache_and_revocation(self):
        saved={'scope':auth.SCOPE,'client_id':'id','client_secret':'secret','refresh_token':'old'}
        calls=[]
        def store(mode,value=None):
            if mode=='get':return saved
            saved.update(value)
        def exchange(fields):calls.append(fields);return {'access_token':'access','refresh_token':'new','expires_in':3600}
        tokens=auth.Tokens(store,exchange)
        self.assertEqual(tokens.get(),'access');self.assertEqual(tokens.get(),'access')
        self.assertEqual(len(calls),1);self.assertEqual(saved['refresh_token'],'new')
        def revoked(fields):raise auth.SafeError('AUTHENTICATION_FAILED')
        with self.assertRaises(auth.SafeError):auth.Tokens(store,revoked).get()
    def test_token_response_and_redirect_safety(self):
        for data in [[],{}, {'access_token':'x','expires_in':-1},{'access_token':'x','scope':'Webmaster.manage'},{'access_token':'x','refresh_token':5}]:
            with patch.object(auth,'OPENER',Opener([data])), self.assertRaises(auth.SafeError):auth.token_request({'client_secret':'SENSITIVE'})
        self.assertIsNone(auth.NoRedirect().redirect_request(None,None,None,None,None,None))
    def test_absolute_callback_deadline(self):
        class Handler(BaseHTTPRequestHandler):
            def log_message(self,*args): pass
        listener=auth.BoundedServer(('127.0.0.1',0),Handler)
        listener.arm(0.3)
        client=socket.create_connection(listener.server_address)
        worker=threading.Thread(target=listener.handle_request,daemon=True)
        worker.start()
        client.sendall(b'GET /health HTTP/1.1\r\nHost: ')
        worker.join(1)
        self.assertFalse(worker.is_alive())
        client.close();listener.close()
    def test_partial_zero_is_not_zero(self):
        result=server.envelope('GetQueryStats',[{'Clicks':0},{'Clicks':None,'Impressions':None}])
        self.assertEqual(result['status'],'DATA_RETURNED')
    def test_read_scope_label_and_sanitized_api_errors(self):
        data={'access_token':'not-logged','refresh_token':'not-logged','expires_in':3600,'scope':'Read'}
        with patch.object(auth,'OPENER',Opener([data])):
            self.assertEqual(auth.token_request({'grant_type':'refresh_token'})['scope'],'Read')
        opener=Opener([{'d':{'ErrorCode':403,'ErrorMessage':'SENSITIVE_TOKEN'}}])
        with self.assertRaises(auth.SafeError) as result:
            server.call_api('GetFeeds',tokens=Token(),opener=opener)
        self.assertEqual(str(result.exception),'API_REPORTED_ERROR')
        result=server.report('GetUrlInfo','https://private:secret@uaroute.com/')
        self.assertIsNone(result['requested_url'])
        self.assertNotIn('secret',json.dumps(result))
    def test_tool_surface(self):
        import asyncio
        tools=asyncio.run(server.mcp.list_tools())
        self.assertEqual(len(tools),17)
        self.assertTrue(all(t.annotations.readOnlyHint for t in tools))
        self.assertFalse(any(t.annotations.destructiveHint for t in tools))
        self.assertFalse(any(t.name.startswith(('submit_', 'delete_', 'update_', 'set_')) for t in tools))

    def test_normalization_helpers(self):
        self.assertEqual(server.normalize_bing_country('DE '), 'de')
        self.assertEqual(server.normalize_bing_country('UA'), 'ua')
        self.assertEqual(server.normalize_bing_country(''), '')
        self.assertEqual(server.normalize_bing_language('uk'), 'uk-UA')
        self.assertEqual(server.normalize_bing_language('de'), 'de-DE')
        self.assertEqual(server.normalize_bing_language('pl'), 'pl-PL')
        self.assertEqual(server.normalize_bing_language('en'), 'en-US')
        self.assertEqual(server.normalize_bing_language('uk-ua'), 'uk-UA')
        self.assertEqual(server.normalize_bing_language('uk_ua'), 'uk-UA')
        self.assertEqual(server.normalize_bing_language(''), '')

    def test_new_read_tool_validations(self):
        # Empty keyword stats query
        res = server.get_keyword_stats('')
        self.assertEqual(res['status'], 'REQUEST_FAILED')
        self.assertEqual(res['error']['code'], 'QUERY_REQUIRED')

        # Empty query traffic stats query
        res = server.get_query_traffic_stats('   ')
        self.assertEqual(res['status'], 'REQUEST_FAILED')
        self.assertEqual(res['error']['code'], 'QUERY_REQUIRED')

        # Negative page index for link counts
        res = server.get_link_counts(-1)
        self.assertEqual(res['status'], 'REQUEST_FAILED')
        self.assertEqual(res['error']['code'], 'INVALID_PAGE')

        # Negative page index for url links
        res = server.get_url_links('https://uaroute.com/about/', -2)
        self.assertEqual(res['status'], 'REQUEST_FAILED')
        self.assertEqual(res['error']['code'], 'INVALID_PAGE')

        # URL outside origin for url traffic info
        with self.assertRaises(auth.SafeError):
            server.get_url_traffic_info('https://external.example.com/')

if __name__=='__main__':unittest.main()
