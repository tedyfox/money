import type { Metadata, Viewport } from "next";
import "./globals.css";
import TabBarShell from "./components/TabBarShell";

export const metadata: Metadata = {
  title: "Расходы",
  description: "Трекер расходов",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Расходы",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#151f14",
  // cover: фон залезает за Dynamic Island и home indicator
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TabBarShell>{children}</TabBarShell>
      </body>
    </html>
  );
}
