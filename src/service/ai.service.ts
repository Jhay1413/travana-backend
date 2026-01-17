import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI || "",
});

export const AiService = () => {
  // Define the helper method *inside* the factory
  const tryGenerateWithModel = async (title: string,destination:string, model: string) => {
    try {
      console.log(`[OpenAI] Trying model: ${model}`);

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a creative copywriter for travel deals. Write catchy subtitles.",
          },
          {
            role: "user",
            content: `Write a catchy subtitle (max 12 words) for: "${title}" in ${destination}. Be exciting and appealing. Return ONLY the subtitle text.`,
          },
        ],
        max_completion_tokens: 50,
      });

      const subtitle = response.choices[0]?.message?.content?.trim() || "";
      console.log(`[OpenAI] Model ${model} response:`, subtitle || "(empty)");
      return subtitle || null;
    } catch (error) {
      console.error(`[OpenAI] Model ${model} failed:`, error);
      return null;
    }
  };

  const generateSubtitle = async (title: string,destination:string) => {
    console.log(`[OpenAI] Generating subtitle for: "${title}"`);

    const models = ["gpt-5", "gpt-4.1", "gpt-4.1-mini", "gpt-5-mini"];

    for (const model of models) {
      const subtitle = await tryGenerateWithModel(title,destination, model);
      if (subtitle) {
        console.log(`[OpenAI] Success with ${model}: "${subtitle}"`);
        return subtitle;
      }
    }

    console.warn(`[OpenAI] All models failed, using fallback subtitle`);
    return "Discover amazing value on this incredible getaway";
  };
  const tryGenerateResortSummaryWithModel = async (title: string, destination: string, model: string) => {
    try {
      console.log(`[OpenAI] Trying model for resort summary: ${model}`);
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a travel expert who writes engaging resort and hotel descriptions."
          },
          {
            role: "user",
            content: `Write a brief, engaging resort summary put in like a bullet form but instead of bullet form make it an icon for "${title}" in ${destination}. Focus on what makes this destination special, the atmosphere, and key amenities. Return ONLY the summary text.
            it should start with 🌞 Why You’ll Love It:
            example :
            🌞 Why You’ll Love It:
            🏖️ Close to golden sands & turquoise waters

            NOTE!! MAKE SURE TO MAKE IT AS HTML ELEMENT SHOULD HAVE <BR> EACH
            `
          }
        ],
        max_completion_tokens: 150,
      });

      const summary = response.choices[0]?.message?.content?.trim() || "";
      console.log(`[OpenAI] Model ${model} resort summary:`, summary || "(empty)");
      return summary || null;
    } catch (error: any) {
      console.error(`[OpenAI] Model ${model} failed for resort summary:`, error.message);
      return null;
    }
  };
  const generateResortSummary = async (title: string, destination: string) => {
    console.log(`[OpenAI] Generating resort summary for: "${title}"`);

    // Try different models in order of preference
    const models = ["gpt-5", "gpt-4.1", "gpt-4.1-mini", "gpt-5-mini"];

    for (const model of models) {
      const summary = await tryGenerateResortSummaryWithModel(title, destination, model);
      if (summary) {
        console.log(`[OpenAI] Success with ${model} for resort summary`);
        return summary;
      }
    }

    // If all models fail, generate a simple fallback
    console.warn(`[OpenAI] All models failed for resort summary, using fallback`);
    return `Experience an unforgettable stay at this beautiful destination. Enjoy world-class amenities and exceptional service throughout your visit.`;
  };
  const tryGenerateHashtagsWithModel = async (title: string, destination: string, model: string) => {
    try {
      console.log(`[OpenAI] Trying model for hashtags: ${model}`);
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a social media expert who creates engaging hashtags for travel posts."
          },
          {
            role: "user",
            content: `Generate 8-12 relevant hashtags for a travel deal post about "${title}" to ${destination}. Focus on trending travel hashtags, destination-specific tags, and engagement-boosting tags. Return ONLY the hashtags separated by spaces, starting each with #.`
          }
        ],
        max_completion_tokens: 100,
      });

      const hashtags = response.choices[0]?.message?.content?.trim() || "";
      console.log(`[OpenAI] Model ${model} hashtags:`, hashtags || "(empty)");
      return hashtags || null;
    } catch (error: any) {
      console.error(`[OpenAI] Model ${model} failed for hashtags:`, error.message);
      return null;
    }
  };
  const generateHashtags = async (title: string, destination: string = "") => {
    console.log(`[OpenAI] Generating hashtags for: "${title}"`);

    // Try different models in order of preference
    const models = ["gpt-5", "gpt-4.1", "gpt-4.1-mini", "gpt-5-mini"];

    for (const model of models) {
      const hashtags = await tryGenerateHashtagsWithModel(title, destination, model);
      if (hashtags) {
        console.log(`[OpenAI] Success with ${model} for hashtags`);
        return hashtags;
      }
    }

    // If all models fail, generate a simple fallback
    console.warn(`[OpenAI] All models failed for hashtags, using fallback`);
    return `#TravelDeals #Vacation #Holiday #TravelGoals #Wanderlust #BeachLife #LuxuryTravel #TravelGram`;
  }

  return {
    generateHashtags,
    tryGenerateHashtagsWithModel,
    tryGenerateWithModel,
    generateSubtitle,
    tryGenerateResortSummaryWithModel,
    generateResortSummary
  };
};