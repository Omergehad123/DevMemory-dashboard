import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevMemory - Developer Documentation Admin",
  description: "Admin dashboard to manage developer references, categories, and rich multi-language documentation.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-slate-200" suppressHydrationWarning>
        <QueryProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
