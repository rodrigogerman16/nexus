import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Shell } from "@/components/layout/Shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUS",
  description: "Your personal command center.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        {/* Spec §32/§47: CSS transitions/animations already respect
            prefers-reduced-motion via the global rule in globals.css, but
            framer-motion runs its own animation engine and ignores plain
            CSS transition-duration overrides entirely — without this, a
            user's OS-level reduced-motion preference would be silently
            ignored by every motion.* component (toasts, task cards,
            kanban drag, the splash screen, chat bubbles). */}
        <MotionConfig reducedMotion="user">
          <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
            <Shell>{children}</Shell>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
