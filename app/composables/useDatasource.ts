/**
 * Datasource entries in the language being read.
 *
 * Storyblok translates a datasource through *dimensions*: the entry keeps its
 * default name and carries one extra value per language, which the delivery API
 * only returns when asked for that dimension. Nothing here asked, which is why
 * the filter chips and the specialty lists stayed English on every translated
 * page however carefully the datasources were filled in.
 *
 * Asking for a dimension that does not exist is harmless: the default names
 * come back, exactly as before.
 */
export function useDatasourceDimension() {
  const language = useStoryblokLanguage()
  return computed(() => (language.value && language.value !== 'default' ? language.value : undefined))
}

/**
 * Countries in the reader's own alphabet, with "Other" kept last.
 *
 * A datasource comes back in the order its entries were created, which for
 * `countries` was English alphabetical. That has two consequences. A country
 * added later lands at the end of the dropdown, below Other, which is where
 * Romania would have gone. And every translated list is still ordered by the
 * English name, so the German reader is offered Österreich, Belgien, China,
 * Tschechien, where Deutschland sits between Frankreich and Griechenland.
 *
 * Sorting by the displayed name fixes both. Other is pinned to the bottom
 * because it is not a country and its translations sort all over the list.
 */
export function sortCountries<T extends { name: string, value: string }>(rows: T[], locale?: string) {
  const collator = new Intl.Collator(locale || 'en')
  return [...rows].sort((a, b) =>
    Number(a.value === 'other') - Number(b.value === 'other')
    || collator.compare(a.name, b.name))
}

export async function fetchDatasource(slug: string, dimension?: string) {
  const api = useStoryblokApi()
  const { data } = await api.get('cdn/datasource_entries', {
    datasource: slug,
    per_page: 100,
    version: useStoryblokVersion(),
    ...(dimension ? { dimension } : {}),
  })
  // With a dimension the translated value arrives as `dimension_value`, and an
  // entry nobody has translated yet simply has none, so it keeps its name.
  return ((data.datasource_entries || []) as any[]).map(e => ({
    name: e.dimension_value || e.name,
    value: e.value,
  }))
}
