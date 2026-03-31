import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/scheduler/scheduler";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { MqttProvider } from "@/providers/MqttProvider";
import { AppShell } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Bay - Sports Field Booking",
  description: "Book and manage sports field bays with smart lighting control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          <MqttProvider>
            <AppShell>
              {children}
            </AppShell>
          </MqttProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
