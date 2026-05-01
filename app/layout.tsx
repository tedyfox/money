import type { Metadata, Viewport } from "next";
import "./globals.css";

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

// Inline script: устанавливает --app-height = 100vh в iOS PWA standalone
// (где 100dvh/100svh врут из-за WebKit bug #254868). В браузере используем
// 100dvh, который там работает корректно.
const setAppHeightScript = `
(function () {
  try {
    var isStandalone = window.navigator.standalone === true;
    var d = document.documentElement;
    function set() {
      d.style.setProperty('--app-height', isStandalone ? window.innerHeight + 'px' : '100dvh');
    }
    set();
    window.addEventListener('resize', set);
    window.addEventListener('orientationchange', set);
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: setAppHeightScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div aria-hidden className="app-bg" />
        {children}
      </body>
    </html>
  );
}
