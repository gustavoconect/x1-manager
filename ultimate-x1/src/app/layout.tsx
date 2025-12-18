import type { Metadata } from "next";
import { Outfit, Cinzel } from "next/font/google"; // Fontes Premium
import "./globals.css";

// Configuração das fontes
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ultimate X1 Manager",
  description: "Gerenciador de Torneios de League of Legends Premium",
};

import { AuthProvider } from "@/context/AuthContext";

// ... (imports anteriores e metadata)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${outfit.variable} ${cinzel.variable} antialiased bg-dark-950 text-gold-300 min-h-screen selection:bg-hextech-400 selection:text-dark-950`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
