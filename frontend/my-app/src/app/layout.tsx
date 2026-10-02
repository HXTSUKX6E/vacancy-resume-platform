import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Подключаем шрифты
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "My App",
    description: "Описание вашего приложения",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
        <body
            className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        >
        {/* Suspense нужен страницам с useSearchParams() для production-сборки */}
        <Suspense>{children}</Suspense>
        </body>
        </html>
    );
}
