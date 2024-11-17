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
    'https://example.com/feed1.xml',
    'https://example.com/feed2.xml',
    'https://www.visir.is/rss/allt',
  ];

  constructor(private rssFeedService: RssFeedService) {}

  ngOnInit(): void {
    this.rssUrls.forEach((url) => {
      this.rssFeedService.fetchRssFeed(url).subscribe((feed) => {
        this.feeds = this.feeds.concat(feed);
      });
    });
  }
}
