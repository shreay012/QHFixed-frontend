import ThemeRegistry from "@/components/providers/ThemeRegistryFixed";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import ReduxProvider from "@/lib/redux/providers/ReduxProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getLocaleDir } from "@/lib/i18n/config";
import ClientProviders from "@/components/providers/ClientProviders";

export const metadata = {
  metadataBase: "http://localhost:3000",
  title: "QuickHire - Hire Tech Experts in 10 Minutes",
  description:
    "Get on-demand tech and software experts. Verified professionals ready to start immediately, guided by committed Project Managers.",
  keywords: [
    "tech hiring",
    "developers",
    "designers",
    "quick hire",
    "on-demand tech",
  ],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "QuickHire - Fast Tech Talent",
    description: "Hire verified tech professionals in 10 minutes",
    url: "https://quickhire.com",
    siteName: "QuickHire",
    locale: "en_US",
    type: "website",
  },
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = getLocaleDir(locale);
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            {/* Pass dir so MUI theme is created with the correct direction SSR */}
            <ThemeRegistry dir={dir}>
              <ClientProviders>
                <LayoutWrapper>{children}</LayoutWrapper>
              </ClientProviders>
            </ThemeRegistry>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
