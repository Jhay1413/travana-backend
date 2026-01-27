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


export function formatPostHTML(deal: TravelDeal, subtitle: string, resortSummary: string, hashtags: string): string {
  const tropicalEmoji = pickRandomEmoji(EMOJI_POOLS.tropical);
  const subtitleEmoji = pickRandomEmoji(EMOJI_POOLS.subtitle);

  const priceSection = deal.price
    ? `💸 Total cost from £${deal.price}pp<br>`
    : '';

  return `${tropicalEmoji} ${deal.title} ${tropicalEmoji}<br>
${subtitleEmoji} ${subtitle} ${subtitleEmoji}<br>
<br>
📅 ${new Date(deal.travelDate).toLocaleDateString()}<br>
🌙 ${deal.nights} Nights<br>
${deal.boardBasis && deal.boardBasis != "N/A" ? `🍽️ ${deal.boardBasis}<br>` : ''}
${deal.departureAirport && deal.departureAirport != "N/A" ? `✈️ ${deal.departureAirport}<br>` : ''}
${deal.luggageTransfers && deal.luggageTransfers != "N/A" ? `🧳 ${deal.luggageTransfers} 🚌<br>` : ''}
<br>
${priceSection}<br>
${resortSummary}<br>
<br>To Book:<br>
☎ Call us on 0191 594 7999<br>
💬 Private message<br>
📍 Pop in and see us<br>
🌐 Visit our website: tinastraveldeals.co.uk<br>
📸 Follow us on Instagram: https://www.instagram.com/tinastravel/<br>
<br>
${hashtags}`;
}
export function formatPost(deal: TravelDeal, subtitle: string, resortSummary: string, hashtags: string): string {
  // Pick random emojis only for title and subtitle
  const tropicalEmoji = pickRandomEmoji(EMOJI_POOLS.tropical);
  const subtitleEmoji = pickRandomEmoji(EMOJI_POOLS.subtitle);

  const priceSection = deal.price
    ? `\n💸 Total cost from £${deal.price}pp\n`
    : '\n';
  return `${tropicalEmoji} ${deal.title} ${tropicalEmoji}
${subtitleEmoji} ${subtitle} ${subtitleEmoji}

📅 ${new Date(deal.travelDate).toLocaleDateString()}
🌙 ${deal.nights} Nights
🍽️ ${deal.boardBasis}
✈️ ${deal.departureAirport}
🧳 ${deal.luggageTransfers} 🚌
${priceSection}
${resortSummary}

To Book:
☎ Call us on 0191 594 7999
💬 Private message
📍 Pop in and see us
🌐 Visit our website: tinastraveldeals.co.uk
📸 Follow us on Instagram: https://www.instagram.com/tinastravel/

${hashtags}`;
}
