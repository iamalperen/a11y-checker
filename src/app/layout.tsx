import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Accessibility Checker',
  description:
    "Check the accessibility of your website with ease and speed. Get your website's accessibility score and improve it with our recommendations.",
  authors: {
    url: 'https://github.com/iamalperen',
    name: 'Alperen Talaslıoğlu',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
