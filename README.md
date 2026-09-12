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

## Storyblok integration

[`@storyblok/nuxt`](https://github.com/storyblok/storyblok-nuxt) v11 is registered
in `nuxt.config.ts`. Blocks map to components in `app/storyblok/` **by file name**
— a `teaser` block renders `app/storyblok/Teaser.vue`:

| Block | Component |
| --- | --- |
| `page` | `Page.vue` — renders nested `body` bloks |
| `teaser` | `Teaser.vue` — `headline` |
| `grid` | `Grid.vue` — renders `columns` |
| `feature` | `Feature.vue` — `name` |

Add a block type in Storyblok, add the matching `.vue` file here, done. Every
component carries `v-editable`, which is what lets the Visual Editor highlight a
block and jump to its fields.

Dev fetches `draft` content and production fetches `published`, decided in
`app/pages/[...slug].vue`.

> **Note:** v11 changed `useAsyncStoryblok`'s signature — CDN parameters nest
> under `api`: `useAsyncStoryblok(slug, { api: { version: 'draft' } })`. The old
> flat form throws at runtime.

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
