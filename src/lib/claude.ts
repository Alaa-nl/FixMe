import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export interface DiagnosisResult {
  itemIdentification: string;
  problemDiagnosis: string;
  repairDifficulty: "Easy" | "Medium" | "Hard";
  estimatedCostMin: number;
  estimatedCostMax: number;
  fixOrReplace: "Fix" | "Replace" | "Either";
  fixOrReplaceReason: string;
  repairDescription: string;
  categorySuggestion: string;
  confidence: "Low" | "Medium" | "High";
}

const SYSTEM_PROMPT = `You are an expert repair diagnostic AI for FixMe, a Dutch repair marketplace. Analyze the photo(s) and respond in JSON only, no extra text. Be extremely concise — every text field must be ONE short sentence maximum (under 15 words). Provide:
{
  "itemIdentification": "Item name, brand/model if visible",
  "problemDiagnosis": "One short sentence: what is broken",
  "repairDifficulty": "Easy" | "Medium" | "Hard",
  "estimatedCostMin": number (euros),
  "estimatedCostMax": number (euros),
  "fixOrReplace": "Fix" | "Replace" | "Either",
  "fixOrReplaceReason": "One short sentence why",
  "repairDescription": "One short sentence: what the repair involves",
  "categorySuggestion": "One of: bikes-scooters, phones-tablets, laptops-computers, kitchen-appliances, laundry-appliances, home-electronics, furniture, clothing-shoes, plumbing, electrical, musical-instruments, garden-outdoor, cameras-optics, toys-games, other",
  "confidence": "Low" | "Medium" | "High"
}
Keep every text field under 15 words. Prices realistic for the Netherlands. Simple language.`;

export async function diagnoseItem(
  images: string[],
  categoryHint?: string
): Promise<DiagnosisResult> {
  try {
    // Prepare image content blocks
    const imageBlocks = images.map((image) => {
      // Check if it's a base64 string or URL
      if (image.startsWith("http://") || image.startsWith("https://")) {
        return {
          type: "image" as const,
          source: {
            type: "url" as const,
            url: image,
          },
        };
      } else {
        // Extract base64 data and media type
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Invalid base64 image format");
        }
        const mediaType = matches[1] as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp";
        const data = matches[2];

        return {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType,
            data: data,
          },
        };
      }
    });

    // Build user message
    let userMessage = "Please analyze this broken item and provide a diagnosis.";
    if (categoryHint) {
      userMessage += ` The user thinks this might be in the category: ${categoryHint}`;
    }

    // Create message with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const message = await anthropic.messages.create(
        {
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          messages: [
            {
              role: "user",
              content: [
                ...imageBlocks,
                {
                  type: "text",
                  text: userMessage,
                },
              ],
            },
          ],
          system: SYSTEM_PROMPT,
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Extract text from response
      let responseText =
        message.content[0].type === "text" ? message.content[0].text : "";

      // Strip markdown code fences if the model wraps its JSON in ```json ... ```
      responseText = responseText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

      // Parse JSON response
      const diagnosis = JSON.parse(responseText) as DiagnosisResult;

      return diagnosis;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Error diagnosing item:", error);

    // Return fallback object
    return {
      itemIdentification: "Unable to identify the item from the photo",
      problemDiagnosis: "Unable to diagnose the problem. Please provide more details manually.",
      repairDifficulty: "Medium",
      estimatedCostMin: 20,
      estimatedCostMax: 100,
      fixOrReplace: "Either",
      fixOrReplaceReason: "Cannot make a recommendation without proper analysis",
      repairDescription: "A repair person will need to inspect the item in person to provide an accurate assessment.",
      categorySuggestion: "other",
      confidence: "Low",
    };
  }
}
