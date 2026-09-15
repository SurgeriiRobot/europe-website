# Content architecture — SHURUI Europe website

Derived from Figma `SHURUI Branding V1` → page **Website** (file key
`ooxtGBBODmoeGCX2bIjm7w`). The designer grouped frames under canvas labels; those
groups are the source of truth for what is canonical:

| Canvas label | Meaning |
| --- | --- |
| **Main pages** | Canonical page designs (desktop + mobile) |
| **Pages build from main pages blocks** | Reuse the same block library — no new sections expected |
| **Landing & mobile interactions** | Header/menu/search/cookie states, not separate pages |
| **Status/Active indicators** | Component states (carousel, dropdown, pop-up) |
| **DO NOT USE — Optional design version** | Rejected variants — ignore |

> `Desktop Shurui Landingpage - 4`, `SP Robot`, `System Principles` and
> `Instruments Ecosystem` each have a duplicate inside **DO NOT USE**. The
> canonical home page is **Landingpage - 3** (`991:18628`).

## 1. Site map

Slugs are English; other locales resolve through the i18n strategy in §6.

| Story | Slug | Content type |
| --- | --- | --- |
| Home | `home` | `page` |
| SHURUI SP Robot | `sp-robot` | `page` |
| System Principles | `system-principles` | `page` |
| Instruments Ecosystem | `instruments-ecosystem` | `page` |
| Clinical Application | `clinical-application` | `page` |
| Clinical Evidence | `clinical-evidence` | `page` |
| Clinical Library | `clinical-library` | `page` |
| Training & Clinical Support | `training-support` | `page` |
| About Us | `about` | `page` |
| Contact | `contact` | `page` |
| News & Events (listing) | `news-events` | `page` |
| News/event items | `news-events/*` | `article` |
| Clinical centers (full list) | `clinical-centers` | `page` |
| Individual centers | `clinical-centers/*` | `clinical_center` |
| Search results | `search` | `page` |
| IFU | `legal/ifu` | `page` |
| Privacy policy | `legal/privacy-policy` | `page` |
| Legal notice | `legal/legal-notice` | `page` |
| Cookie policy | `legal/cookie-policy` | `page` |
| Site configuration | `global/site-config` | `site_config` |

### Folders

```
/                     home
/legal/               IFU, privacy, legal notice, cookie policy
/news-events/         article stories (listing page lives at root as `news-events`)
/clinical-centers/    clinical_center stories
/global/              site-config  (folder excluded from search & sitemap)
```

## 2. Content types (root bloks)

### `page`
Generic composable page — every layout in the design is expressible with it.

| Field | Type | Notes |
| --- | --- | --- |
| `body` | bloks | The section library (§4) |
| `seo` | bloks (max 1) | `seo` blok — see below |
| `theme` | option | `light` \| `dark` — sets the page's opening surface |
| `hide_from_search` | boolean | excludes from the search index |

### `article` — news & events
Drives the `/news-events` listing, its filters and cards.

| Field | Type | Notes |
| --- | --- | --- |
| `title` | text | translatable |
| `excerpt` | textarea | card text, translatable |
| `image` | asset | card + hero image |
| `date` | datetime | sort key ("9 June 2026" in the design) |
| `article_type` | option → `article-types` | News / Event / Video |
| `specialties` | options → `medical-specialties` | multi |
| `event_type` | option → `event-types` | only for events |
| `region` | option → `regions` | filter facet |
| `location` | text | e.g. "Rotterdam" |
| `body` | bloks | full article, reuses the section library |
| `seo` | bloks (max 1) | `seo` blok |

### `clinical_center`
Feeds the country accordion and the world map on Contact, plus the full list page.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | text | |
| `country` | option → `countries` | groups the accordion |
| `city` | text | |
| `coordinates` | text | `lat,lng` for the map pin |
| `specialties` | options → `medical-specialties` | |
| `logo` | asset | used in the logo wall |
| `website` | link | |

### `site_config` — global, one story per space
Loaded once and provided app-wide; never rendered as a page.

| Field | Type | Notes |
| --- | --- | --- |
| `header` | bloks (max 1) | `header` |
| `footer` | bloks (max 1) | `footer` |
| `cookie_notice` | bloks (max 1) | `cookie_notice` |
| `default_seo` | bloks (max 1) | `seo` blok — fallback meta |

## 3. Global bloks

### `header`
| Field | Type | Notes |
| --- | --- | --- |
| `logo` | asset | |
| `nav` | bloks | `nav_item` |
| `cta` | bloks (max 1) | `button` — "Book a demo" |
| `show_search` | boolean | |
| `show_language_switcher` | boolean | |

### `nav_item` — supports the expanded mega menu
| Field | Type | Notes |
| --- | --- | --- |
| `label` | text | translatable |
| `link` | link | optional when it only opens a menu |
| `columns` | bloks | `nav_column` — the "Menu expanded" states |

### `nav_column`
`title` (text) · `links` (bloks → `nav_link`)

### `nav_link`
`label` (text) · `link` (link) · `description` (text) · `icon` (asset)

### `footer`
| Field | Type | Notes |
| --- | --- | --- |
| `columns` | bloks | `nav_column` — About SHURUI, Clinical applications, News & events, Contact |
| `legal_links` | bloks | `nav_link` — IFU, Privacy, Cookie, Legal notice, Careers |
| `socials` | bloks | `social_link` (platform option + url) |
| `wordmark` | text | the oversized "Shurui" lockup |
| `wordmark_caption` | text | "SP Surgical System" |

### `cookie_notice`
`body` (richtext) · `accept_label` · `reject_label` · `settings_label` · `policy_link` (link)

## 4. Section library (nestable bloks)

Every section carries `theme` (`light` \| `dark` \| `brand`) and optional
`anchor` (text) for in-page links, unless noted.

| Blok | Purpose | Fields |
| --- | --- | --- |
| `hero` | Split hero — headline left, media right | `eyebrow`, `headline`, `body`, `buttons` (bloks → `button`), `media` (asset), `media_position` (option), `theme` |
| `hero_full` | Full-bleed image hero (News, Contact) | `headline`, `body`, `background` (asset), `overlay` (option), `buttons` |
| `wordmark_band` | Oversized brand type + product shot | `word`, `caption`, `media`, `theme` |
| `statement` | Centred claim — "Innovation in movement" | `headline`, `body`, `watermark` (text), `theme` |
| `text_media` | Heading + rich text beside an image | `headline`, `body` (richtext), `media`, `media_position`, `buttons`, `theme` |
| `feature_grid` | "Key features" alternating tiles | `headline`, `watermark`, `items` (bloks → `feature_card`), `columns` (number) |
| `feature_card` | One tile | `title`, `body`, `media`, `link`, `theme` |
| `tabs` | Console / Instruments switcher | `items` (bloks → `tab_item`) |
| `tab_item` | | `label`, `body` (bloks) |
| `carousel` | Image/content slider | `items` (bloks), `autoplay` (boolean), `interval` (number) |
| `stats_band` | "Key figures" / "Why connect" | `headline`, `intro`, `items` (bloks → `stat`), `buttons`, `theme` |
| `stat` | | `value` (text — keeps "1,800+"), `label`, `icon` |
| `logo_wall` | Clinical centers & collaborations | `headline`, `groups` (bloks → `logo_group`) |
| `logo_group` | | `title` ("European hospitals"), `logos` (bloks → `logo_item`) |
| `logo_item` | | `logo` (asset), `name`, `link` |
| `testimonial` | Surgeon quote | `quote` (textarea), `author`, `role`, `portrait`, `link`, `theme` |
| `cta_band` | "Move beyond limits", "Careers", "Connect with us" | `headline`, `body`, `buttons`, `background` (asset), `theme` |
| `notice_band` | Small regulatory statement — "CE marked" | `headline`, `body`, `icon` |
| `accordion` | Country lists, FAQ | `headline`, `intro_link` (link), `items` (bloks → `accordion_item`) |
| `accordion_item` | | `label`, `body` (richtext or bloks) |
| `center_map` | World map with pins | `headline`, `source` (option: all / by region), `region` |
| `article_list` | News & events grid | `headline`, `per_page` (number), `filters` (options), `promo` (bloks → `promo_card`), `promo_position` (number) |
| `promo_card` | Inline CTA inside the grid | `headline`, `body`, `buttons`, `theme` |
| `contact_form` | | `headline`, `fields` (bloks → `form_field`), `consent_text` (richtext), `submit_label`, `success_message`, `privacy_note` (richtext) |
| `form_field` | | `name`, `label`, `type` (option: text/email/select/textarea/checkbox), `required` (boolean), `options` (datasource), `placeholder` |
| `rich_text` | Legal / IFU long-form | `body` (richtext), `width` (option) |
| `search_results` | Results page shell | `headline`, `empty_message` |
| `button` | Shared, non-section | `label`, `link`, `variant` (option: primary/secondary/ghost), `size` (option) |
| `seo` | Per-story meta | `title`, `description`, `og_image`, `canonical`, `no_index` |

> SEO is a plain nestable blok, not the `seo-metatags` plugin field. The space
> rejects that plugin type with a 422 on component upsert, and an ordinary blok
> is portable, translatable field by field, and has no marketplace dependency.

### Which page uses what

| Page | Sections |
| --- | --- |
| Home | `hero` · `wordmark_band` · `text_media` · `tabs` · `statement` · `feature_grid` · `logo_wall` · `testimonial` · `notice_band` · `stats_band` · `cta_band` · `article_list` · `cta_band` |
| SP Robot / System Principles / Instruments Ecosystem / Clinical Application | `hero` · `text_media` · `feature_grid` · `carousel` · `statement` · `cta_band` |
| Contact | `hero` · `stats_band` · `contact_form` · `accordion` · `center_map` · `cta_band` |
| News & Events | `hero_full` · `article_list` · `cta_band` |
| Legal / IFU | `hero` · `rich_text` |
| Clinical centers | `hero` · `accordion` · `center_map` |

## 5. Datasources (taxonomy)

Filter dropdowns on the News & Events page map to Storyblok datasources, so
editors manage the vocabulary without a schema change:

- `article-types` — news, event, video
- `medical-specialties` — urology, gynecology, thoracic, colorectal, pediatric, general
- `event-types` — congress, webinar, live-surgery, roadshow, expert-talk
- `regions` — europe, asia, americas
- `countries` — ISO code → display name (drives the contact form's Country select and the center accordion)

## 6. Internationalisation — implemented

**Strategy: field-level translation.** One story tree; each translatable field
carries per-locale values, fetched with Storyblok's `language` parameter. Chosen
because the design shows a single navigation and page set behind a language
switcher, not per-market site structures. 63 schema fields are marked
`translatable`.

Regulatory divergence (IFU wording per country) is handled by translating those
specific fields, not by forking the tree. If a market ever needs *different
pages*, that is the signal to revisit folder-level translation.

### How it is wired

| Concern | Where |
| --- | --- |
| Locale list, routing strategy | `i18n` block in `nuxt.config.ts` |
| Locale → Storyblok `language` | `app/composables/useStoryblokLanguage.ts` |
| Locale-prefixed links | `app/composables/useSbUrl.ts` |
| Language switcher UI | `app/components/LanguageSwitcher.vue` |
| `<html lang>` + hreflang | `useLocaleHead` in `app/pages/[...slug].vue` |

Routing uses `prefix_except_default`: English stays at `/contact`, German would be
`/de/contact`. Each locale object carries a `storyblok` key holding the language
code to send to the API (`default` for English), so the two systems cannot drift.

Every Storyblok fetch — page, article list, centers, search, site config — passes
the language and includes it in its cache key, so switching locale refetches
rather than serving the previous translation.

### Adding a locale

1. Add the language in Storyblok (Settings → Languages).
2. Uncomment its line in the `i18n.locales` array in `nuxt.config.ts`.
3. Translate the fields in Storyblok.

No code or schema changes. The switcher renders automatically once more than one
locale is active.

## 7. Conventions

- Blok technical names are `snake_case`; Vue components are `PascalCase`
  (`feature_grid` → `app/storyblok/FeatureGrid.vue`).
- Every section blok gets `theme` and `anchor`; no section hardcodes its colours.
- Text that appears in the design as a fixed label (button captions, form labels)
  stays editable — this site ships in multiple languages.
- Numbers that carry formatting ("1,800+", "101+") are `text`, never `number`.
- Images are `asset` fields; decorative backgrounds are separate from content
  images so they can be dropped at mobile breakpoints.
