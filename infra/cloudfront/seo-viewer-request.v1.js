/* UARoute CloudFront Functions viewer-request policy, version 1.
 * Generated from the reviewed static export with scripts/seo-http-generate.mjs.
 * Runtime: CloudFront Functions JavaScript runtime 2.0 (ES5-compatible plus rawQueryString()).
 */
var SEO_CANONICAL_HOST = 'uaroute.com';
var SEO_REDIRECTS = {
  '/contact': '/about/',
  '/contact/': '/about/',
  '/contacts': '/about/',
  '/contacts/': '/about/',
  '/carriers': '/routes/',
  '/carriers/': '/routes/',
  '/packages': '/about/',
  '/packages/': '/about/',
  '/gallery': '/',
  '/gallery/': '/',
  '/contact/index.html': '/about/',
  '/contacts/index.html': '/about/',
  '/carriers/index.html': '/routes/',
  '/packages/index.html': '/about/',
  '/gallery/index.html': '/'
};
var SEO_DOCUMENTS = {
  "/": "/index.html",
  "/routes/": "/routes/index.html",
  "/about/": "/about/index.html",
  "/imprint/": "/imprint/index.html",
  "/privacy/": "/privacy/index.html",
  "/routes/lviv-hannover/": "/routes/lviv-hannover/index.html",
  "/routes/lviv-celle/": "/routes/lviv-celle/index.html",
  "/routes/ivano-frankivsk-wolfsburg/": "/routes/ivano-frankivsk-wolfsburg/index.html",
  "/routes/dolyna-celle/": "/routes/dolyna-celle/index.html",
  "/routes/celle-dolyna/": "/routes/celle-dolyna/index.html",
  "/routes/dolyna-wolfsburg/": "/routes/dolyna-wolfsburg/index.html",
  "/routes/wolfsburg-dolyna/": "/routes/wolfsburg-dolyna/index.html",
  "/routes/dolyna-braunschweig/": "/routes/dolyna-braunschweig/index.html",
  "/routes/braunschweig-dolyna/": "/routes/braunschweig-dolyna/index.html",
  "/routes/celle-lviv/": "/routes/celle-lviv/index.html",
  "/routes/wolfsburg-ivano-frankivsk/": "/routes/wolfsburg-ivano-frankivsk/index.html",
  "/cities/lviv/": "/cities/lviv/index.html",
  "/cities/ivano-frankivsk/": "/cities/ivano-frankivsk/index.html",
  "/cities/celle/": "/cities/celle/index.html",
  "/routes/lviv-hamburg/": "/routes/lviv-hamburg/index.html",
  "/routes/lviv-berlin/": "/routes/lviv-berlin/index.html"
};
var SEO_MISSING_DOCUMENT_BODY = '<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Сторінку не знайдено | UARoute</title><meta name="robots" content="noindex,follow"></head><body><main><h1>Сторінку не знайдено</h1><p>Перевірте адресу або перегляньте напрямки між Україною та Німеччиною.</p><p><a href="/routes/">Переглянути напрямки</a></p></main></body></html>';

function seoQueryString(request) {
  var parts = [];
  var raw;
  var key;
  var entry;
  var values;
  var i;
  if (typeof request.rawQueryString === 'function') {
    raw = request.rawQueryString();
    // AWS synthetic events can expose an empty helper despite populated parsed query fields.
    if (raw || !request.querystring || Object.keys(request.querystring).length === 0) {
      return raw === undefined ? '' : '?' + raw;
    }
  }
  if (!request.querystring) return '';
  if (typeof request.querystring === 'string') return request.querystring ? '?' + request.querystring : '';
  for (key in request.querystring) {
    if (!Object.prototype.hasOwnProperty.call(request.querystring, key)) continue;
    entry = request.querystring[key];
    values = entry && entry.multiValue && entry.multiValue.length ? entry.multiValue : [entry || { value: '' }];
    for (i = 0; i < values.length; i += 1) {
      parts.push(key + '=' + (values[i].value || ''));
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

function seoRedirect(location) {
  return {
    statusCode: 308,
    statusDescription: 'Permanent Redirect',
    headers: {
      location: { value: location },
      'cache-control': { value: 'public, max-age=3600' }
    }
  };
}

function seoNotFound() {
  return {
    statusCode: 404,
    statusDescription: 'Not Found',
    headers: {
      'content-type': { value: 'text/html; charset=utf-8' },
      'cache-control': { value: 'no-store' },
      'x-robots-tag': { value: 'noindex, follow' }
    },
    body: SEO_MISSING_DOCUMENT_BODY
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- CloudFront invokes this named entry point.
function handler(event) {
  var request = event.request;
  var method = request.method;
  var uri = request.uri;
  var hostHeader = request.headers && request.headers.host;
  var host = hostHeader && hostHeader.value ? hostHeader.value.toLowerCase().replace(/:\d+$/, '') : '';
  var isKnownHost = host === SEO_CANONICAL_HOST || host === 'www.uaroute.com';
  var canHandleDocument = method === 'GET' || method === 'HEAD';
  var target;
  var query;
  var canonicalHost;
  var isFlight;
  var aliasBase;

  /* Assets, Next.js internals, and static Flight/RSC .txt files pass intact. */
  if (!isKnownHost || !canHandleDocument || uri.indexOf('/_next/') === 0) return request;

  canonicalHost = 'https://' + SEO_CANONICAL_HOST;
  query = seoQueryString(request);
  target = SEO_REDIRECTS[uri];
  if (target) return seoRedirect(canonicalHost + target + query);

  if (uri === '/index.html') return seoRedirect(canonicalHost + '/' + query);
  if (SEO_REDIRECTS[uri]) return seoRedirect(canonicalHost + SEO_REDIRECTS[uri] + query);
  if (/\/index\.html$/.test(uri)) {
    aliasBase = uri.replace(/index\.html$/, '');
    if (SEO_DOCUMENTS[aliasBase]) return seoRedirect(canonicalHost + aliasBase + query);
    return seoNotFound();
  }
  if (/\.html$/i.test(uri)) return seoNotFound();
  if (/\.[^/]+$/.test(uri)) return request;
  if (SEO_DOCUMENTS[uri]) {
    if (host !== SEO_CANONICAL_HOST) return seoRedirect(canonicalHost + uri + query);
    isFlight = !!(request.querystring && (request.querystring.rsc || request.querystring._rsc)) ||
      !!(request.headers && request.headers.rsc && request.headers.rsc.value === '1');
    request.uri = SEO_DOCUMENTS[uri].replace(/index\.html$/, isFlight ? 'index.txt' : 'index.html');
    return request;
  }
  if (uri.length > 1 && uri.charAt(uri.length - 1) !== '/' && SEO_DOCUMENTS[uri + '/']) {
    return seoRedirect(canonicalHost + uri + '/' + query);
  }

  return seoNotFound();
}
