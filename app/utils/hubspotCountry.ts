/**
 * The site's country list against HubSpot's.
 *
 * HubSpot's Country/Region dropdown carries the full ISO list under its own
 * spellings, and a dropdown rejects a value that is not one of its options. Our
 * list is nineteen countries plus Other, and all but three match by name.
 */
const OVERRIDES: Record<string, string> = {
  NL: 'Netherlands (Kingdom of the)',
  GB: 'United Kingdom of Great Britain and Northern Ireland',
  // HubSpot's list has no "Other". Raised with the client on 19 October; until
  // it is added, a visitor choosing Other has their submission rejected rather
  // than filed under the wrong country.
  other: 'Other',
}

export function hubspotCountry(code: string, name: string) {
  return OVERRIDES[code] || name || code
}

/** Storyblok names the default language "default"; the site calls it "en". */
export function siteLanguage(code: string) {
  return !code || code === 'default' ? 'en' : code
}
