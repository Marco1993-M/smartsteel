const cards = [
  { slug: '20-sow-piggery', lines: ['Piggery', 'structures.'], description: 'Steel building shells for your production plan.', label: 'PIG HOUSING', drawing: 'piggery' },
  { slug: 'poultry-houses', lines: ['Poultry', 'houses.'], description: 'Steel shells shaped around flock, airflow & site.', label: 'BROILERS / LAYERS', drawing: 'poultry' },
  { slug: 'dairy-milking-sheds', lines: ['Dairy &', 'milking sheds.'], description: 'A structural shell built around the dairy workflow.', label: 'MILKING / DAIRY', drawing: 'dairy' },
  { slug: 'cattle-feedlot-sheds', lines: ['Cattle &', 'feedlot cover.'], description: 'Steel cover for shade, handling & farm operations.', label: 'CATTLE / FEEDLOT', drawing: 'cattle' },
  { slug: 'sheep-small-stock-sheds', lines: ['Sheep &', 'small-stock sheds.'], description: 'Practical steel cover for seasonal farm operations.', label: 'SHEEP / SMALL STOCK', drawing: 'sheep' },
  { slug: 'grain-farm-storage', lines: ['Grain &', 'farm storage.'], description: 'Steel buildings for storage, machinery & handling.', label: 'STORAGE / HANDLING', drawing: 'storage' },
  { slug: 'agricultural-buildings', lines: ['Built for', 'farm operations.'], description: 'Explore Atlas agricultural steel building shells.', label: 'AGRICULTURAL BUILDINGS', drawing: 'hub' },
].map(card => ({ ...card, imagePath: `/social/agriculture/${card.slug}-v1.png`, alt: `Atlas by Smart Steel — ${card.lines.join(' ')} ${card.description}` }))

export const AGRICULTURAL_SOCIAL_CARDS = cards
export function getAgriculturalSocialCard(slug) { return cards.find(card => card.slug === slug) || null }
export function agriculturalSocialMetadata(slug, title, description) {
  const card = getAgriculturalSocialCard(slug)
  if (!card) throw new Error(`Missing agricultural social preview for ${slug}`)
  const image = `https://www.smartsteel.co.za${card.imagePath}`
  return {
    images: [{ url: image, width: 1200, height: 630, type: 'image/png', alt: card.alt }],
    twitter: { card: 'summary_large_image', title, description, images: [{ url: image, alt: card.alt }] },
  }
}
