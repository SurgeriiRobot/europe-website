/**
 * Registers a snake_case alias for every globally registered component.
 *
 * `StoryblokComponent` renders `blok.component` with underscores swapped for
 * hyphens (`nav_column` -> `nav-column`), which Vue resolves correctly. But its
 * "is this component registered?" check runs against the *raw* name, and Vue's
 * resolver only camelizes hyphens — never underscores. So every multi-word blok
 * renders fine while logging a false "Component could not be found" error.
 *
 * Aliasing the snake_case form satisfies that check. Remove this once
 * @storyblok/vue normalises the name before checking (>11.3.1).
 */
export default defineNuxtPlugin({
  name: 'storyblok-component-aliases',
  // Must run after Nuxt has registered its global components.
  enforce: 'post',
  setup(nuxtApp) {
  const registry = nuxtApp.vueApp._context.components as Record<string, any>

  for (const name of Object.keys(registry)) {
    if (name.startsWith('Lazy')) continue

    const snake = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
    if (snake !== name && !registry[snake]) {
      nuxtApp.vueApp.component(snake, registry[name])
    }
  }
  },
})
