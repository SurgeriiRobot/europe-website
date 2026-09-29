import { defineComponent, h, type VNode } from 'vue'

/**
 * Renders CMS text with the typographic details the design relies on:
 * - ® and ™ as small raised marks (Figma sets them superscript, in headings and
 *   body copy alike);
 * - `**bold**` spans, for the occasional emphasised phrase in body copy (plain
 *   text fields have no other way to carry it);
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
    // Number ranges stay with their unit ("2–4 cm", "5–7 cm"), as Figma sets
    // them: a word joiner after the dash and a no-break space before the unit.
    const tidy = (t: string) =>
      t.replace(/(\d)([–-])(\d+(?:[.,]\d+)?)\s(cm|mm|m|kg|°C|°|%)(?![\p{L}])/gu, '$1$2\u2060$3\u00a0$4')

    const marks = (chunk: string): (string | VNode)[] =>
      chunk.split(/([®™])/).filter(Boolean).map(t => (t === '®' || t === '™' ? h('sup', { class: 'brand-mark' }, t) : t))

    const words = (chunk: string): (string | VNode)[] =>
      props.nowrap
        ? chunk.split(/(\s+)/).flatMap(word =>
            /\p{L}-\p{L}/u.test(word) ? [h('span', { class: 'brand-nowrap' }, marks(word))] : marks(word))
        : marks(chunk)

    return () =>
      tidy(props.text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).flatMap(part =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4
          ? [h('strong', { class: 'brand-strong' }, words(part.slice(2, -2)))]
          : words(part),
      )
  },
})
