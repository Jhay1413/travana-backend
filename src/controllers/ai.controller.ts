import { formatPost } from "../lib/formatPost";
import { parsedInput } from "../lib/parsedInput";
import { AiService } from "../service/ai.service";
import { travelDealSchema } from "../types/modules/transaction";
import { Request, Response } from "express";

const service = AiService();

export const AiController = {

  generatePost: async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text data is required" });
      }
      const parsedData = parsedInput(text);

      const validationResult = travelDealSchema.safeParse(parsedData);
      if (!validationResult.success) {
        const errors = validationResult.error
        return res.status(400).json({
          message: "Invalid travel deal data. Please check the format.",
          errors
        });
      }
      const deal = validationResult.data;

      // Extract destination from title (everything before common separators like -, |, :)
      const destination = deal.title.split(/[-|:]/)[0].trim() || deal.title;

      // Generate subtitle if it's empty, and generate resort summary and hashtags in parallel
      let subtitle = deal.subtitle || "";

      // Run AI calls in parallel for better performance
      const [generatedSubtitle, resortSummary, hashtags] = await Promise.all([
        subtitle ? Promise.resolve(subtitle) : service.generateSubtitle(deal.title),
        service.generateResortSummary(deal.title),
        service.generateHashtags(deal.title, destination)
      ]);

      subtitle = generatedSubtitle;

      // Format the post
      const post = formatPost(deal, subtitle, resortSummary, hashtags);

      return res.json({
        post,
        subtitle,
        resortSummary,
        hashtags,
        deal
      });


    } catch (error) {
      console.error("Error generating post:", error);
      return res.status(500).json({
        message: "Failed to generate post. Please try again."
      });
    }

  }
}