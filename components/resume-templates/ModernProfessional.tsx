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

export default function ModernProfessionalTemplate({
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
    <div className="w-full p-8 bg-white text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-4 mb-6">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.title && (
          <h2 className="text-xl text-gray-700 mb-3">{personalInfo.title}</h2>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && <span>✉ {personalInfo.email}</span>}
          {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
          {personalInfo.github && <span>💻 {personalInfo.github}</span>}
          {personalInfo.portfolio && <span>🌐 {personalInfo.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-2 uppercase">Professional Summary</h3>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && experience[0].title && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase">Work Experience</h3>
          {experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="font-bold text-gray-900">{exp.title}</h4>
                  <p className="text-gray-700">{exp.company}{exp.location && `, ${exp.location}`}</p>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="list-none ml-0 text-sm text-gray-700 space-y-1">
                  {exp.responsibilities.map((resp, i) => (
                    resp && <li key={i}>• {resp}</li>
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
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase">Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                  <p className="text-gray-700">{edu.institution}{edu.location && `, ${edu.location}`}</p>
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              {edu.description && <p className="text-sm text-gray-600 mt-1">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical?.length || skills.soft?.length || skills.tools?.length || skills.frameworks?.length) && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase">Skills</h3>
          <div className="grid grid-cols-2 gap-3">
            {skills.technical && skills.technical.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Technical:</h4>
                <p className="text-sm text-gray-700">{skills.technical.join(", ")}</p>
              </div>
            )}
            {skills.soft && skills.soft.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Soft Skills:</h4>
                <p className="text-sm text-gray-700">{skills.soft.join(", ")}</p>
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Tools:</h4>
                <p className="text-sm text-gray-700">{skills.tools.join(", ")}</p>
              </div>
            )}
            {skills.frameworks && skills.frameworks.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Frameworks:</h4>
                <p className="text-sm text-gray-700">{skills.frameworks.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && projects[0].title && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase">Projects</h3>
          {projects.map((project, index) => (
            <div key={index} className="mb-3">
              <h4 className="font-bold text-gray-900">{project.title}</h4>
              {project.description && <p className="text-sm text-gray-700 mb-1">{project.description}</p>}
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tech:</span> {project.technologies.join(", ")}
                </p>
              )}
              <div className="flex gap-3 text-sm text-blue-600 mt-1">
                {project.github && <span>GitHub: {project.github}</span>}
                {project.liveLink && <span>Live: {project.liveLink}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase">Certifications</h3>
          {certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <p className="text-gray-900">
                <span className="font-semibold">{cert.name}</span> - {cert.issuer} ({cert.date})
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase">Achievements</h3>
          {achievements.map((achievement, index) => (
            <div key={index} className="mb-2">
              <p className="text-gray-900">
                <span className="font-semibold">{achievement.title}</span>
                {achievement.date && ` (${achievement.date})`}
              </p>
              {achievement.description && <p className="text-sm text-gray-600">{achievement.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}