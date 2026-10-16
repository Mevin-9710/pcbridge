import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PCBridge — Use Your Computer Like a Coding Agent",
  description:
    "Web-hosted MCP bridge that lets ChatGPT, Claude, Gemini, and other chatbots use your computer like a coding agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="aurora" />
        {children}
      </body>
    </html>
  );
}
