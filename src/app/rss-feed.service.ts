import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface RawFeedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  pubdate?: string;
  published?: string;
}

interface RssResponse {
  status: string;
  items: RawFeedItem[];
}

export interface FeedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RssFeedService {
  constructor(private http: HttpClient) {}

  fetchRssFeed(feedUrl: string): Observable<FeedItem[]> {
    const rss2jsonUrl =
      'https://api.rss2json.com/v1/api.json?rss_url=' +
      encodeURIComponent(feedUrl) +
      '&_=' + Date.now();

    return this.http.get<RssResponse>(rss2jsonUrl).pipe(
      map((response) => {
        if (response.status !== 'ok' || !Array.isArray(response.items)) {
          throw new Error(`Failed to load RSS feed: ${feedUrl}`);
        }

        return response.items.map((item) => ({
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate ?? item.pubdate ?? item.published,
        }));
      }),
      catchError((error) => {
        console.error(`Error fetching RSS feed from ${feedUrl}:`, error);
        return of([]);
      })
    );
  }
}
