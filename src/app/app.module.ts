import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { RssDisplayComponent } from './rss-display/rss-display.component';

@NgModule({
  declarations: [AppComponent, RssDisplayComponent],
  imports: [BrowserModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
