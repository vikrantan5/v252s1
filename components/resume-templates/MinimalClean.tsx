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

export default function MinimalCleanTemplate({
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
    <div className="w-full p-10 bg-white text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header - Centered */}
      <div className="text-center border-b border-gray-300 pb-6 mb-6">
        <h1 className="text-3xl font-light mb-2">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.title && (
          <h2 className="text-lg text-gray-600 mb-3 font-light">{personalInfo.title}</h2>
        )}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>•</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>•</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {(personalInfo.linkedin || personalInfo.github || personalInfo.portfolio) && (
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 mt-2">
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.github && <span>•</span>}
            {personalInfo.github && <span>{personalInfo.github}</span>}
            {personalInfo.portfolio && <span>•</span>}
            {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-700 italic leading-relaxed max-w-3xl mx-auto">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && experience[0].title && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-center">Experience</h3>
          {experience.map((exp, index) => (
            <div key={index} className="mb-5">
              <div className="text-center mb-2">
                <h4 className="font-semibold text-base">{exp.title}</h4>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-xs text-gray-500">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  {exp.location && ` • ${exp.location}`}
                </p>
              </div>
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <div className="text-sm text-gray-700 space-y-1">
                  {exp.responsibilities.map((resp, i) => (
                    resp && <p key={i} className="leading-relaxed">• {resp}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && education[0].degree && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-center">Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="mb-4 text-center">
              <h4 className="font-semibold text-base">{edu.degree}</h4>
              <p className="text-sm text-gray-600">{edu.institution}</p>
              <p className="text-xs text-gray-500">
                {edu.startDate} - {edu.endDate}
                {edu.location && ` • ${edu.location}`}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </p>
              {edu.description && <p className="text-sm text-gray-600 mt-2">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical?.length || skills.soft?.length || skills.tools?.length || skills.frameworks?.length) && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-center">Skills</h3>
          <div className="text-center space-y-2 text-sm">
            {skills.technical && skills.technical.length > 0 && (
              <p><span className="font-semibold">Technical:</span> {skills.technical.join(" • ")}</p>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <p><span className="font-semibold">Tools:</span> {skills.tools.join(" • ")}</p>
            )}
            {skills.frameworks && skills.frameworks.length > 0 && (
              <p><span className="font-semibold">Frameworks:</span> {skills.frameworks.join(" • ")}</p>
            )}
            {skills.soft && skills.soft.length > 0 && (
              <p><span className="font-semibold">Soft Skills:</span> {skills.soft.join(" • ")}</p>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && projects[0].title && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-center">Projects</h3>
          {projects.map((project, index) => (
            <div key={index} className="mb-4 text-center">
              <h4 className="font-semibold text-base">{project.title}</h4>
              {project.description && <p className="text-sm text-gray-700 mt-1">{project.description}</p>}
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">{project.technologies.join(" • ")}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-center">Certifications</h3>
          {certifications.map((cert, index) => (
            <p key={index} className="text-sm text-gray-700 text-center mb-1">
              {cert.name} - {cert.issuer} ({cert.date})
            </p>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-center">Achievements</h3>
          {achievements.map((achievement, index) => (
            <div key={index} className="text-center mb-2">
              <p className="text-sm font-semibold">{achievement.title}</p>
              {achievement.description && <p className="text-xs text-gray-600">{achievement.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}