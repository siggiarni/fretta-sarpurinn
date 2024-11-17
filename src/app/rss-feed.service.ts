import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RssFeedService {
  constructor(private http: HttpClient) {}

  fetchRssFeed(feedUrl: string): Observable<any> {
    const proxyUrl =
      'https://api.allorigins.win/get?url=' + encodeURIComponent(feedUrl);
    return this.http.get(proxyUrl).pipe(
      map((response: any) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.contents, 'text/xml');
        const items = Array.from(xml.querySelectorAll('item')).map((item) => ({
          title: item.querySelector('title')?.textContent,
          link: item.querySelector('link')?.textContent,
          description: item.querySelector('description')?.textContent,
        }));
        return items;
      })
    );
  }
}
