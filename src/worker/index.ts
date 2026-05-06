/// <reference types="@cloudflare/workers-types" />

import { XMLParser } from 'fast-xml-parser';

const FEEDS: Record<string, string> = {
  visir: 'https://www.visir.is/rss/allt',
  mbl: 'https://www.mbl.is/feeds/fp/',
  heimildin: 'https://heimildin.is/rss/',
  dv: 'https://www.dv.is/feed/',
  fibfrettir: 'https://fibfrettir.is/feed/',
  nutiminn: 'https://www.nutiminn.is/feed/',
  'ruv-innlent': 'https://www.ruv.is/rss/innlent',
  'ruv-erlent': 'https://www.ruv.is/rss/erlent',
  'ruv-ithrottir': 'https://www.ruv.is/rss/ithrottir',
  'ruv-menning': 'https://www.ruv.is/rss/menning-og-daegurmal',
  vedur: 'https://www.vedur.is/um-vi/frettir/rss.xml',
};

const parser = new XMLParser({
  ignoreAttributes: true,
  cdataPropName: '__cdata',
  trimValues: true,
  removeNSPrefix: true,
  isArray: (name) => name === 'item',
});

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
}

interface RssResponse {
  status: 'ok' | 'error';
  items: FeedItem[];
}

interface Env {
  ASSETS: Fetcher;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const decodeEntities = (s: string): string =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : match;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });

const textOf = (node: unknown): string => {
  let raw = '';
  if (typeof node === 'string') raw = node;
  else if (node && typeof node === 'object' && '__cdata' in node) {
    raw = String((node as { __cdata: unknown }).__cdata ?? '');
  }
  return decodeEntities(raw);
};

const json = (body: RssResponse, init?: ResponseInit): Response =>
  Response.json(body, {
    ...init,
    headers: {
      'cache-control': 'public, max-age=60',
      ...init?.headers,
    },
  });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/feed') {
      return env.ASSETS.fetch(request);
    }

    const id = url.searchParams.get('source') ?? '';
    const feedUrl = FEEDS[id];
    if (!feedUrl) {
      return json({ status: 'error', items: [] }, { status: 404 });
    }

    const cache = caches.default;
    const cacheKey = new Request(request.url, { method: 'GET' });
    const hit = await cache.match(cacheKey);
    if (hit) return hit;

    try {
      const upstream = await fetch(feedUrl, {
        signal: AbortSignal.timeout(10_000),
      });
      const xml = await upstream.text();
      const parsed = parser.parse(xml);
      const rawItems = parsed?.rss?.channel?.item ?? [];
      const items: FeedItem[] = rawItems.map((item: Record<string, unknown>) => ({
        title: textOf(item['title']),
        link: textOf(item['link']),
        pubDate: textOf(item['pubDate']),
      }));
      const res = json({ status: 'ok', items });
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    } catch (e) {
      console.error(`Feed ${id} failed:`, e);
      return json({ status: 'error', items: [] }, { status: 502 });
    }
  },
} satisfies ExportedHandler<Env>;
