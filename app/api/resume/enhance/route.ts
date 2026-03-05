import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, type } = await request.json();

    if (!text || !type) {
      return NextResponse.json(
        { error: "Text and type are required" },
        { status: 400 }
      );
    }

    let prompt = "";

    switch (type) {
      case "summary":
        prompt = `Improve the following professional summary to make it professional, concise, and recruiter-friendly. Use strong action verbs and clear language. Keep it to 3-4 sentences. Do not add any extra formatting, just return the improved text.

Text:
${text}

Improved version:`;
        break;

      case "experience":
        prompt = `Convert the following work experience description into professional bullet points. Each bullet point should:
- Start with a strong action verb
- Be concise and impactful
- Quantify achievements where possible
- Focus on results and impact
- Be recruiter-friendly

Return only the bullet points, one per line, starting with "•". Do not add any extra text or formatting.

Text:
${text}

Improved bullet points:`;
        break;

      case "project":
        prompt = `Improve the following project description to make it professional and highlight technical skills and impact. Convert it into clear bullet points that show what you built, technologies used, and impact. Return only the improved bullet points starting with "•".

Text:
${text}

Improved description:`;
        break;

      case "skills":
        prompt = `Given the following skills, organize and suggest additional relevant skills that might be missing. Group them logically and return a JSON object with categories: technical, tools, frameworks. Return ONLY valid JSON, nothing else.

Skills:
${text}

Improved skills JSON:`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid enhancement type" },
          { status: 400 }
        );
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

    const enhancedText = completion.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({ enhancedText });
  } catch (error: any) {
    console.error("AI Enhancement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enhance text" },
      { status: 500 }
    );
  }
}
