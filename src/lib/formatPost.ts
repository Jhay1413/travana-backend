import { TravelDeal } from "@/types/modules/transaction";

// Emoji pools for title and subtitle only (these will be randomized)
const EMOJI_POOLS = {
  tropical: ['🏝️', '🌴', '🌺', '🌸', '🌊', '🏖️', '🥥'],
  subtitle: ['🌅', '✨', '🌟', '⭐', '💫', '🌠', '🎉']
};

/**
 * Pick a random emoji from a pool
 */
function pickRandomEmoji(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Format a travel deal into a Facebook post using the specified template
 */
export function formatPost(deal: TravelDeal, subtitle: string, resortSummary: string, hashtags: string): string {
  // Pick random emojis only for title and subtitle
  const tropicalEmoji = pickRandomEmoji(EMOJI_POOLS.tropical);
  const subtitleEmoji = pickRandomEmoji(EMOJI_POOLS.subtitle);

  const priceSection = deal.price
    ? `\n💸 Total cost from £${deal.price}pp\n`
    : '\n';

  return `${tropicalEmoji} ${deal.title} ${tropicalEmoji}
${subtitleEmoji} ${subtitle} ${subtitleEmoji}
📅 ${deal.travelDate}
🌙 ${deal.nights} Nights
🍽️ ${deal.boardBasis}
✈️ ${deal.departureAirport}
🧳 ${deal.luggageTransfers} 🚌
${priceSection}
To Book:
☎ Call us on 0191 594 7999
💬 Private message
📍 Pop in and see us
🌐 Visit our website: tinastraveldeals.co.uk
📸 Follow us on Instagram: https://www.instagram.com/tinastravel/

${resortSummary}

${hashtags}`;
}
