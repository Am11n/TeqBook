"use client";

interface DashboardHeaderProps {
  ownerName: string;
  translations: {
    welcomeBack: string;
    welcomeSubtitle: string;
  };
}

export function DashboardHeader({ ownerName, translations }: DashboardHeaderProps) {
  return (
    <div className="mb-10">
      <h1 className="text-[32px] font-bold leading-tight text-foreground">
        {translations.welcomeBack.replace("{name}", ownerName || "there")}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        {translations.welcomeSubtitle}
      </p>
    </div>
  );
}

