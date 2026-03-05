import React from "react";
import type {
  PersonalInfo,
  Education,
  Experience,
  Skills,
  Project,
  Certification,
  Achievement,
} from "@/lib/actions/resume-builder.action";

interface TemplateProps {
  personalInfo: PersonalInfo;
  summary?: string;
  education: Education[];
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
}

export default function ATSFriendlyTemplate({
  personalInfo,
  summary,
  education,
  experience,
  skills,
  projects,
  certifications,
  achievements,
}: TemplateProps) {
  return (
    <div className="w-full p-8 bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header - Simple and ATS-friendly */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.title && (
          <p className="text-base mb-2">{personalInfo.title}</p>
        )}
        <div className="text-sm space-y-1">
          {personalInfo.email && <p>Email: {personalInfo.email}</p>}
          {personalInfo.phone && <p>Phone: {personalInfo.phone}</p>}
          {personalInfo.location && <p>Location: {personalInfo.location}</p>}
          {personalInfo.linkedin && <p>LinkedIn: {personalInfo.linkedin}</p>}
          {personalInfo.github && <p>GitHub: {personalInfo.github}</p>}
          {personalInfo.portfolio && <p>Portfolio: {personalInfo.portfolio}</p>}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase mb-2 border-b border-black pb-1">PROFESSIONAL SUMMARY</h2>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {experience.length > 0 && experience[0].title && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1">WORK EXPERIENCE</h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <p className="font-bold">{exp.title}</p>
              <p>{exp.company}{exp.location && `, ${exp.location}`}</p>
              <p className="text-sm italic">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
              </p>
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="list-disc ml-5 text-sm mt-2 space-y-1">
                  {exp.responsibilities.map((resp, i) => (
                    resp && <li key={i}>{resp}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && education[0].degree && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1">EDUCATION</h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-3">
              <p className="font-bold">{edu.degree}</p>
              <p>{edu.institution}{edu.location && `, ${edu.location}`}</p>
              <p className="text-sm italic">{edu.startDate} - {edu.endDate}</p>
              {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
              {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical?.length || skills.soft?.length || skills.tools?.length || skills.frameworks?.length) && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1">SKILLS</h2>
          <div className="space-y-2 text-sm">
            {skills.technical && skills.technical.length > 0 && (
              <p><span className="font-bold">Technical Skills:</span> {skills.technical.join(", ")}</p>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <p><span className="font-bold">Tools:</span> {skills.tools.join(", ")}</p>
            )}
            {skills.frameworks && skills.frameworks.length > 0 && (
              <p><span className="font-bold">Frameworks:</span> {skills.frameworks.join(", ")}</p>
            )}
            {skills.languages && skills.languages.length > 0 && (
              <p><span className="font-bold">Languages:</span> {skills.languages.join(", ")}</p>
            )}
            {skills.soft && skills.soft.length > 0 && (
              <p><span className="font-bold">Soft Skills:</span> {skills.soft.join(", ")}</p>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && projects[0].title && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1">PROJECTS</h2>
          {projects.map((project, index) => (
            <div key={index} className="mb-3">
              <p className="font-bold">{project.title}</p>
              {project.description && <p className="text-sm mt-1">{project.description}</p>}
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-sm"><span className="font-bold">Technologies:</span> {project.technologies.join(", ")}</p>
              )}
              {project.github && <p className="text-sm">GitHub: {project.github}</p>}
              {project.liveLink && <p className="text-sm">Live: {project.liveLink}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1">CERTIFICATIONS</h2>
          {certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <p className="font-bold">{cert.name}</p>
              <p className="text-sm">{cert.issuer}, {cert.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase mb-3 border-b border-black pb-1">ACHIEVEMENTS</h2>
          {achievements.map((achievement, index) => (
            <div key={index} className="mb-2">
              <p className="font-bold">{achievement.title}</p>
              {achievement.description && <p className="text-sm">{achievement.description}</p>}
              {achievement.date && <p className="text-sm italic">{achievement.date}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}