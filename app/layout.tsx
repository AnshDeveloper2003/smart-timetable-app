import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "Smart Timetable Assistant",
  description: "AI-Powered Academic Scheduling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}