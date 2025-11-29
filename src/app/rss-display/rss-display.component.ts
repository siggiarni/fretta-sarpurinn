import { Component, OnInit } from '@angular/core';
import { RssFeedService } from '../rss-feed.service';

@Component({
  selector: 'app-rss-display',
  templateUrl: './rss-display.component.html',
  styleUrls: ['./rss-display.component.css'],
})
export class RssDisplayComponent implements OnInit {
  feeds: any[] = [];
  rssUrls: string[] = [
    'https://www.visir.is/rss/allt',
    'https://www.mbl.is/feeds/fp/',
    'https://heimildin.is/rss/',
    'https://www.dv.is/feed/',
    'https://fibfrettir.is/feed/',
  ];
  maxItemsPerFeed = 5; // Set the maximum number of items to display

  constructor(private rssFeedService: RssFeedService) {}

  ngOnInit(): void {
    this.rssUrls.forEach((url) => {
      this.rssFeedService.fetchRssFeed(url).subscribe((feed) => {
        // Limit the number of items for each feed
        const limitedFeed = feed.slice(0, this.maxItemsPerFeed);
        this.feeds = this.feeds.concat(limitedFeed);
        this.sortFeedsByDate();
      });
    });
  }

  private sortFeedsByDate(): void {
    this.feeds = this.feeds.sort((a, b) => {
      const getTime = (item: any) => {
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
