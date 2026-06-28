import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Granade Music",
  description: "Accede a tu clase",
  icons: [{ rel: "icon", url: "/logo.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
