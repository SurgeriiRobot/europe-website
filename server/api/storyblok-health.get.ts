type StoryblokRegion = 'eu' | 'us' | 'ap' | 'ca' | 'cn'

interface HealthStory {
  id: number
  name: string
  fullSlug: string
  contentType: string | null
  publishedAt: string | null
}

interface HealthOk {
  ok: true
  token: string
  tokenType: string
  region: StoryblokRegion
  version: 'draft' | 'published'
  space: { id?: number, name?: string, version?: number } | null
  total: number
  stories: HealthStory[]
}

interface HealthFail {
  ok: false
  reason: 'missing-token' | 'unauthorized' | 'api-error' | 'network'
  message: string
  region: StoryblokRegion
  token?: string
}

export type StoryblokHealth = HealthOk | HealthFail

const API_BASE: Record<StoryblokRegion, string> = {
  eu: 'https://api.storyblok.com/v2',
  us: 'https://api-us.storyblok.com/v2',
  ap: 'https://api-ap.storyblok.com/v2',
  ca: 'https://api-ca.storyblok.com/v2',
  cn: 'https://app.storyblokchina.cn/v2',
}

const mask = (token: string) =>
  token.length <= 8 ? '••••' : `${token.slice(0, 4)}…${token.slice(-4)}`

export default defineEventHandler(async (): Promise<StoryblokHealth> => {
  const config = useRuntimeConfig()
  const token = config.storyblokAccessToken
  const region = ((config.storyblokRegion as StoryblokRegion) || 'eu')
  const base = API_BASE[region] ?? API_BASE.eu

  if (!token) {
    return {
      ok: false,
      reason: 'missing-token',
      message:
        'NUXT_STORYBLOK_ACCESS_TOKEN is empty. Put your Content Delivery API token in .env, then restart the dev server.',
      region,
    }
  }

  const call = async (path: string, params: Record<string, string> = {}) => {
    const url = new URL(`${base}/${path}`)
    url.searchParams.set('token', token)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

    const res = await fetch(url)
    let body: any = null
    try {
      body = await res.json()
    } catch {
      // Storyblok returns a bare body on some error codes.
    }
    return { status: res.status, ok: res.ok, body }
  }

  try {
    let version: 'draft' | 'published' = 'draft'
    let stories = await call('cdn/stories', { version, per_page: '10' })

    if (stories.status === 401) {
      version = 'published'
      stories = await call('cdn/stories', { version, per_page: '10' })
    }

    if (stories.status === 401) {
      return {
        ok: false,
        reason: 'unauthorized',
        message: `Storyblok rejected the token (401). Check that it belongs to this space and to the "${region}" region.`,
        token: mask(token),
        region,
      }
    }

    if (!stories.ok) {
      return {
        ok: false,
        reason: 'api-error',
        message: `Storyblok answered ${stories.status}: ${JSON.stringify(stories.body)}`,
        token: mask(token),
        region,
      }
    }

    const space = await call('cdn/spaces/me')

    return {
      ok: true,
      token: mask(token),
      tokenType: version === 'draft' ? 'preview (reads drafts)' : 'public (published only)',
      region,
      version,
      space: space.ok
        ? { id: space.body?.space?.id, name: space.body?.space?.name, version: space.body?.space?.version }
        : null,
      total: stories.body?.stories?.length ?? 0,
      stories: (stories.body?.stories ?? []).map((story: any): HealthStory => ({
        id: story.id,
        name: story.name,
        fullSlug: story.full_slug,
        contentType: story.content?.component ?? null,
        publishedAt: story.published_at ?? null,
      })),
    }
  } catch (error: any) {
    return {
      ok: false,
      reason: 'network',
      message: `Could not reach ${base} — ${error?.message ?? error}`,
      token: mask(token),
      region,
    }
  }
})
