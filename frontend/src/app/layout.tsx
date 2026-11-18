import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata = {
  title: "FinSight AI — Financial Intelligence Copilot",
  description: "Autonomous Multi-Agent Financial Report Research, YoY Audit & Provenance Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#F9F8F5]">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
          <Header />
          {children}
        </main>
      </body>
    </html>
  );
}
