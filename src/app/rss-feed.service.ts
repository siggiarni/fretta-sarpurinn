import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface RawFeedItem {
  title: string;
  link: string;
  pubDate?: string;
}

interface RssResponse {
  status: string;
  items: RawFeedItem[];
}

export interface FeedItem {
  title: string;
  link: string;
  pubDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RssFeedService {
  constructor(private http: HttpClient) {}

  fetchRssFeed(sourceId: string): Observable<FeedItem[]> {
    const apiUrl = `/api/feed?source=${encodeURIComponent(sourceId)}`;

    return this.http.get<RssResponse>(apiUrl).pipe(
      map((response) => {
        if (response.status !== 'ok' || !Array.isArray(response.items)) {
          throw new Error(`Failed to load RSS feed: ${sourceId}`);
        }

        return response.items.map((item) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
        }));
      }),
      catchError((error) => {
        console.error(`Error fetching RSS feed from ${sourceId}:`, error);
        return of([]);
      })
    );
  }
}
