// Root layout — minimal shell; locale-specific layout in [locale]/layout.tsx
// next-intl middleware redirects all requests to /[locale]/* automatically
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
