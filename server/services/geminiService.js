import { GoogleGenerativeAI } from "@google/generative-ai";
import Category from "../models/category.model.js";

class GeminiCategorizationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.cache = new Map();
  }

  async categorizeActivity(url, title, domain) {
    try {
      const normTitle = (title || "").toLowerCase().trim();
      const normDomain = (domain || "").toLowerCase().trim();
      const cacheKey = `${normTitle}::${normDomain}`;

      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const categories = await Category.find({}, "name description").lean();
      const categoryList = categories
        .map(cat => `${cat.name}: ${cat.description}`)
        .join("\n");

      const prompt = `
You are a classification AI. Categorize the following web activity based on title and domain.

Consider these factors:
- Domains like "youtube.com" can contain Entertainment, Education, or News.
- Titles with words like "course", "tutorial", "lecture" → likely Education.
- Titles like "trailer", "vlog", "funny", "music", "prank" → likely Entertainment.

Examples:
Title: CHETAK | चेतक | JAGIRDAR RV | MR. MAXX
Domain: youtube.com
Category: Entertainment

Title: Complete Machine Learning Course for Beginners | Part 1- Foundation | Sheryians AI School
Domain: youtube.com
Category: Education

Available Categories:
${categoryList}

Now analyze this:
Title: ${title || "No title"}
Domain: ${domain}

Respond in this exact JSON format:
{
  "category": "exact category name from the list above",
  "confidence": number between 0.1-1.0,
  "reasoning": "brief explanation",
  "productivityScore": number between 1-10,
  "tags": ["tag1", "tag2", "tag3"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let analysis;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.warn("Failed to parse Gemini response:", text);
        return this.getFallbackCategory(domain, title);
      }

      const validCategory = await Category.findOne({ name: analysis.category });
      if (!validCategory) {
        analysis.category = "Unknown";
      }

      analysis.confidence = Math.max(
        0.1,
        Math.min(1.0, analysis.confidence || 0.5)
      );
      analysis.productivityScore = Math.max(
        1,
        Math.min(10, analysis.productivityScore || 5)
      );
      analysis.tags = Array.isArray(analysis.tags)
        ? analysis.tags
            .map(t => t.toLowerCase().replace(/[^a-z0-9]/gi, ""))
            .filter((t, i, arr) => t && arr.indexOf(t) === i)
            .slice(0, 5)
        : [];
      analysis.processedAt = new Date();

      if (analysis.confidence > 0.7) {
        this.cache.set(cacheKey, analysis);
        if (this.cache.size > 1000) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
      }

      return analysis;
    } catch (error) {
      console.error("Gemini categorization error:", error);
      return this.getFallbackCategory(domain, title);
    }
  }

  getFallbackCategory(domain, title = "") {
    const domainLower = domain.toLowerCase();
    const titleLower = title.toLowerCase();

    const patterns = {
      Work: [
        "github",
        "gitlab",
        "jira",
        "slack",
        "teams",
        "office",
        "google.com/drive",
        "docs.google",
        "notion"
      ],
      "Social Media": [
        "facebook",
        "twitter",
        "instagram",
        "linkedin",
        "tiktok",
        "snapchat",
        "reddit",
        "discord"
      ],
      Entertainment: [
        "youtube",
        "netflix",
        "spotify",
        "twitch",
        "hulu",
        "disney",
        "amazon.com/prime"
      ],
      Education: [
        "coursera",
        "udemy",
        "edx",
        "khanacademy",
        "stackoverflow",
        "wikipedia",
        "mit.edu",
        ".edu"
      ],
      News: [
        "cnn",
        "bbc",
        "reuters",
        "nytimes",
        "guardian",
        "news",
        "techcrunch"
      ],
      Shopping: [
        "amazon",
        "ebay",
        "shopify",
        "etsy",
        "aliexpress",
        "walmart",
        "target"
      ],
      Communication: [
        "gmail",
        "outlook",
        "mail",
        "messenger",
        "whatsapp",
        "telegram"
      ],
      Development: [
        "github",
        "gitlab",
        "stackoverflow",
        "codepen",
        "replit",
        "developer"
      ],
      Finance: [
        "bank",
        "paypal",
        "stripe",
        "coinbase",
        "robinhood",
        "mint",
        "finance"
      ]
    };

    for (const [category, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => domainLower.includes(keyword))) {
        return {
          category,
          confidence: 0.6,
          reasoning: `Fallback categorization based on domain pattern: ${domain}`,
          productivityScore: ["Work", "Education"].includes(category) ? 8 : 5,
          tags: [domain.split(".")[0]],
          processedAt: new Date()
        };
      }
    }

    // YouTube-specific fallback logic
    if (domainLower.includes("youtube")) {
      if (/course|tutorial|lecture|class|how to/.test(titleLower)) {
        return {
          category: "Education",
          confidence: 0.75,
          reasoning: "YouTube title suggests educational content",
          productivityScore: 8,
          tags: ["youtube", "education"],
          processedAt: new Date()
        };
      } else if (/vlog|trailer|funny|music|prank|reaction/.test(titleLower)) {
        return {
          category: "Entertainment",
          confidence: 0.7,
          reasoning: "YouTube title suggests entertainment content",
          productivityScore: 4,
          tags: ["youtube", "entertainment"],
          processedAt: new Date()
        };
      }
    }

    return {
      category: "Unknown",
      confidence: 0.3,
      reasoning: "Unable to categorize based on title and domain",
      productivityScore: 5,
      tags: [domain.split(".")[0]],
      processedAt: new Date()
    };
  }

  async batchCategorize(activities) {
    const results = [];

    for (const activity of activities) {
      try {
        const analysis = await this.categorizeActivity(
          activity.url,
          activity.title,
          activity.domain
        );
        results.push({ ...activity, analysis });

        // Delay to avoid rate-limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error categorizing activity ${activity.url}:`, error);
        results.push({
          ...activity,
          analysis: this.getFallbackCategory(activity.domain, activity.title)
        });
      }
    }

    return results;
  }
}

export default new GeminiCategorizationService();
