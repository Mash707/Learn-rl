import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import {DM_Sans} from "@next/font/google"
import "./globals.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const dmSans = DM_Sans({
  subsets:["latin"],
  display:"swap",
  variable: "--font-dm-sans"
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.className}`}
      >
      <ClerkProvider>
          <Providers>
            <div className="root-layout">
              {children}
            </div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
