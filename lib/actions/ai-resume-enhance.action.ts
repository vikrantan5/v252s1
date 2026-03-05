"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function enhanceResumeText(
  text: string,
  context: "summary" | "experience" | "project" | "achievement"
): Promise<{ success: boolean; enhancedText?: string; error?: string }> {
  try {
    if (!text || text.trim().length === 0) {
      return { success: false, error: "Text cannot be empty" };
    }

    let prompt = "";

    switch (context) {
      case "summary":
        prompt = `Improve the following professional summary to make it compelling, concise, and recruiter-friendly. Use strong action words and highlight key strengths. Keep it to 2-3 sentences. Return ONLY the improved text without any additional commentary.

Text:
${text}`;
        break;

      case "experience":
        prompt = `Convert the following work experience description into professional resume bullet points. Use strong action verbs (Led, Developed, Implemented, Optimized, etc.), quantify achievements where possible, and make it impactful. Format as bullet points starting with "•". Return ONLY the improved bullet points without any additional commentary.

Text:
${text}`;
        break;

      case "project":
        prompt = `Improve the following project description for a resume. Make it concise, professional, and highlight the impact and technologies used. Use strong action verbs and format as bullet points starting with "•". Return ONLY the improved text without any additional commentary.

Text:
${text}`;
        break;

      case "achievement":
        prompt = `Improve the following achievement/award description for a resume. Make it impactful and concise while highlighting the significance. Return ONLY the improved text without any additional commentary.

Text:
${text}`;
        break;

      default:
        return { success: false, error: "Invalid context" };
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhancedText = completion.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      return { success: false, error: "Failed to enhance text" };
    }

    return { success: true, enhancedText };
  } catch (error: any) {
    console.error("AI enhancement error:", error);
    return { success: false, error: error.message || "Failed to enhance text" };
  }
}

export async function suggestSkills(
  currentSkills: string[],
  jobRole?: string
): Promise<{ success: boolean; suggestedSkills?: string[]; error?: string }> {
  try {
    const prompt = `Based on these existing skills: ${currentSkills.join(", ")}${
      jobRole ? ` for a ${jobRole} role` : ""
    }, suggest 5-7 additional relevant skills that would strengthen the resume. Return ONLY the skill names separated by commas, no explanations.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      return { success: false, error: "Failed to suggest skills" };
    }

    const suggestedSkills = response
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
      .slice(0, 7);

    return { success: true, suggestedSkills };
  } catch (error: any) {
    console.error("Skill suggestion error:", error);
    return { success: false, error: error.message || "Failed to suggest skills" };
  }
}
