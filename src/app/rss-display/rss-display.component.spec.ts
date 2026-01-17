import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RssDisplayComponent } from './rss-display.component';
import { RssFeedService } from '../rss-feed.service';
import { of } from 'rxjs';

describe('RssDisplayComponent', () => {
  let component: RssDisplayComponent;
  let fixture: ComponentFixture<RssDisplayComponent>;
  let rssFeedService: jasmine.SpyObj<RssFeedService>;

  beforeEach(async () => {
    const rssFeedServiceSpy = jasmine.createSpyObj('RssFeedService', ['fetchRssFeed']);

    await TestBed.configureTestingModule({
      declarations: [RssDisplayComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RssFeedService, useValue: rssFeedServiceSpy }
      ]
    })
    .compileComponents();

    rssFeedService = TestBed.inject(RssFeedService) as jasmine.SpyObj<RssFeedService>;
    rssFeedService.fetchRssFeed.and.returnValue(of([]));

    fixture = TestBed.createComponent(RssDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
