import { Bug, Lightbulb, Sparkles } from "lucide-react";

export type FeedbackEmptyStateLabels = {
  intro: string;
  bugTitle: string;
  bugDescription: string;
  featureTitle: string;
  featureDescription: string;
  improvementTitle: string;
  improvementDescription: string;
};

export function FeedbackEmptyState({
  onSelect,
  labels,
}: {
  onSelect: (type: string) => void;
  labels: FeedbackEmptyStateLabels;
}) {
  const cards = [
    {
      type: "bug_report",
      title: labels.bugTitle,
      description: labels.bugDescription,
      icon: Bug,
      accent: "text-red-600 bg-red-50 border-red-200",
    },
    {
      type: "feature_request",
      title: labels.featureTitle,
      description: labels.featureDescription,
      icon: Lightbulb,
      accent: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      type: "improvement",
      title: labels.improvementTitle,
      description: labels.improvementDescription,
      icon: Sparkles,
      accent: "text-amber-600 bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="py-12">
      <p className="text-center text-muted-foreground mb-6">{labels.intro}</p>
      <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
        {cards.map((card) => (
          <button
            key={card.type}
            type="button"
            onClick={() => onSelect(card.type)}
            className={`flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${card.accent}`}
          >
            <card.icon className="h-8 w-8" />
            <div>
              <p className="font-semibold text-sm">{card.title}</p>
              <p className="text-xs mt-1 opacity-70">{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
