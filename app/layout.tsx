import type { Metadata } from 'next';
import './globals.css';

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://biology-exam-analysis-tw.ntujj.chatgpt.site/';
const siteUrl = new URL(configuredSiteUrl.endsWith('/') ? configuredSiteUrl : `${configuredSiteUrl}/`);
const siteTitle = '全國會考生物試題分析';
const siteDescription = '依年度、章節、難度與能力整理國中教育會考自然科中的生物試題，提供重點解析與常見迷思。';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: '/',
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
    images: [{ url: new URL('og.png', siteUrl).toString(), width: 1200, height: 630, alt: siteTitle }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [new URL('og.png', siteUrl).toString()],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
