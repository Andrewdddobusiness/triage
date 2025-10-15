// app/(home-pages)/page.tsx
"use client";

import Image from "next/image";
import {
  SparklesIcon,
  BarChartIcon,
  Users2Icon,
  BrainCircuitIcon,
  ClipboardCheckIcon,
  ClockIcon,
  CalendarIcon,
  MessageSquareIcon,
} from "lucide-react";
import dashboard from "@/public/images/dashboard.png";
import HomeLayout from "@/components/layout/home-layout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

const stats = [
  { label: "Calls captured automatically", value: "92%" },
  { label: "Faster customer callbacks", value: "3.2x" },
  { label: "Teams onboarded in under", value: "10 min" },
];

const floatingHeroCards = [
  {
    title: "Caller notes",
    description: "Names, job type, and urgency captured instantly.",
    icon: ClipboardCheckIcon,
    className: "hidden lg:flex absolute -top-12 left-8 -rotate-3",
    bgClass: "bg-[#fff7db]",
  },
  {
    title: "Smart reminders",
    description: "Spaak schedules the perfect callback window.",
    icon: CalendarIcon,
    className: "hidden md:flex absolute -top-14 right-14 rotate-2",
    bgClass: "bg-[#edf2ff]",
  },
  {
    title: "Live status",
    description: "Know what is hot, waiting, and already handled.",
    icon: BarChartIcon,
    className: "hidden md:flex absolute -bottom-14 left-16 rotate-2",
    bgClass: "bg-[#e9fff4]",
  },
  {
    title: "Team alerts",
    description: "Loop your crew in when a high-value lead lands.",
    icon: Users2Icon,
    className: "hidden lg:flex absolute -bottom-12 right-12 -rotate-2",
    bgClass: "bg-[#ffeef4]",
  },
];

const heroCallouts = [
  {
    title: "Real conversations",
    description:
      "Spaak holds human-like dialogues that nurture trust from the first hello.",
    icon: MessageSquareIcon,
  },
  {
    title: "Instant summaries",
    description:
      "Every call generates a concise summary with action items in seconds.",
    icon: ClockIcon,
  },
  {
    title: "Team notifications",
    description:
      "Loop in teammates instantly so the right person jumps on the opportunity.",
    icon: Users2Icon,
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <HomeLayout>
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/40 via-background to-background py-20 sm:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl" />
          <div className="absolute -bottom-44 right-6 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[44px] border border-border/40 bg-card/90 shadow-2xl backdrop-blur">
            <div className="relative overflow-hidden rounded-[44px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(148,163,184,0.18)_1px,_transparent_1px)] [background-size:26px_26px]" />
              <div className="relative flex flex-col items-center gap-8 px-6 py-16 text-center sm:px-12 lg:px-20">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl pt-12">
                  Think, capture, and convert every call in one place.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                  Spaak is the AI voice assistant for trades and field service
                  teams. While you stay on the tools, Spaak answers, qualifies,
                  and hands over the next best action without missing a beat.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleGetStarted}
                    className="h-12 rounded-full px-6 text-base font-semibold"
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  </Button>
                </div>

                <div className="w-full max-w-3xl">
                  <div className="relative overflow-hidden rounded-[28px] border border-border/50 bg-background/60 shadow-xl">
                    <div className="absolute inset-x-10 top-0 h-32 rounded-full bg-primary/10 blur-3xl " />
                    <div className="relative ">
                      <Image
                        src={dashboard}
                        alt="Spaak dashboard preview"
                        width={1200}
                        height={760}
                        className="w-full rounded-[24px] border border-border/50"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {floatingHeroCards.map((card) => (
              <div
                key={card.title}
                className={`${card.className} pointer-events-none z-20`}
              >
                <div
                  className={`relative flex w-60 flex-col gap-3 rounded-3xl border border-border/50 p-5 text-left shadow-[0px_28px_60px_rgba(15,23,42,0.14)] ${card.bgClass} dark:border-border dark:bg-card/80`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {card.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
