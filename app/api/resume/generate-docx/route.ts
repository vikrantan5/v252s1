import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from "docx";
import type { UserResume } from "@/lib/actions/resume-builder.action";

export async function POST(request: NextRequest) {
  try {
    const { resume } = await request.json();

    if (!resume) {
      return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
    }

    const { personal_info, summary, education, experience, skills, projects, certifications, achievements }: UserResume = resume;

    // Create document sections
    const sections: Paragraph[] = [];

    // Header - Name and Contact
    sections.push(
      new Paragraph({
        text: personal_info.fullName || "Your Name",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    if (personal_info.title) {
      sections.push(
        new Paragraph({
          text: personal_info.title,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }

    // Contact info
    const contactParts = [
      personal_info.email,
      personal_info.phone,
      personal_info.location,
      personal_info.linkedin,
      personal_info.github,
    ].filter(Boolean);

    if (contactParts.length > 0) {
      sections.push(
        new Paragraph({
          text: contactParts.join(" | "),
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Professional Summary
    if (summary) {
      sections.push(
        new Paragraph({
          text: "PROFESSIONAL SUMMARY",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
      sections.push(
        new Paragraph({
          text: summary,
          spacing: { after: 200 },
        })
      );
    }

    // Work Experience
    if (experience && experience.length > 0) {
      sections.push(
        new Paragraph({
          text: "WORK EXPERIENCE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      experience.forEach((exp) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.title, bold: true }),
              new TextRun({ text: ` - ${exp.company}`, italics: true }),
            ],
            spacing: { after: 50 },
          })
        );

        const dateLocation = `${exp.startDate} - ${exp.current ? "Present" : exp.endDate || "Present"}${exp.location ? ` | ${exp.location}` : ""}`;
        sections.push(
          new Paragraph({
            text: dateLocation,
            spacing: { after: 100 },
          })
        );

        if (exp.responsibilities && exp.responsibilities.length > 0) {
          exp.responsibilities.forEach((resp) => {
            sections.push(
              new Paragraph({
                text: `• ${resp}`,
                spacing: { after: 50 },
              })
            );
          });
        }

        sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      });
    }

    // Education
    if (education && education.length > 0) {
      sections.push(
        new Paragraph({
          text: "EDUCATION",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      education.forEach((edu) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true }),
              new TextRun({ text: ` - ${edu.institution}`, italics: true }),
            ],
            spacing: { after: 50 },
          })
        );

        const dateLocation = `${edu.startDate} - ${edu.endDate || "Present"}${edu.location ? ` | ${edu.location}` : ""}`;
        sections.push(
          new Paragraph({
            text: dateLocation,
            spacing: { after: 50 },
          })
        );

        if (edu.gpa) {
          sections.push(
            new Paragraph({
              text: `GPA: ${edu.gpa}`,
              spacing: { after: 50 },
            })
          );
        }

        if (edu.description) {
          sections.push(
            new Paragraph({
              text: edu.description,
              spacing: { after: 100 },
            })
          );
        }
      });
    }

    // Skills
    if (skills && (skills.technical?.length || skills.tools?.length || skills.frameworks?.length)) {
      sections.push(
        new Paragraph({
          text: "SKILLS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      if (skills.technical && skills.technical.length > 0) {
        sections.push(
          new Paragraph({
            text: `Technical: ${skills.technical.join(", ")}`,
            spacing: { after: 50 },
          })
        );
      }

      if (skills.tools && skills.tools.length > 0) {
        sections.push(
          new Paragraph({
            text: `Tools: ${skills.tools.join(", ")}`,
            spacing: { after: 50 },
          })
        );
      }

      if (skills.frameworks && skills.frameworks.length > 0) {
        sections.push(
          new Paragraph({
            text: `Frameworks: ${skills.frameworks.join(", ")}`,
            spacing: { after: 100 },
          })
        );
      }
    }

    // Projects
    if (projects && projects.length > 0) {
      sections.push(
        new Paragraph({
          text: "PROJECTS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      projects.forEach((project) => {
        sections.push(
          new Paragraph({
            text: project.title,
            bold: true,
            spacing: { after: 50 },
          })
        );

        sections.push(
          new Paragraph({
            text: project.description,
            spacing: { after: 50 },
          })
        );

        if (project.technologies && project.technologies.length > 0) {
          sections.push(
            new Paragraph({
              text: `Technologies: ${project.technologies.join(", ")}`,
              spacing: { after: 100 },
            })
          );
        }
      });
    }

    // Certifications
    if (certifications && certifications.length > 0) {
      sections.push(
        new Paragraph({
          text: "CERTIFICATIONS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      certifications.forEach((cert) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name, bold: true }),
              new TextRun({ text: ` - ${cert.issuer}` }),
              new TextRun({ text: ` (${cert.date})`, italics: true }),
            ],
            spacing: { after: 50 },
          })
        );
      });
    }

    // Achievements
    if (achievements && achievements.length > 0) {
      sections.push(
        new Paragraph({
          text: "ACHIEVEMENTS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      achievements.forEach((achievement) => {
        sections.push(
          new Paragraph({
            text: `• ${achievement.title}${achievement.description ? ` - ${achievement.description}` : ""}`,
            spacing: { after: 50 },
          })
        );
      });
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc);

    // Return DOCX as response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="resume-${Date.now()}.docx"`,
      },
    });
  } catch (error: any) {
    console.error("DOCX generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate DOCX" }, { status: 500 });
  }
}
