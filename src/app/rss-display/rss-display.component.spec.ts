import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RssDisplayComponent } from './rss-display.component';

describe('RssDisplayComponent', () => {
  let component: RssDisplayComponent;
  let fixture: ComponentFixture<RssDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RssDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RssDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
