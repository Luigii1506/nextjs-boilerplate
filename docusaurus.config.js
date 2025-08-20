const config = {
  title: "Mi Documentación del Proyecto",
  tagline: "Una guía completa para mi proyecto",
  favicon: "img/favicon.ico",
  url: "https://tu-usuario.github.io",
  baseUrl: "/",
  organizationName: "tu-usuario-github",
  projectName: "tu-proyecto",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  i18n: {
    defaultLocale: "es",
    locales: ["es"],
  },
  presets: [
    [
      "classic",
      {
        docs: {
          path: "./docs",
          sidebarPath: "./sidebars.js",
        },
      },
    ],
  ],
  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Documentación",
        },
        {
          href: "https://github.com/facebook/docusaurus",
          label: "GitHub",
          position: "right",
        },
      ],
    },
  },
};

module.exports = config;
