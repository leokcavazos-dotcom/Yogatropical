import OnboardingBanner from "@/components/OnboardingBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <OnboardingBanner />
      </div>
      {children}
    </>
  );
}
