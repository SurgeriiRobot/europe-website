import { defineComponent, h, type VNode } from 'vue'
import { NuxtLink } from '#components'

/**
 * Renders CMS text with the typographic details the design relies on:
 * - ® and ™ as small raised marks (Figma sets them superscript, in headings and
 *   body copy alike);
 * - `**bold**` spans, for the occasional emphasised phrase in body copy (plain
 *   text fields have no other way to carry it);
 * - `[label](/path)` links, for the same reason: Waitak asks for a phrase inside
 *   body copy to become a link ("'news & events page' should be clickable"), and
 *   these fields are plain strings, not rich text;
 * - number ranges kept with their unit ("2–4 cm");
 * - hyphenated words kept on one line in headings — otherwise "Single-Port"
 *   breaks as "Single- / Port" in narrow columns. Body copy passes
 *   `:nowrap="false"`, since the design lets "single-port" break there.
 */
export default defineComponent({
  name: 'BrandText',
  props: {
    text: { type: String, default: '' },
    nowrap: { type: Boolean, default: true },
  },
  setup(props) {
    // These hrefs are written by hand in the copy field, so they are plain
    // paths rather than Storyblok links: localePath, not useSbUrl. The query
    // and fragment are kept out of the resolve and put back after it.
    const localePath = useLocalePath()
    const route = (href: string) => {
      const cut = href.search(/[?#]/)
      return cut === -1 ? localePath(href) : localePath(href.slice(0, cut)) + href.slice(cut)
    }

    // Number ranges stay with their unit ("2–4 cm", "5–7 cm"), as Figma sets
    // them: a word joiner after the dash and a no-break space before the unit.
    const tidy = (t: string) =>
      t.replace(/(\d)([–-])(\d+(?:[.,]\d+)?)\s(cm|mm|m|kg|°C|°|%)(?![\p{L}])/gu, '$1$2⁠$3 $4')

    const marks = (chunk: string): (string | VNode)[] =>
      chunk.split(/([®™])/).filter(Boolean).map(t => (t === '®' || t === '™' ? h('sup', { class: 'brand-mark' }, t) : t))

    const words = (chunk: string): (string | VNode)[] =>
      props.nowrap
        ? chunk.split(/(\s+)/).flatMap(word =>
            /\p{L}-\p{L}/u.test(word) && word.length <= 14 ? [h('span', { class: 'brand-nowrap' }, marks(word))] : marks(word))
        : marks(chunk)

    // An absolute URL leaves the site, so it opens in a new tab and carries the
    // usual rel; anything else is a route and goes through the locale resolver.
    const link = (label: string, href: string): VNode =>
      /^(https?:|mailto:|tel:)/.test(href)
        ? h('a', { href, class: 'brand-link', ...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }, words(label))
        : h(NuxtLink, { to: route(href), class: 'brand-link' }, () => words(label))

    const inline = (chunk: string): (string | VNode)[] =>
      chunk.split(/(\*\*[^*]+\*\*)/).filter(Boolean).flatMap(part =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4
          ? [h('strong', { class: 'brand-strong' }, words(part.slice(2, -2)))]
          : words(part))

    return () =>
      tidy(props.text).split(/(\[[^\]]+\]\([^)\s]+\))/).filter(Boolean).flatMap((part) => {
        const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
        return m ? [link(m[1]!, m[2]!)] : inline(part)
      })
  },
})
