// Explicit samples keep tests independent of personal settings and credentials.
export const createConfig = () => ({
  comments: {
    enabled: true,
    repository: "example/site",
    category: "Announcements",
    theme: "light",
    language: "en",
  },
  viewCounter: { enabled: true },
  contributions: { enabled: true, heatmap: true, sync: true, pageSize: 6 },
});

export const createProfile = () => ({
  name: "Example",
  role: "Developer",
  title: "Developer",
  organization: "",
  location: "",
  email: "",
  githubUsername: "",
  summary: "Example developer profile.",
  focus: [],
  home: { introduction: "Example", description: "Example portfolio." },
  about: { description: "About Example.", lead: "Developer", paragraphs: [] },
  experiences: [],
  skills: [],
  education: { institution: "", description: "" },
});
