import { defineComponent, h, type VNode } from 'vue'

/**
 * Renders CMS text with two typographic fixes the design relies on:
 * ® and ™ as small raised marks (Figma sets them superscript), and hyphenated
 * words kept on one line — otherwise "Single-Port" breaks as "Single- / Port"
 * in narrow columns.
 */
export default defineComponent({
  name: 'BrandText',
  props: { text: { type: String, default: '' } },
  setup(props) {
    const marks = (chunk: string): (string | VNode)[] =>
      chunk.split(/([®™])/).filter(Boolean).map(t => (t === '®' || t === '™' ? h('sup', { class: 'brand-mark' }, t) : t))

    return () =>
      props.text.split(/(\s+)/).flatMap(word =>
        /\p{L}-\p{L}/u.test(word)
          ? [h('span', { class: 'brand-nowrap' }, marks(word))]
          : marks(word),
      )
  },
})
