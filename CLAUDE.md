# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FrettaSarpurinn is an Angular 18 RSS feed aggregator that displays news from Icelandic media outlets. It fetches feeds via rss2json.com API (for CORS bypass), caches results client-side, and presents them in a unified chronological feed.

## Commands

```bash
npm start       # Dev server on http://localhost:4200
npm run build   # Production build to dist/
npm test        # Run tests with Karma/Jasmine (Chrome)
```

## Architecture

**Module-based Angular app (not standalone components)**

- `src/main.ts` - Bootstrap entry point
- `src/app/app.module.ts` - Root NgModule with HttpClient provider
- `src/app/rss-feed.service.ts` - RSS fetching with caching (10-min TTL) and 30s timeout
- `src/app/rss-display/` - Main display component with progressive loading

**Key patterns:**
- RxJS `takeUntil(destroy$)` for subscription cleanup
- Observable-based API returning empty arrays on error (graceful degradation)
- Feed items enriched with source metadata for color-coded badges
- Flexbox-based responsive layout

**Feed sources** are hardcoded in `rss-display.component.ts` with metadata (name, color scheme). RSS URLs use rss2json.com: `https://api.rss2json.com/v1/api.json?rss_url=...`

## TypeScript

Strict mode enabled. All code must satisfy strict null checks and template type checking.

## Language

User-facing text is in Icelandic.
