import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  metadataBase: new URL("https://theontho.github.io/ffmi-calculator/"),
  title: {
    default: "FFMI and Body Composition Calculator",
    template: "%s | FFMI Calculator",
  },
  description:
    "Estimate FFMI, project muscle gain, and compare dynamic fat-loss timelines.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background dark:bg-gray-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
