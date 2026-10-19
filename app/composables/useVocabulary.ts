/**
 * The reading form of a datasource key, in the language being read.
 *
 * Cards, chips and pop-ups all turn keys like `general-surgery` into words. They
 * each did it by rewriting the key, which is fine in English and wrong in every
 * other language. This looks the key up in the datasources instead, and falls
 * back to the old behaviour for anything not listed.
 */
export function useVocabulary(slugs: string[]) {
  const dimension = useDatasourceDimension()
  const { data } = useAsyncData(
    () => `vocab-${slugs.join('-')}-${dimension.value || 'default'}`,
    async () => {
      const sets = await Promise.all(slugs.map(slug => fetchDatasource(slug, dimension.value)))
      const map: Record<string, string> = {}
      for (const set of sets) for (const e of set) map[e.value] = e.name
      return map
    },
    { default: () => ({}) },
  )
  return (v: string) => {
    if (!v) return ''
    return data.value?.[v] || v.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())
  }
}
