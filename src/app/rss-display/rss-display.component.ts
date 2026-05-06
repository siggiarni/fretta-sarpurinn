import { Component, OnInit, OnDestroy } from '@angular/core';
import { FeedItem as RawFeedItem, RssFeedService } from '../rss-feed.service';
import { Subject } from 'rxjs';
import { takeUntil, catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

interface FeedItem extends RawFeedItem {
  sourceName: string;
  sourceSlug: string;
}

interface FeedSource {
  id: string;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-rss-display',
  templateUrl: './rss-display.component.html',
  styleUrl: './rss-display.component.css',
  standalone: false,
})
export class RssDisplayComponent implements OnInit, OnDestroy {
  feeds: FeedItem[] = [];
  loading = true;
  loadedFeeds = 0;
  totalFeeds = 0;
  failedFeeds: string[] = [];
  private destroy$ = new Subject<void>();
  private readonly feedSources: readonly FeedSource[] = [
    { id: 'visir', name: 'Vísir', slug: 'visir' },
    { id: 'mbl', name: 'MBL', slug: 'mbl' },
    { id: 'heimildin', name: 'Heimildin', slug: 'heimildin' },
    { id: 'dv', name: 'DV', slug: 'dv' },
    { id: 'fibfrettir', name: 'FÍB fréttir', slug: 'fibfrettir' },
    { id: 'nutiminn', name: 'Nútíminn', slug: 'nutiminn' },
    { id: 'ruv-innlent', name: 'RÚV', slug: 'ruv' },
    { id: 'ruv-erlent', name: 'RÚV', slug: 'ruv' },
    { id: 'ruv-ithrottir', name: 'RÚV', slug: 'ruv' },
    { id: 'ruv-menning', name: 'RÚV', slug: 'ruv' },
    { id: 'vedur', name: 'Veður', slug: 'vedur' },
  ];
  private readonly maxItemsPerFeed = 5;

  constructor(private rssFeedService: RssFeedService) {}

  ngOnInit(): void {
    this.totalFeeds = this.feedSources.length;

    this.feedSources.forEach((source) => {
      this.rssFeedService
        .fetchRssFeed(source.id)
        .pipe(
          timeout(30000),
          catchError((error) => {
            console.error(`Failed to load feed ${source.id}:`, error);
            this.failedFeeds.push(source.name);
            return of([]);
          }),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: (feed) => {
            this.loadedFeeds++;

            if (feed.length > 0) {
              const enrichedFeed = feed
                .slice(0, this.maxItemsPerFeed)
                .map((item) => ({
                  ...item,
                  sourceName: source.name,
                  sourceSlug: source.slug,
                }));
              this.feeds = this.feeds.concat(enrichedFeed);
              this.sortFeedsByDate();
            }

            if (this.loadedFeeds === this.totalFeeds) {
              this.loading = false;
            }
          },
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private sortFeedsByDate(): void {
    this.feeds.sort((a, b) => {
      const getTime = (item: FeedItem) => {
        if (!item?.pubDate) {
          return 0;
        }
        const timestamp = new Date(item.pubDate).getTime();
        return isNaN(timestamp) ? 0 : timestamp;
      };

      return getTime(b) - getTime(a);
    });
  }
}
