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

export default function CreativeDesignerTemplate({
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
    <div className="w-full flex bg-white text-gray-900" style={{ fontFamily: 'Helvetica, sans-serif' }}>
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gradient-to-b from-purple-600 to-pink-500 text-white p-6">
        {/* Profile */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{personalInfo.fullName || "Your Name"}</h1>
          {personalInfo.title && <p className="text-sm font-light">{personalInfo.title}</p>}
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase mb-3 border-b border-white/30 pb-1">Contact</h3>
          <div className="space-y-2 text-xs">
            {personalInfo.email && <p className="break-words">✉️ {personalInfo.email}</p>}
            {personalInfo.phone && <p>📞 {personalInfo.phone}</p>}
            {personalInfo.location && <p>📍 {personalInfo.location}</p>}
          </div>
        </div>

        {/* Links */}
        {(personalInfo.linkedin || personalInfo.github || personalInfo.portfolio) && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase mb-3 border-b border-white/30 pb-1">Links</h3>
            <div className="space-y-2 text-xs">
              {personalInfo.linkedin && <p className="break-words">🔗 {personalInfo.linkedin}</p>}
              {personalInfo.github && <p className="break-words">💻 {personalInfo.github}</p>}
              {personalInfo.portfolio && <p className="break-words">🌐 {personalInfo.portfolio}</p>}
            </div>
          </div>
        )}

        {/* Skills */}
        {(skills.technical?.length || skills.soft?.length || skills.tools?.length || skills.frameworks?.length) && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase mb-3 border-b border-white/30 pb-1">Skills</h3>
            <div className="space-y-3">
              {skills.technical && skills.technical.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-1">Technical</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.technical.map((skill, i) => (
                      <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-1">Tools</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.tools.map((tool, i) => (
                      <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{tool}</span>
                    ))}
                  </div>
                </div>
              )}
              {skills.frameworks && skills.frameworks.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-1">Frameworks</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.frameworks.map((framework, i) => (
                      <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{framework}</span>
                    ))}
                  </div>
                </div>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-1">Soft Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.soft.map((skill, i) => (
                      <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase mb-3 border-b border-white/30 pb-1">Certifications</h3>
            {certifications.map((cert, index) => (
              <div key={index} className="mb-3 text-xs">
                <p className="font-semibold">{cert.name}</p>
                <p className="text-white/80">{cert.issuer}</p>
                <p className="text-white/60 text-xs">{cert.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="w-2/3 p-8">
        {/* Summary */}
        {summary && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-purple-600 mb-2 uppercase">About Me</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && experience[0].title && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-purple-600 mb-3 uppercase">Experience</h3>
            {experience.map((exp, index) => (
              <div key={index} className="mb-4 relative pl-4 border-l-2 border-purple-300">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-gray-900">{exp.title}</h4>
                    <p className="text-sm text-gray-700">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="list-disc ml-4 text-xs text-gray-700 space-y-1 mt-2">
                    {exp.responsibilities.map((resp, i) => (
                      resp && <li key={i}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && projects[0].title && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-purple-600 mb-3 uppercase">Projects</h3>
            {projects.map((project, index) => (
              <div key={index} className="mb-4 bg-purple-50 p-3 rounded-lg">
                <h4 className="font-bold text-gray-900">{project.title}</h4>
                {project.description && <p className="text-xs text-gray-700 mt-1">{project.description}</p>}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {(project.github || project.liveLink) && (
                  <div className="flex gap-3 text-xs text-purple-600 mt-2">
                    {project.github && <span>💻 GitHub</span>}
                    {project.liveLink && <span>🌐 Live</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && education[0].degree && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-purple-600 mb-3 uppercase">Education</h3>
            {education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                    <p className="text-sm text-gray-700">{edu.institution}</p>
                    {edu.gpa && <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-purple-600 mb-3 uppercase">Achievements</h3>
            {achievements.map((achievement, index) => (
              <div key={index} className="mb-2">
                <p className="font-semibold text-gray-900">{achievement.title}</p>
                {achievement.description && <p className="text-xs text-gray-600">{achievement.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}