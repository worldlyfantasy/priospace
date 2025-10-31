import localFont from "next/font/local";

import "./globals.css";

const nunito = localFont({
  src: [
    {
      path: "../public/fonts/Nunito/XRXV3I6Li01BKofIOOaBTMnFcQIG.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  fallback: ["Nunito", "Helvetica", "Arial", "sans-serif"],
  display: "swap",
  variable: "--font-nunito",
  adjustFontFallback: "Arial",
});

export const metadata = {
  title: "FantaSpace",
  description: "Focus on what matters.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} antialiased font-nunito`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
