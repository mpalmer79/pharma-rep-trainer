import { TrainingJourney } from "@/lib/trainingJourney";

export const salesRepJourney: TrainingJourney = {
  id: "sales-rep-core",
  title: "Sales Rep Mastery Path",
  description: "Progress from fundamentals to advanced objection handling.",

  nodes: [
    {
      id: "onboarding",
      title: "Getting Started",
      description: "Learn how training works and complete your first session.",
      type: "onboarding",
      status: "completed",
      estimatedMinutes: 5
    },
    {
      id: "persona-basic",
      title: "Intro Persona Conversations",
      description: "Practice with a cooperative customer persona.",
      type: "persona",
      status: "available",
      estimatedMinutes: 10,
      recommended: true,
      metadata: {
        difficulty: "beginner"
      }
    },
    {
      id: "objection-pricing",
      title: "Handling Pricing Objections",
      description: "Respond confidently to pricing concerns.",
      type: "objection",
      status: "locked",
      requiredToUnlock: ["persona-basic"],
      estimatedMinutes: 15
    }
  ]
};
