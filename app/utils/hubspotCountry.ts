/**
 * Our country codes against HubSpot's option labels.
 *
 * HubSpot's Country/Region field is a dropdown, so it accepts only its own
 * exact spellings and silently drops anything else: the submission still
 * arrives and the notification email still shows the country, but the contact
 * record is left without one. That is what Juan saw on 26 October, where
 * Netherlands worked and France and Spain did not.
 *
 * This used to be a lookup against the country datasource with a handful of
 * overrides, which was wrong twice over. The datasource was read from the Nuxt
 * payload under `ds-<name>`, while it is stored under `ds-<name>-<dimension>`,
 * so the lookup never matched and every country fell through to its raw code,
 * "FR" and "ES". Only the two codes that happened to be hardcoded worked, which
 * is exactly the pattern in the report. And had the lookup matched, it would
 * have sent the translated name, so the German page would have offered HubSpot
 * "Frankreich".
 *
 * A fixed map avoids both. It does not depend on what the page fetched, and it
 * does not change with the language being read.
 *
 * Most of these are ISO 3166 short names, which is what HubSpot's list uses.
 * The two long ones were taken from the published form definition. If HubSpot
 * reports a country as not one of the allowed options, the label here is wrong
 * and the authority is Settings, Properties, Country/Region in HubSpot itself.
 */
const HUBSPOT_COUNTRY: Record<string, string> = {
  AT: 'Austria',
  BE: 'Belgium',
  CN: 'China',
  CZ: 'Czechia',
  DK: 'Denmark',
  FI: 'Finland',
  FR: 'France',
  DE: 'Germany',
  GR: 'Greece',
  IE: 'Ireland',
  IT: 'Italy',
  NL: 'Netherlands (Kingdom of the)',
  NO: 'Norway',
  PL: 'Poland',
  PT: 'Portugal',
  ES: 'Spain',
  SE: 'Sweden',
  CH: 'Switzerland',
  GB: 'United Kingdom of Great Britain and Northern Ireland',
  // HubSpot's list has no "Other". Raised with the client on 19 October; until
  // it is added, a visitor choosing Other has the country dropped while the
  // rest of their enquiry is still recorded.
  other: 'Other',
}

export function hubspotCountry(code: string) {
  return HUBSPOT_COUNTRY[code] || code
}

/** Storyblok names the default language "default"; the site calls it "en". */
export function siteLanguage(code: string) {
  return !code || code === 'default' ? 'en' : code
}
