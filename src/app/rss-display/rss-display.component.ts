import { Component, OnInit, OnDestroy } from '@angular/core';
import { RssFeedService } from '../rss-feed.service';
import { Subject } from 'rxjs';
import { takeUntil, catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

interface FeedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  sourceName: string;
  sourceSlug: string;
}

interface FeedSourceMeta {
  name: string;
  slug: string;
}

@Component({
  selector: 'app-rss-display',
  templateUrl: './rss-display.component.html',
  styleUrls: ['./rss-display.component.css'],
})
export class RssDisplayComponent implements OnInit, OnDestroy {
  feeds: FeedItem[] = [];
  loading = true;
  loadedFeeds = 0;
  totalFeeds = 0;
  failedFeeds: string[] = [];
  private destroy$ = new Subject<void>();
  rssUrls: string[] = [
    'https://www.visir.is/rss/allt',
    'https://www.mbl.is/feeds/fp/',
    'https://heimildin.is/rss/',
    'https://www.dv.is/feed/',
    'https://fibfrettir.is/feed/',
    'https://www.ruv.is/rss/frettir',
    'https://www.vedur.is/um-vi/frettir/rss.xml',
  ];
  maxItemsPerFeed = 5; // Set the maximum number of items to display

  private feedSourceMeta: Record<string, FeedSourceMeta> = {
    'https://www.visir.is/rss/allt': { name: 'Vísir', slug: 'visir' },
    'https://www.mbl.is/feeds/fp/': { name: 'MBL', slug: 'mbl' },
    'https://heimildin.is/rss/': { name: 'Heimildin', slug: 'heimildin' },
    'https://www.dv.is/feed/': { name: 'DV', slug: 'dv' },
    'https://fibfrettir.is/feed/': { name: 'FÍB fréttir', slug: 'fibfrettir' },
    'https://www.ruv.is/rss/frettir': { name: 'RÚV', slug: 'ruv' },
    'https://www.vedur.is/um-vi/frettir/rss.xml': {
      name: 'Veður',
      slug: 'vedur',
    },
  };

  constructor(private rssFeedService: RssFeedService) {}

  ngOnInit(): void {
    this.totalFeeds = this.rssUrls.length;

    // Fetch all feeds in parallel with individual subscriptions for progressive loading
    this.rssUrls.forEach((url) => {
      this.rssFeedService.fetchRssFeed(url)
        .pipe(
          timeout(30000), // 30 second timeout per feed
          catchError((error) => {
            console.error(`Failed to load feed from ${url}:`, error);
            const meta = this.feedSourceMeta[url] ?? this.deriveMetaFromUrl(url);
            this.failedFeeds.push(meta.name);
            return of([]); // Return empty array on error
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (feed) => {
            this.loadedFeeds++;

            if (feed.length > 0) {
              const limitedFeed = feed.slice(0, this.maxItemsPerFeed);
              const enrichedFeed = this.enrichFeedItems(limitedFeed, url);
              this.feeds = this.feeds.concat(enrichedFeed);
              this.sortFeedsByDate();
            }

            // Mark loading as complete when all feeds have been processed
            if (this.loadedFeeds === this.totalFeeds) {
              this.loading = false;
            }
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private enrichFeedItems(items: any[], feedUrl: string): FeedItem[] {
    const meta =
      this.feedSourceMeta[feedUrl] ?? this.deriveMetaFromUrl(feedUrl);
    return items.map((item) => ({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
      sourceName: meta.name,
      sourceSlug: meta.slug,
    }));
  }

  private deriveMetaFromUrl(feedUrl: string): FeedSourceMeta {
    try {
      const hostname = new URL(feedUrl).hostname.replace(/^www\./, '');
      const slug = hostname.split('.')[0];
      return { name: hostname, slug };
    } catch {
      return { name: feedUrl, slug: 'generic' };
    }
  }

  private sortFeedsByDate(): void {
    this.feeds = this.feeds.sort((a, b) => {
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
