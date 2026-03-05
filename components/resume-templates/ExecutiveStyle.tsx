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

export default function ExecutiveStyleTemplate({
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
    <div className="w-full p-10 bg-white text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header - Executive Style */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.title && (
          <h2 className="text-xl text-gray-700 mb-4 italic">{personalInfo.title}</h2>
        )}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {(personalInfo.linkedin || personalInfo.portfolio) && (
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mt-2">
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.portfolio && <span>|</span>}
            {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {summary && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
            EXECUTIVE SUMMARY
          </h3>
          <p className="text-base text-gray-700 leading-relaxed text-justify">{summary}</p>
        </div>
      )}

      {/* Professional Experience */}
      {experience.length > 0 && experience[0].title && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            PROFESSIONAL EXPERIENCE
          </h3>
          {experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{exp.title}</h4>
                  <p className="text-base text-gray-700 italic">{exp.company}{exp.location && `, ${exp.location}`}</p>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap font-semibold">
                  {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <ul className="list-disc ml-6 text-base text-gray-700 space-y-2 leading-relaxed">
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
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            EDUCATION
          </h3>
          {education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{edu.degree}</h4>
                  <p className="text-base text-gray-700">{edu.institution}{edu.location && `, ${edu.location}`}</p>
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap font-semibold">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
              {edu.description && <p className="text-sm text-gray-600 mt-2 italic">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Core Competencies / Skills */}
      {(skills.technical?.length || skills.soft?.length || skills.tools?.length || skills.frameworks?.length) && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            CORE COMPETENCIES
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {skills.technical && skills.technical.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Technical Expertise</h4>
                <p className="text-sm text-gray-700">{skills.technical.join(" • ")}</p>
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Tools & Platforms</h4>
                <p className="text-sm text-gray-700">{skills.tools.join(" • ")}</p>
              </div>
            )}
            {skills.frameworks && skills.frameworks.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Frameworks</h4>
                <p className="text-sm text-gray-700">{skills.frameworks.join(" • ")}</p>
              </div>
            )}
            {skills.soft && skills.soft.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Leadership & Soft Skills</h4>
                <p className="text-sm text-gray-700">{skills.soft.join(" • ")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Projects */}
      {projects.length > 0 && projects[0].title && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            KEY PROJECTS
          </h3>
          {projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h4 className="text-lg font-bold text-gray-900">{project.title}</h4>
              {project.description && <p className="text-sm text-gray-700 mt-1 leading-relaxed">{project.description}</p>}
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">Technologies:</span> {project.technologies.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Professional Certifications */}
      {certifications.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            PROFESSIONAL CERTIFICATIONS
          </h3>
          {certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <p className="text-base">
                <span className="font-semibold">{cert.name}</span> – {cert.issuer}
                <span className="text-sm text-gray-600 ml-2">({cert.date})</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements & Awards */}
      {achievements.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            ACHIEVEMENTS & AWARDS
          </h3>
          {achievements.map((achievement, index) => (
            <div key={index} className="mb-3">
              <p className="text-base font-semibold">
                {achievement.title}
                {achievement.date && <span className="text-sm text-gray-600 ml-2">({achievement.date})</span>}
              </p>
              {achievement.description && <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
