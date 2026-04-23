import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/AuthContext";

export const metadata: Metadata = {
  title: "Smart Timetable Assistant",
  description: "AI-Powered Academic Schedule Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}