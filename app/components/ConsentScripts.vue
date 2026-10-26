<script setup lang="ts">
/**
 * The scripts that may only run once a visitor has accepted: HubSpot's tracking
 * code, which sets hubspotutk, __hstc, __hssc and __hssrc, and the LinkedIn
 * Insight Tag. Rejecting, or never answering, means neither is ever requested,
 * which is the point: blocking after the fact would be too late.
 *
 * Plausible is deliberately not here. It is cookieless, so it loads for
 * everyone and needs no consent.
 */
const { consent } = useConsent()
const { hubspotPortalId, linkedinPartnerId } = useRuntimeConfig().public as Record<string, string>

useHead(computed(() => {
  if (consent.value !== 'accepted') return {}
  const script = []
  if (hubspotPortalId) {
    script.push({
      key: 'hubspot',
      id: 'hs-script-loader',
      src: `https://js-eu1.hs-scripts.com/${hubspotPortalId}.js`,
      async: true,
      defer: true,
      tagPosition: 'bodyClose' as const,
    })
  }
  if (linkedinPartnerId) {
    script.push({
      key: 'linkedin-partner',
      // `lintrk` is the queue LinkedIn's own snippet defines before the tag
      // loads, so that a conversion fired during those few hundred
      // milliseconds is held and replayed rather than throwing. We had the tag
      // but not the queue, which is fine until the first conversion event is
      // added and then silently is not.
      innerHTML: `window._linkedin_partner_id="${linkedinPartnerId}";`
        + 'window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];'
        + `window._linkedin_data_partner_ids.push("${linkedinPartnerId}");`
        + 'if(!window.lintrk){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[];}',
      tagPosition: 'bodyClose' as const,
    })
    script.push({
      key: 'linkedin-insight',
      src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
      async: true,
      tagPosition: 'bodyClose' as const,
    })
  }
  return { script }
}))
</script>

<template>
  <!-- nothing to draw: the tags live in the document head -->
</template>
