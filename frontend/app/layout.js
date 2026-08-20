import "./globals.css";

export const metadata = {
  title: "Rentap AI — Financial Report Analysis (DevLeague Lab 1)",
  description: "Rentap AI: AI-powered financial report analysis with explainable insights and PDPA-compliant PII masking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}