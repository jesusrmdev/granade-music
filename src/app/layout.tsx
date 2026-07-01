import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://granade-music.vercel.app'),
  title: "Granade Music",
  description: "Accede a tu clase",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/logo.png" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
  appleWebApp: { title: "Granade Music", capable: true, statusBarStyle: "default" },
  openGraph: {
    title: "Granade Music",
    description: "Accede a tu clase",
    url: "https://granade-music.vercel.app",
    siteName: "Granade Music",
    images: [{ url: "/logo.png", width: 844, height: 777 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Granade Music",
    description: "Accede a tu clase",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
