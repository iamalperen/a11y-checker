import type { Metadata } from 'next';
import 'normalize.css';
import '../styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/header/Header';

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
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
