import { Bug, Lightbulb, Sparkles } from "lucide-react";

const cards = [
  {
    type: "bug_report",
    title: "Report a bug",
    description: "Something not working? Let us know.",
    icon: Bug,
    accent: "text-red-600 bg-red-50 border-red-200",
  },
  {
    type: "feature_request",
    title: "Request a feature",
    description: "Have an idea? We'd love to hear it.",
    icon: Lightbulb,
    accent: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    type: "improvement",
    title: "Suggest improvement",
    description: "Something could be better? Tell us how.",
    icon: Sparkles,
    accent: "text-amber-600 bg-amber-50 border-amber-200",
  },
];

export function FeedbackEmptyState({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <div className="py-12">
      <p className="text-center text-muted-foreground mb-6">
        No feedback submitted yet. How can we improve?
      </p>
      <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
        {cards.map((card) => (
          <button
            key={card.type}
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
