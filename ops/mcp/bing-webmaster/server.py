"""UARoute-only read reporting over Bing's JSON REST API; no mutation tools."""
import datetime as dt
import json
import math
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from mcp.server.fastmcp import FastMCP
from auth import Tokens, SafeError, OPENER

SITE = 'https://uaroute.com/'
ORIGIN = 'https://uaroute.com'
METHODS = frozenset({
    'GetUserSites', 'GetFeeds', 'GetCrawlStats', 'GetCrawlIssues',
    'GetRankAndTrafficStats', 'GetQueryStats', 'GetPageStats', 'GetUrlInfo',
    'GetPageQueryStats', 'GetKeywordStats', 'GetUrlTrafficInfo',
    'GetQueryTrafficStats', 'GetLinkCounts', 'GetUrlLinks',
    'GetCrawlSettings', 'GetUrlSubmissionQuota', 'GetBlockedUrls'
})
API = 'https://www.bing.com/webmaster/api.svc/json/'
METRICS = ('Clicks', 'Impressions')
TOKENS = Tokens()
mcp = FastMCP('uaroute-bing-reporting')

DEFAULT_LANGUAGE_CULTURES = {
    'en': 'en-US',
    'nl': 'nl-NL',
    'de': 'de-DE',
    'pl': 'pl-PL',
    'uk': 'uk-UA',
    'ua': 'uk-UA',
    'fr': 'fr-FR',
    'it': 'it-IT',
    'es': 'es-ES',
    'pt': 'pt-PT',
    'da': 'da-DK',
    'sv': 'sv-SE',
    'no': 'nb-NO',
    'fi': 'fi-FI',
}


def normalize_bing_country(country: str = '') -> str:
    """Normalize country code for Bing API (strictly lowercase 2-letter codes, e.g. 'de', 'pl', 'ua')."""
    return (country or '').strip().lower()


def normalize_bing_language(language: str = '', country: str = '') -> str:
    """Normalize language to a valid BCP-47 culture tag (e.g. 'uk-UA', 'de-DE', 'en-US') for Bing API."""
    lang = (language or '').strip().replace('_', '-')
    if not lang:
        return ''
    if '-' in lang:
        parts = lang.split('-')
        if len(parts) == 2:
            return f'{parts[0].lower()}-{parts[1].upper()}'
        if len(parts) >= 3:
            return f'{parts[0].lower()}-{parts[1].capitalize()}-{parts[2].upper()}'
    low = lang.lower()
    if low in DEFAULT_LANGUAGE_CULTURES:
        return DEFAULT_LANGUAGE_CULTURES[low]
    clean_country = normalize_bing_country(country)
    if clean_country and len(clean_country) == 2:
        return f'{low}-{clean_country.upper()}'
    return lang


def validate_url(value, property_url=SITE, verified_origins=(ORIGIN,)):
    try:
        page, site = urllib.parse.urlsplit(value), urllib.parse.urlsplit(property_url)
        port = page.port
        if page.scheme != 'https' or page.username is not None or page.password is not None or port is not None or page.fragment or page.query:
            raise ValueError()
        origin = f'{page.scheme}://{page.netloc}'
        if origin not in verified_origins or site.scheme != 'https' or not page.hostname:
            raise ValueError()
        if any(ord(c) < 33 for c in value) or '\\' in value:
            raise ValueError()
        return value
    except ValueError:
        raise SafeError('URL_OUTSIDE_VERIFIED_ORIGIN') from None


def normalize(value):
    if isinstance(value, list): return [normalize(row) for row in value]
    if isinstance(value, dict):
        return {k: normalize(v) for k, v in value.items() if k != '__type'}
    if isinstance(value, str):
        match = re.fullmatch(r'/Date\((-?\d+)(?:[+-]\d{4})?\)/', value)
        if match:
            return dt.datetime.fromtimestamp(int(match[1])/1000, dt.timezone.utc).isoformat().replace('+00:00', 'Z')
    return value


def envelope(method, data, requested_url=None, status=None):
    rows = data if isinstance(data, list) else ([] if data is None else [data])
    metrics = [row[key] for row in rows if isinstance(row, dict) for key in METRICS
        if isinstance(row.get(key), (int, float)) and not isinstance(row.get(key), bool) and math.isfinite(row[key])]
    if status is None:
        status = ('EMPTY_ISSUE_LIST' if method == 'GetCrawlIssues' else 'NO_ROWS') if not rows else 'DATA_RETURNED'
        if rows and len(metrics) == len(rows)*len(METRICS) and all(value == 0 for value in metrics):
            status = 'EXPLICIT_ZERO_RECORDS'
    dates = sorted({str(row[key]) for row in rows if isinstance(row, dict) for key in ('Date', 'DateTime')
        if row.get(key) and re.match(r'^\d{4}-\d{2}-\d{2}', str(row[key]))})
    return {'status': status, 'site_url': SITE, 'requested_url': requested_url,
        'retrieved_at': dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00', 'Z'),
        'api_method': method, 'period': {'start': dates[0] if dates else None, 'end': dates[-1] if dates else None,
        'basis': 'returned dated records only; no local date filter'},
        'row_count': len(rows), 'pagination': {'supported': False, 'truncation': 'unknown upstream; no local row truncation'},
        'data': data, 'limits': 'Stored Bing data; not a fresh live crawl. Discovery is not proof of indexing.'}


def call_api(method, params=None, tokens=TOKENS, opener=OPENER, pause=time.sleep):
    if method not in METHODS: raise SafeError('UNSUPPORTED_READ_METHOD')
    params = dict(params or {})
    if params.get('siteUrl', SITE) != SITE: raise SafeError('PROPERTY_REJECTED')
    for key in ('url', 'link'):
        if key in params: validate_url(params[key])
    if 'page' in params and isinstance(params['page'], str) and params['page'].startswith('http'):
        validate_url(params['page'])
    if method not in ('GetUserSites', 'GetKeywordStats'): params['siteUrl'] = SITE
    url = API + method + '?' + urllib.parse.urlencode(params)
    bearer = tokens.get()
    for attempt in range(2):
        req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + bearer, 'Accept': 'application/json'}, method='GET')
        try:
            with opener.open(req, timeout=20) as response:
                raw = response.read(2*1024*1024+1)
                if len(raw) > 2*1024*1024: raise SafeError('RESPONSE_LIMIT_EXCEEDED')
                body = json.loads(raw)
            if not isinstance(body, dict) or 'd' not in body: raise SafeError('UNSUPPORTED_RESPONSE')
            if isinstance(body['d'], dict) and any(key in body['d'] for key in ('ErrorCode', 'ErrorMessage', 'ErrorDescription')):
                raise SafeError('API_REPORTED_ERROR')
            return normalize(body['d'])
        except urllib.error.HTTPError as error:
            if error.code == 401 and attempt == 0:
                bearer = tokens.get(force=True)
                continue
            if error.code in (429, 500, 502, 503, 504) and attempt == 0:
                pause(0.5); continue
            if error.code in (401, 403): raise SafeError('AUTHENTICATION_OR_PERMISSION_FAILED') from None
            raise SafeError('API_HTTP_' + str(error.code)) from None
        except (OSError, TimeoutError, urllib.error.URLError):
            if attempt == 0: pause(0.5); continue
            raise SafeError('TRANSPORT_FAILED') from None
        except (ValueError, TypeError): raise SafeError('INVALID_API_RESPONSE') from None


def report(method, params=None, requested_url=None):
    try:
        data = call_api(method, params)
        if method == 'GetUserSites':
            if not isinstance(data, list): raise SafeError('UNSUPPORTED_RESPONSE')
            data = [{key: site[key] for key in ('Url', 'IsVerified') if key in site} for site in data if site.get('Url') == SITE]
        return envelope(method, data, requested_url)
    except SafeError as error:
        result = envelope(method, None, requested_url, status='REQUEST_FAILED')
        result['error'] = {'code': str(error), 'details': 'No raw response, token or authenticated request URL is included.'}
        return result
    except Exception:
        result = envelope(method, None, requested_url, status='REQUEST_FAILED')
        result['error'] = {'code': 'INTERNAL_FAILURE', 'details': 'Sanitized failure; inspect local setup without exposing credentials.'}
        return result


# ==============================================================================
# Existing 9 Read-Only Inspection Tools
# ==============================================================================

@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_user_sites() -> dict:
    """Verify access to the exact UARoute property; other account properties are removed."""
    return report('GetUserSites')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_feeds() -> dict:
    """Read UARoute sitemap processing status and discovered URL counts, not indexed counts."""
    return report('GetFeeds')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_crawl_stats() -> dict:
    """Read available UARoute crawl/index history within Bing's returned reporting window."""
    return report('GetCrawlStats')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_crawl_issues() -> dict:
    """Read Bing's stored UARoute crawl issues; an empty list is distinct from missing traffic data."""
    return report('GetCrawlIssues')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_rank_and_traffic_stats() -> dict:
    """Read available UARoute daily clicks/impressions; missing dates are not zero days."""
    return report('GetRankAndTrafficStats')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_query_stats() -> dict:
    """Read available UARoute query performance; return the actual dated records Bing provides."""
    return report('GetQueryStats')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_page_stats() -> dict:
    """Read available UARoute landing-page performance."""
    return report('GetPageStats')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_url_info(url: str) -> dict:
    """Read stored Bing URL information for a canonical UARoute page, not a fresh live inspection."""
    validate_url(url)
    return report('GetUrlInfo', {'url': url}, requested_url=url)


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_page_query_stats(page_url: str) -> dict:
    """Read available Bing search queries for one canonical UARoute page."""
    validate_url(page_url)
    return report('GetPageQueryStats', {'page': page_url}, requested_url=page_url)


# ==============================================================================
# Additional 8 Read-Only Inspection Tools
# ==============================================================================

@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_keyword_stats(q: str, country: str = '', language: str = '') -> dict:
    """Retrieve historical weekly search impression volume on Bing for a specific keyword query.

    Useful for route and passenger search demand research (e.g. 'автобус львів ганновер', 'bus lviv').
    Automatically normalizes 2-letter country codes (lowercased) and language tags (to BCP-47 culture).

    Args:
        q: The search keyword or phrase (e.g. 'автобус львів ганновер').
        country: ISO-3166 2-letter country code (e.g. 'de', 'pl', 'ua', or empty for worldwide).
        language: Language code or culture tag (e.g. 'uk', 'de', 'pl', 'en-US'; auto-normalizes to BCP-47).
    """
    clean_q = (q or '').strip()
    if not clean_q:
        result = envelope('GetKeywordStats', None, status='REQUEST_FAILED')
        result['error'] = {'code': 'QUERY_REQUIRED', 'details': "Parameter 'q' must not be empty."}
        return result

    c_norm = normalize_bing_country(country)
    l_norm = normalize_bing_language(language, country)
    params = {'q': clean_q}
    if c_norm:
        params['country'] = c_norm
    if l_norm:
        params['language'] = l_norm

    res = report('GetKeywordStats', params)
    res['query'] = clean_q
    res['country'] = c_norm
    res['language'] = l_norm
    return res


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_url_traffic_info(url: str) -> dict:
    """Get aggregate search performance metrics (clicks and impressions) for a specific canonical page URL.

    Args:
        url: Absolute canonical page URL on UARoute to inspect (e.g. 'https://uaroute.com/routes/lviv-hannover/').
    """
    validate_url(url)
    return report('GetUrlTrafficInfo', {'url': url}, requested_url=url)


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_query_traffic_stats(query: str) -> dict:
    """Retrieve historical performance timeseries for a specific search query on UARoute.

    Args:
        query: Search term query to inspect (e.g. 'uaroute').
    """
    clean_q = (query or '').strip()
    if not clean_q:
        result = envelope('GetQueryTrafficStats', None, status='REQUEST_FAILED')
        result['error'] = {'code': 'QUERY_REQUIRED', 'details': "Parameter 'query' must not be empty."}
        return result
    res = report('GetQueryTrafficStats', {'query': clean_q})
    res['query'] = clean_q
    return res


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_link_counts(page: int = 0) -> dict:
    """Retrieve inbound backlink counts and discovered referring source domains for UARoute.

    Args:
        page: Zero-based page offset for pagination (default: 0).
    """
    if page < 0:
        result = envelope('GetLinkCounts', None, status='REQUEST_FAILED')
        result['error'] = {'code': 'INVALID_PAGE', 'details': f'Page index must be >= 0 (got {page}).'}
        return result
    return report('GetLinkCounts', {'page': page})


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_url_links(link: str, page: int = 0) -> dict:
    """Retrieve detailed inbound backlinks, source URLs, and anchor texts pointing to a specific canonical page.

    Args:
        link: Absolute canonical target URL on UARoute to inspect.
        page: Zero-based page offset for pagination (default: 0).
    """
    validate_url(link)
    if page < 0:
        result = envelope('GetUrlLinks', None, requested_url=link, status='REQUEST_FAILED')
        result['error'] = {'code': 'INVALID_PAGE', 'details': f'Page index must be >= 0 (got {page}).'}
        return result
    return report('GetUrlLinks', {'link': link, 'page': page}, requested_url=link)


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_crawl_settings() -> dict:
    """Retrieve Bingbot crawl settings, 24-hour crawl rate distribution, and crawl boost status for UARoute."""
    return report('GetCrawlSettings')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_url_submission_quota() -> dict:
    """Get the daily and monthly remaining quota for submitting URLs to Bing Webmaster Tools."""
    return report('GetUrlSubmissionQuota')


@mcp.tool(annotations={'readOnlyHint': True, 'destructiveHint': False})
def get_blocked_urls() -> dict:
    """Retrieve URLs and directories blocked from search results in Bing Webmaster Tools for UARoute."""
    return report('GetBlockedUrls')


if __name__ == '__main__':
    mcp.run()
