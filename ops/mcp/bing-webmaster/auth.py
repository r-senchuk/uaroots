"""Bing read-only OAuth support. Secrets are passed to Keychain over stdin only."""
import json
import pathlib
import re
import secrets
import socket
import subprocess
import time
import threading
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer

ROOT = pathlib.Path(__file__).resolve().parent
REDIRECT = 'http://uaroute-bing.localhost:8766/oauth/callback'
HOST = 'uaroute-bing.localhost:8766'
SCOPE = 'webmaster.read'
TOKEN_ENDPOINT = 'https://www.bing.com/webmasters/oauth/token'

class SafeError(Exception):
    pass

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None

OPENER = urllib.request.build_opener(NoRedirect())

def vault_raw(mode, data=None):
    result = subprocess.run(['/usr/bin/swift', str(ROOT / 'keychain.swift'), mode],
        input=json.dumps(data).encode() if data is not None else None,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
    if result.returncode:
        raise SafeError('CREDENTIAL_STORE_UNAVAILABLE')
    return json.loads(result.stdout) if mode == 'get' else None

def vault(mode, data=None):
    try:
        return vault_raw(mode, data)
    except (subprocess.SubprocessError, ValueError, OSError):
        raise SafeError('CREDENTIAL_STORE_UNAVAILABLE') from None

class BoundedServer(HTTPServer):
    allow_reuse_address = True
    connection = None
    def arm(self, seconds):
        self.expiry_timer = threading.Timer(seconds, self.expire)
        self.expiry_timer.daemon = True
        self.expiry_timer.start()
    def expire(self):
        if self.connection is not None:
            try:
                self.connection.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass
            self.connection.close()
        self.server_close()
    def close(self):
        self.expiry_timer.cancel()
        self.server_close()
    def handle_error(self, request, client_address):
        print('Local callback request failed; no request details logged.', flush=True)
    def get_request(self):
        connection, address = super().get_request()
        connection.settimeout(3)
        self.connection = connection
        return connection, address


def token_request(fields):
    request = urllib.request.Request(TOKEN_ENDPOINT,
        data=urllib.parse.urlencode(fields).encode(),
        headers={'Content-Type': 'application/x-www-form-urlencoded'})
    try:
        with OPENER.open(request, timeout=20) as response:
            data = json.loads(response.read(65537))
        if not isinstance(data, dict) or not isinstance(data.get('access_token'), str) or not data['access_token']:
            raise SafeError('INVALID_TOKEN_RESPONSE')
        if 'refresh_token' in data and (not isinstance(data['refresh_token'], str) or not data['refresh_token']):
            raise SafeError('INVALID_TOKEN_RESPONSE')
        if not isinstance(data.get('expires_in',3600), (int,str)) or not str(data.get('expires_in',3600)).isdigit() or not 60 <= int(data.get('expires_in',3600)) <= 86400:
            raise SafeError('INVALID_TOKEN_RESPONSE')
        if data.get('scope') and str(data['scope']).lower() not in (SCOPE.lower(), 'read'):
            raise SafeError('UNEXPECTED_GRANTED_SCOPE')
        return data
    except urllib.error.HTTPError as error:
        raise SafeError('AUTHENTICATION_FAILED' if error.code in (400, 401, 403) else 'TOKEN_SERVICE_FAILED') from None
    except (OSError, ValueError):
        raise SafeError('TOKEN_TRANSPORT_FAILED') from None

class Tokens:
    def __init__(self, store=vault, exchange=token_request):
        self.store, self.exchange = store, exchange
        self.lock = threading.Lock()
        self.access = None
        self.expiry = 0
    def get(self, force=False):
        with self.lock:
            return self._get(force)
    def _get(self, force=False):
        if self.access and not force and time.time() < self.expiry:
            return self.access
        saved = self.store('get')
        if saved.get('scope') != SCOPE:
            raise SafeError('READ_ONLY_GRANT_REQUIRED')
        data = self.exchange({'grant_type':'refresh_token', 'client_id':saved['client_id'],
            'client_secret':saved['client_secret'], 'refresh_token':saved['refresh_token']})
        self.store('set', {**saved, 'refresh_token':data.get('refresh_token', saved['refresh_token'])})
        self.access = data['access_token']
        self.expiry = time.time() + max(0, int(data.get('expires_in', 3600)) - 60)
        return self.access

class CallbackState:
    def __init__(self):
        self.state = secrets.token_urlsafe(32)
        self.deadline = time.monotonic() + 600
        self.used = False
    def validate(self, host, target):
        url = urllib.parse.urlsplit(target)
        values = urllib.parse.parse_qs(url.query)
        if host != HOST or url.path != '/oauth/callback' or url.scheme or url.netloc:
            raise SafeError('CALLBACK_TARGET_REJECTED')
        if self.used or time.monotonic() >= self.deadline:
            raise SafeError('CALLBACK_EXPIRED_OR_USED')
        if len(values.get('state', [])) != 1 or not secrets.compare_digest(values['state'][0], self.state):
            raise SafeError('CALLBACK_STATE_REJECTED')
        if len(values.get('code', [])) != 1 or values.get('error'):
            raise SafeError('AUTHORIZATION_DENIED')
        self.used = True
        return values['code'][0]

def serve_probe():
    """Loopback-only readiness probe; does not handle credentials or authorize anything."""
    class Probe(BaseHTTPRequestHandler):
        def log_message(self, *args): pass
        def do_GET(self):
            ok = self.headers.get('Host') == HOST and self.path == '/health'
            self.send_response(200 if ok else 400)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(b'UARoute local callback ready' if ok else b'Rejected')
    server = BoundedServer(('127.0.0.1', 8766), Probe)
    server.timeout = 1
    server.arm(120)
    end = time.monotonic() + 120
    print('Loopback probe ready; expires in 120 seconds.', flush=True)
    try:
        while time.monotonic() < end:
            server.handle_request()
    finally:
        server.close()


def authorize_server():
    state = CallbackState()
    setup_nonce = secrets.token_urlsafe(32)
    complete = False
    try:
        stored = vault('get')
        credentials = {'client_id':stored['client_id'], 'client_secret':stored['client_secret']}
    except (SafeError, KeyError, TypeError):
        credentials = None
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args): pass
        def respond(self, status, body):
            self.send_response(status)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Referrer-Policy', 'same-origin')
            self.send_header('Content-Security-Policy', "default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'")
            self.end_headers()
            self.wfile.write(body.encode())
        def do_GET(self):
            nonlocal complete
            if self.headers.get('Host') != HOST:
                return self.respond(400, 'Rejected Host')
            if self.path == '/health':
                return self.respond(200, 'UARoute local callback ready')
            if self.path == '/setup':
                return self.respond(200, f'<h1>UARoute Bing MCP secure setup</h1><form method="post" action="/setup"><input type="hidden" name="nonce" value="{setup_nonce}"><label>Client ID<input name="client_id" autocomplete="off"></label><label>Client secret<input type="password" name="client_secret" autocomplete="off"></label><button>Store in Keychain</button></form>')
            if self.path == '/authorize' and credentials:
                query = urllib.parse.urlencode({'client_id':credentials['client_id'], 'response_type':'code', 'redirect_uri':REDIRECT, 'scope':SCOPE, 'state':state.state})
                self.send_response(302)
                self.send_header('Location', 'https://www.bing.com/webmasters/oauth/authorize?' + query)
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                return
            try:
                code = state.validate(self.headers.get('Host'), self.path)
                if not credentials:
                    raise SafeError('CLIENT_NOT_CONFIGURED')
                data = token_request({'grant_type':'authorization_code', 'client_id':credentials['client_id'], 'client_secret':credentials['client_secret'], 'redirect_uri':REDIRECT, 'code':code})
                if not isinstance(data.get('refresh_token'), str) or not data['refresh_token']:
                    raise SafeError('INVALID_TOKEN_RESPONSE')
                vault('set', {**credentials, 'scope':SCOPE, 'refresh_token':data['refresh_token']})
                complete = True
                self.respond(200, '<h1>UARoute read-only authorization saved</h1><p>You may close this tab. No code or token is displayed.</p>')
                print('Read-only authorization stored in Keychain.', flush=True)
            except SafeError as error:
                print('OAuth callback result: ' + str(error), flush=True)
                self.respond(400, 'Authorization failed validation. No credentials are displayed; restart setup after resolving the issue.')
        def do_POST(self):
            nonlocal credentials
            if self.headers.get('Host') != HOST or self.path != '/setup' or credentials is not None:
                return self.respond(400, 'Setup rejected')
            if self.headers.get('Origin') not in (None, 'http://' + HOST):
                return self.respond(400, 'Origin rejected')
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size < 8192:
                    return self.respond(400, 'Size rejected')
                values = urllib.parse.parse_qs(self.rfile.read(size).decode())
                if values.get('nonce') != [setup_nonce]:
                    return self.respond(400, 'State rejected')
                client_id, secret = values['client_id'][0], values['client_secret'][0]
                if not client_id or not secret or len(client_id) > 200 or len(secret) > 1000:
                    return self.respond(400, 'Invalid client')
                credentials = {'client_id':client_id, 'client_secret':secret}
                vault('set', {**credentials, 'scope':'pending'})
                self.respond(200, '<h1>Client stored in Keychain</h1><p>Next: authorize Webmaster.read only.</p><a href="/authorize">Open Microsoft read-only consent</a>')
                print('Client stored; awaiting read-only consent.', flush=True)
            except (SafeError, ValueError, KeyError):
                credentials = None
                self.respond(400, 'Secure setup failed. No credential details are logged.')
    server = BoundedServer(('127.0.0.1', 8766), Handler)
    server.timeout = 1
    server.arm(600)
    print('Secure local setup ready; expires in 10 minutes.', flush=True)
    try:
        while not complete and time.monotonic() < state.deadline:
            server.handle_request()
    finally:
        server.close()

if __name__ == '__main__':
    import sys
    if sys.argv[1:] == ['probe']:
        serve_probe()
    elif sys.argv[1:] == ['setup']:
        authorize_server()
    else:
        raise SystemExit('Use probe or setup')
