export const demoAskResponses = [
  {
    question: "What are customers complaining about the most?",
    answer:
      "The strongest recent complaint pattern is performance, especially slow dashboard loading and slow report generation. Login recovery and notification reliability are also recurring pain points.",
    citations: [
      {
        feedbackKey: "dashboard-slow-1",
        reason: "Reports slow dashboard loading.",
      },
      {
        feedbackKey: "report-generation-slow",
        reason: "Reports slow report generation.",
      },
      {
        feedbackKey: "login-reset-loop",
        reason: "Reports password-reset failure.",
      },
    ],
  },
  {
    question: "What are customers saying about the dashboard?",
    answer:
      "Recent dashboard feedback is mostly negative and focuses on long loading times, spinning widgets, and chart freezes. The seeded data also shows a smaller, older set of dashboard performance complaints, making the recent volume useful for demonstrating a performance spike.",
    citations: [
      {
        feedbackKey: "dashboard-slow-2",
        reason: "Reports spinning dashboard widgets and slow report views.",
      },
      {
        feedbackKey: "dashboard-freeze",
        reason: "Reports dashboard chart freezing.",
      },
      {
        feedbackKey: "dashboard-mobile-slow",
        reason: "Reports slow dashboard loading on mobile.",
      },
    ],
  },
];

export const demoReportNarrative = {
  executiveSummary:
    "Customer feedback is concentrated around recent performance issues, particularly slow dashboard loading and report generation. Customers also report friction in password recovery and notification reliability, while onboarding, CSV import, and automatic theme grouping receive positive feedback.",
  keyFindings: [
    {
      title: "Dashboard performance is the clearest recent pain point",
      description:
        "Multiple recent feedback records describe slow dashboard loading, spinning widgets, and chart freezes.",
      evidenceKeys: ["dashboard-slow-1", "dashboard-slow-2", "dashboard-freeze"],
    },
    {
      title: "Report generation delays affect daily workflows",
      description:
        "Customers report waiting more than a minute for weekly reports and experiencing slow report views.",
      evidenceKeys: ["report-generation-slow", "dashboard-slow-2"],
    },
    {
      title: "Authentication recovery needs clearer handling",
      description:
        "Password-reset loops and unclear SSO errors create avoidable login friction.",
      evidenceKeys: ["login-reset-loop", "login-sso-confusing"],
    },
  ],
  positiveHighlights: [
    {
      title: "Onboarding and CSV import reduce setup effort",
      description:
        "Customers praise the onboarding checklist and CSV import guidance for making initial setup easier.",
      evidenceKeys: ["onboarding-positive", "csv-import-positive"],
    },
    {
      title: "Theme grouping delivers value",
      description:
        "Automatic theme grouping helped customers surface recurring billing questions quickly.",
      evidenceKeys: ["ai-themes-positive"],
    },
  ],
  recommendations: [
    {
      title: "Prioritize dashboard and report performance investigation",
      description:
        "Investigate dashboard loading, widget rendering, chart stability, and report-generation latency before the next release.",
      evidenceKeys: ["dashboard-slow-1", "dashboard-freeze", "report-generation-slow"],
    },
    {
      title: "Improve login recovery feedback",
      description:
        "Add clearer password-reset and SSO error states so customers know how to recover access.",
      evidenceKeys: ["login-reset-loop", "login-sso-confusing"],
    },
    {
      title: "Add notification controls and reliability monitoring",
      description:
        "Offer digest controls for noisy updates and monitor delivery of assignment notifications.",
      evidenceKeys: ["notifications-noisy", "notifications-missing"],
    },
  ],
  limitations: [
    "This is synthetic demo data designed to exercise the application workflow.",
    "The feedback sample is small and should not be interpreted as production customer research.",
  ],
};
