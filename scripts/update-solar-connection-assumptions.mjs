import { createClient } from '@supabase/supabase-js'

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

const title = 'Atlas Solar Carport Pricing Release'
const { data, error } = await client
  .from('os_catalog_items')
  .select('id,metadata')
  .eq('platform_key', 'atlas')
  .eq('kind', 'module')
  .eq('title', title)
  .maybeSingle()

if (error) throw error
if (!data?.metadata?.solarPricing) throw new Error('Publish an initial Atlas Solar Carport pricing release before applying this update.')

const current = data.metadata.solarPricing
const next = {
  ...current,
  costs: {
    ...current.costs,
    anchorBracketEach: 350,
    armBracketEach: 175,
  },
  revision: Number(current.revision || 0) + 1,
  savedAt: new Date().toISOString(),
  provisionalAllowances: true,
  connectionAssumption: 'One rear-post bracket and one shared diagonal bracket per frame; two anchors per bracket.',
}

const { error: updateError } = await client
  .from('os_catalog_items')
  .update({
    metadata: {
      ...data.metadata,
      previousRelease: current,
      solarPricing: next,
    },
  })
  .eq('id', data.id)
  .eq('metadata->solarPricing->>revision', String(current.revision))

if (updateError) throw updateError
console.log(`Atlas Solar Carport pricing revision ${next.revision} published with updated provisional connection assumptions.`)
