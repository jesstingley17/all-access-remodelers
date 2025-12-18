import OpenAI from "openai";

// OpenAI configuration - requires OPENAI_API_KEY environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const MODEL = "gpt-5";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Chat completion for the chatbot
export async function getChatCompletion(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: systemPrompt || `You are a helpful assistant for All Access Remodelers, a professional company offering construction, property management, and cleaning services. 

Key information about the company:
- Services: Construction & Renovation, Property Management, Cleaning Services
- Areas of expertise: Kitchen remodels, bathroom renovations, home additions, commercial renovations, rental property management, deep cleaning, move-in/move-out cleaning
- Professional, reliable, and experienced team
- Free estimates available

Be friendly, professional, and helpful. Answer questions about services, provide general advice about home improvement projects, and encourage visitors to contact the company for detailed quotes. If asked about specific pricing, explain that prices vary based on project scope and recommend requesting a free estimate.`
  };

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [systemMessage, ...messages],
    max_completion_tokens: 1024,
  });

  return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
}

// Generate project quote estimate
export async function generateQuoteEstimate(projectDetails: {
  serviceType: string;
  projectDescription: string;
  squareFootage?: string;
  timeline?: string;
  location?: string;
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured. Please contact us directly for a quote.");
  }

  const prompt = `Based on the following project details, provide a helpful estimate range and recommendations for a ${projectDetails.serviceType} project. Be informative but make clear these are rough estimates and a proper on-site assessment is needed for accurate pricing.

Project Details:
- Service Type: ${projectDetails.serviceType}
- Description: ${projectDetails.projectDescription}
${projectDetails.squareFootage ? `- Approximate Size: ${projectDetails.squareFootage} sq ft` : ""}
${projectDetails.timeline ? `- Desired Timeline: ${projectDetails.timeline}` : ""}
${projectDetails.location ? `- Location: ${projectDetails.location}` : ""}

Provide:
1. A rough estimate range (if applicable for this type of work)
2. Key factors that affect pricing
3. Recommendations for the project
4. Next steps to get an accurate quote

Format the response in a clear, professional manner.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable construction and remodeling expert providing helpful estimates and advice. Always emphasize that actual quotes require an on-site assessment. Be professional and helpful."
        },
        { role: "user", content: prompt }
      ],
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI model");
    }

    return content;
  } catch (error) {
    console.error("OpenAI API error in generateQuoteEstimate:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("AI service configuration error. Please contact us directly for a quote.");
      }
      throw error;
    }
    throw new Error("Failed to generate estimate. Please contact us directly for a quote.");
  }
}

// Generate content for admin (descriptions, marketing copy, etc.)
export async function generateContent(
  contentType: string,
  context: string
): Promise<string> {
  const prompts: Record<string, string> = {
    "project-description": `Write a professional, compelling description for a completed project. Context: ${context}. Keep it concise (2-3 sentences) and highlight the quality of work.`,
    "service-description": `Write a professional service description for: ${context}. Keep it informative and compelling, around 2-3 paragraphs.`,
    "testimonial-response": `Write a professional, warm response to thank a customer for their testimonial. Context: ${context}. Keep it brief and genuine.`,
    "marketing-copy": `Write compelling marketing copy for: ${context}. Make it engaging and professional, suitable for a construction/remodeling company.`,
  };

  const prompt = prompts[contentType] || `Generate professional content for: ${context}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a professional copywriter specializing in construction, remodeling, and property services. Write clear, compelling, and professional content."
      },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 1024,
  });

  return response.choices[0]?.message?.content || "Unable to generate content. Please try again.";
}

// Enhance image description for gallery
export async function enhanceImageDescription(
  title: string,
  category: string,
  existingDescription?: string
): Promise<string> {
  const prompt = `Generate a compelling, professional description for a gallery image of a completed project.

Title: ${title}
Category: ${category}
${existingDescription ? `Current Description: ${existingDescription}` : ""}

Write a concise but descriptive caption (2-3 sentences) that highlights the quality of work and appeals to potential customers. Do not use generic phrases - be specific and engaging.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a professional copywriter for a construction and remodeling company. Write compelling, specific descriptions for project photos."
      },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 256,
  });

  return response.choices[0]?.message?.content || existingDescription || "A quality project completed by our professional team.";
}
