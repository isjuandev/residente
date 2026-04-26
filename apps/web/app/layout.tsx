import type { Metadata } from "next";
import { PushNotifications } from "./_providers/push-notifications";
import { UserProvider } from "./_providers/user-provider";
import { absoluteUrl, siteMetadata } from "./_lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  applicationName: siteMetadata.name,
  title: {
    default: siteMetadata.name,
    template: `%s | ${siteMetadata.name}`
  },
  description: siteMetadata.description,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: siteMetadata.name,
    title: siteMetadata.name,
    description: siteMetadata.description,
    url: "/",
    locale: siteMetadata.locale,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Residente"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.name,
    description: siteMetadata.description,
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <UserProvider>
          <PushNotifications />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
