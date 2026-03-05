import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import type { UserResume } from "@/lib/actions/resume-builder.action";

// Generate HTML for resume based on template
function generateResumeHTML(resume: UserResume, template: string): string {
  const { personal_info, summary, education, experience, skills, projects, certifications, achievements } = resume;

  // Base styles
  const baseStyles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #333; }
      .container { padding: 40px; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 24pt; margin-bottom: 5px; }
      h2 { font-size: 14pt; margin-top: 20px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #333; }
      h3 { font-size: 12pt; margin-bottom: 5px; }
      p { margin-bottom: 8px; }
      ul { margin-left: 20px; margin-bottom: 10px; }
      li { margin-bottom: 5px; }
      .contact-info { font-size: 10pt; color: #666; margin-bottom: 15px; }
      .section { margin-bottom: 20px; }
      .item { margin-bottom: 15px; }
      .item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
      .item-title { font-weight: bold; }
      .item-subtitle { color: #666; font-style: italic; }
      .item-date { color: #666; font-size: 10pt; }
      .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
      .skill-tag { padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 10pt; display: inline-block; }
    </style>
  `;

  // Template-specific styles
  let templateStyles = "";
  if (template === "modern") {
    templateStyles = `
      <style>
        h1 { color: #667eea; }
        h2 { color: #667eea; border-bottom-color: #667eea; }
        .skill-tag { background: #e0e7ff; color: #4c51bf; }
      </style>
    `;
  } else if (template === "minimal") {
    templateStyles = `
      <style>
        h1 { font-weight: 300; }
        h2 { border-bottom: 1px solid #e0e0e0; font-weight: 400; }
        .skill-tag { background: white; border: 1px solid #ddd; }
      </style>
    `;
  } else if (template === "ats-friendly") {
    templateStyles = `
      <style>
        body { font-family: 'Times New Roman', serif; }
        h2 { text-transform: uppercase; border-bottom: none; font-weight: bold; }
        .skill-tag { background: none; padding: 0; margin-right: 10px; }
      </style>
    `;
  }

  // Build HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${baseStyles}
      ${templateStyles}
    </head>
    <body>
      <div class="container">
        <h1>${personal_info.fullName || "Your Name"}</h1>
        ${personal_info.title ? `<p style="font-size: 12pt; color: #666; margin-bottom: 5px;">${personal_info.title}</p>` : ""}
        <div class="contact-info">
          ${personal_info.email || ""} ${personal_info.phone ? `• ${personal_info.phone}` : ""}
          ${personal_info.location ? `• ${personal_info.location}` : ""}
          ${personal_info.linkedin ? `• <a href="${personal_info.linkedin}">LinkedIn</a>` : ""}
          ${personal_info.github ? `• <a href="${personal_info.github}">GitHub</a>` : ""}
        </div>
  `;

  // Summary
  if (summary) {
    htmlContent += `
      <div class="section">
        <h2>Professional Summary</h2>
        <p>${summary}</p>
      </div>
    `;
  }

  // Experience
  if (experience && experience.length > 0) {
    htmlContent += `<div class="section"><h2>Work Experience</h2>`;
    experience.forEach((exp) => {
      htmlContent += `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${exp.title}</div>
              <div class="item-subtitle">${exp.company}${exp.location ? ` - ${exp.location}` : ""}</div>
            </div>
            <div class="item-date">${exp.startDate} - ${exp.current ? "Present" : exp.endDate || "Present"}</div>
          </div>
          ${
            exp.responsibilities && exp.responsibilities.length > 0
              ? `<ul>${exp.responsibilities.map((r) => `<li>${r}</li>`).join("")}</ul>`
              : ""
          }
        </div>
      `;
    });
    htmlContent += `</div>`;
  }

  // Education
  if (education && education.length > 0) {
    htmlContent += `<div class="section"><h2>Education</h2>`;
    education.forEach((edu) => {
      htmlContent += `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${edu.degree}</div>
              <div class="item-subtitle">${edu.institution}${edu.location ? ` - ${edu.location}` : ""}</div>
            </div>
            <div class="item-date">${edu.startDate} - ${edu.endDate || "Present"}</div>
          </div>
          ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ""}
          ${edu.description ? `<p>${edu.description}</p>` : ""}
        </div>
      `;
    });
    htmlContent += `</div>`;
  }

  // Skills
  if (skills && (skills.technical?.length || skills.tools?.length || skills.frameworks?.length)) {
    htmlContent += `<div class="section"><h2>Skills</h2>`;
    if (skills.technical && skills.technical.length > 0) {
      htmlContent += `
        <div style="margin-bottom: 10px;">
          <strong>Technical:</strong>
          <div class="skills-list">
            ${skills.technical.map((s) => `<span class="skill-tag">${s}</span>`).join("")}
          </div>
        </div>
      `;
    }
    if (skills.tools && skills.tools.length > 0) {
      htmlContent += `
        <div style="margin-bottom: 10px;">
          <strong>Tools:</strong>
          <div class="skills-list">
            ${skills.tools.map((s) => `<span class="skill-tag">${s}</span>`).join("")}
          </div>
        </div>
      `;
    }
    if (skills.frameworks && skills.frameworks.length > 0) {
      htmlContent += `
        <div style="margin-bottom: 10px;">
          <strong>Frameworks:</strong>
          <div class="skills-list">
            ${skills.frameworks.map((s) => `<span class="skill-tag">${s}</span>`).join("")}
          </div>
        </div>
      `;
    }
    htmlContent += `</div>`;
  }

  // Projects
  if (projects && projects.length > 0) {
    htmlContent += `<div class="section"><h2>Projects</h2>`;
    projects.forEach((project) => {
      htmlContent += `
        <div class="item">
          <div class="item-title">${project.title}</div>
          <p>${project.description}</p>
          ${
            project.technologies && project.technologies.length > 0
              ? `<div class="skills-list">${project.technologies.map((t) => `<span class="skill-tag">${t}</span>`).join("")}</div>`
              : ""
          }
          ${project.github ? `<p><a href="${project.github}">GitHub</a></p>` : ""}
        </div>
      `;
    });
    htmlContent += `</div>`;
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    htmlContent += `<div class="section"><h2>Certifications</h2>`;
    certifications.forEach((cert) => {
      htmlContent += `
        <div class="item">
          <div class="item-header">
            <div class="item-title">${cert.name}</div>
            <div class="item-date">${cert.date}</div>
          </div>
          <div class="item-subtitle">${cert.issuer}</div>
        </div>
      `;
    });
    htmlContent += `</div>`;
  }

  // Achievements
  if (achievements && achievements.length > 0) {
    htmlContent += `<div class="section"><h2>Achievements</h2><ul>`;
    achievements.forEach((achievement) => {
      htmlContent += `<li><strong>${achievement.title}</strong>${achievement.description ? ` - ${achievement.description}` : ""}</li>`;
    });
    htmlContent += `</ul></div>`;
  }

  htmlContent += `
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { resume, template } = await request.json();

    if (!resume) {
      return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
    }

    // Generate HTML
    const html = generateResumeHTML(resume, template || "modern");

    // Launch Playwright browser
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Set content and generate PDF
    await page.setContent(html);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    });

    await browser.close();

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    if (browser) await browser.close();
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 });
  }
}
