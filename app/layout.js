import "./globals.css";

export const metadata = {
  title: "PrioSpace",
  description: "Focus on what matters.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-nunito" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
