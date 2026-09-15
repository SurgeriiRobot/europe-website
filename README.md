# europe-website

[Nuxt 4](https://nuxt.com) front end for the Storyblok space `europe-website`
(id `295130137307478`, EU region).

## Requirements

- Node 24 (`node -v`)
- pnpm 11

## Setup

```bash
pnpm install
cp .env.example .env   # then paste your Storyblok token
```

`.env` holds the Content Delivery API token — it is gitignored, so each developer
supplies their own:

| Variable | Meaning |
| --- | --- |
| `NUXT_STORYBLOK_ACCESS_TOKEN` | Content Delivery API token (Space Settings → Access Tokens) |
| `NUXT_STORYBLOK_REGION` | `eu` (default), `us`, `ap`, `ca` or `cn` |

A **preview** token reads drafts; a **public** token only sees published stories.
Development expects a preview token.

## Development

```bash
pnpm dev        # https://localhost:3010
pnpm typecheck  # vue-tsc over the whole project
```

The dev server runs over **HTTPS** because the Storyblok Visual Editor loads the
site in an iframe and browsers refuse insecure frames. Certificates live in
`certs/` (gitignored) and are generated with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem \
  localhost 127.0.0.1 ::1 "$(hostname -I | awk '{print $1}')"
```

The browser shows a certificate warning until mkcert's root CA
(`mkcert -CAROOT`) is trusted by the OS running the browser.

### Running under WSL

If the browser is on Windows while the server runs in WSL, `localhost` may not
reach it — WSL's NAT-mode relay accepts the TCP connection and then drops the
request (`ERR_EMPTY_RESPONSE`). Use the WSL IP instead:

```bash
echo "https://$(hostname -I | awk '{print $1}'):3010/"
```

That address changes whenever WSL restarts. To fix `localhost` permanently, put
`networkingMode=mirrored` under `[wsl2]` in `%USERPROFILE%\.wslconfig` and run
`wsl --shutdown`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Connection dashboard — space, region, token type, story list |
| `/[...slug]` | Renders any Storyblok story by its full slug (`/home`, `/en/about`, …) |
| `/api/storyblok-health` | Server-side connection check returning structured JSON |

`/api/storyblok-health` reads the token from `runtimeConfig` on the server, so it
never ships to the browser. It reports `missing-token`, `unauthorized`,
`api-error` or `network` separately, and detects whether the token is preview or
public by retrying draft → published.

## Content architecture

The full model — pages, content types, every block and its fields — lives in
[docs/content-architecture.md](docs/content-architecture.md). It is derived from
the canonical Figma frames, including which designs the designer marked
`DO NOT USE`.

The block schemas themselves live in the Storyblok space (40 components, 4
content types, 5 datasources). They are generated from a local schema-as-code
setup that is **not** part of this repository, so pulling a copy is the way to
inspect them:

```bash
pnpm dlx storyblok@latest login
pnpm dlx storyblok@latest components pull --space 295130137307478
```

That writes `.storyblok/components/<space>/components.json`, which is gitignored.
Schema changes are made by the maintainer and pushed from that setup — don't
hand-edit components in the UI without telling them, or the next push will
overwrite the change.

## Storyblok integration

[`@storyblok/nuxt`](https://github.com/storyblok/storyblok-nuxt) v11 is registered
in `nuxt.config.ts`. Blocks map to components in `app/storyblok/` **by name** —
`StoryblokComponent` converts `feature_grid` to `feature-grid`, which Vue resolves
to `FeatureGrid.vue`.

Add a block type in Storyblok, add the matching `.vue` file, done. Every component
carries `v-editable`, which is what lets the Visual Editor highlight a block and
jump to its fields.

Dev fetches `draft` content and production fetches `published`, decided in
`app/pages/[...slug].vue`.

> **Note:** v11 changed `useAsyncStoryblok`'s signature — CDN parameters nest
> under `api`: `useAsyncStoryblok(slug, { api: { version: 'draft' } })`. The old
> flat form throws at runtime.

## Design system

Tokens in `app/assets/css/tokens.css` mirror the Figma Design System page
exactly — the full colour ramp and the type scale. Sections never hardcode
colour; they set `data-theme="light|dark|brand"` and inherit
`--surface` / `--ink` / `--accent`.

Fonts are **Lora** (display) and **Inter** (everything else), self-hosted at build
time by `@nuxt/fonts`. They are deliberately not hotlinked from Google: German
courts have held that embedding Google Fonts transfers visitor IPs to a third
country in breach of the GDPR, which matters for a European medical site.

## Internationalisation

Field-level translation: one story tree, per-field translations, fetched with the
Storyblok `language` parameter. English is the source locale and stays unprefixed
(`/contact`); other locales are prefixed (`/de/contact`).

To add a locale: add the language in Storyblok, uncomment its entry in
`i18n.locales` in `nuxt.config.ts`, translate. No code changes — see
[the architecture doc](docs/content-architecture.md#6-internationalisation--implemented).

## Visual Editor

Set the preview URL in **Settings → Visual Editor → Location** to the dev server
address (the WSL IP form when applicable). This requires the **Admin** or
**Owner** role on the space; an Editor gets "Access denied" on the settings page,
and a Management API token does not help because it inherits the same
permissions.

## Production

```bash
pnpm build && pnpm preview
```

Use a **public** token in production and make sure the stories are published —
`published_at: null` means a public token returns nothing.

## Notes

- `typescript` is pinned to the 5.x line: `vue-tsc` cannot drive TypeScript 7,
  which dropped the `./lib/tsc` entry point it requires.
- `pnpm-workspace.yaml` allows esbuild's build script; without it pnpm blocks the
  postinstall and `nuxt dev` fails.
