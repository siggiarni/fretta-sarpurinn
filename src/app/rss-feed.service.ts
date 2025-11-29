import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RssFeedService {
  private cache: { [url: string]: any[] } = {};
  private cacheDuration = 600000; // Cache duration in milliseconds (e.g., 10 minutes)
  private cacheTimestamps: { [url: string]: number } = {};

  constructor(private http: HttpClient) {}

  fetchRssFeed(feedUrl: string): Observable<any[]> {
    // Check if the feed is cached and still valid
    const now = Date.now();
    if (
      this.cache[feedUrl] &&
      now - this.cacheTimestamps[feedUrl] < this.cacheDuration
    ) {
      return of(this.cache[feedUrl]);
    }

    // Use rss2json API to bypass CORS and get parsed JSON back
    const rss2jsonUrl =
      'https://api.rss2json.com/v1/api.json?rss_url=' +
      encodeURIComponent(feedUrl);

    return this.http.get(rss2jsonUrl).pipe(
      map((response: any) => {
        if (response.status !== 'ok' || !Array.isArray(response.items)) {
          throw new Error(`Failed to load RSS feed: ${feedUrl}`);
        }

        return response.items.map((item: any) => ({
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate ?? item.pubdate ?? item.published,
        }));
      }),
      tap((items) => {
        // Cache the feed data and timestamp
        this.cache[feedUrl] = items;
        this.cacheTimestamps[feedUrl] = now;
      })
    );
  }
}
