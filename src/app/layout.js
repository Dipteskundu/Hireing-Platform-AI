import "./globals.css";
import LiveVisuals from "./components/LiveVisuals/LiveVisuals";
import Chatbot from "./components/Chatbot/Chatbot";
import Providers from "./Providers";

export const metadata = {
  title: "JobMatch AI - Premium AI-Powered Job Matching Platform",
  description:
    "Match your unique skills with the perfect career opportunities using our advanced AI-driven platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          <LiveVisuals />
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
