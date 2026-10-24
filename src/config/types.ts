export interface IntegrationConfig {
  comments: {
    enabled: boolean;
    repository: string;
    category: string;
    theme: string;
    language: string;
  };
  viewCounter: { enabled: boolean };
  contributions: {
    enabled: boolean;
    heatmap: boolean;
    sync: boolean;
    pageSize: number;
  };
}

export interface Profile {
  name: string;
  role: string;
  title: string;
  organization: string;
  location: string;
  email: string;
  githubUsername: string;
  summary: string;
  focus: string[];
  home: { introduction: string; description: string };
  about: { description: string; lead: string; paragraphs: string[] };
  experiences: {
    period: string;
    role: string;
    organization: string;
    location?: string;
    summary: string;
    highlights: string[];
    stack: string[];
  }[];
  skills: { label: string; items: string[] }[];
  education: { institution: string; description: string };
}
