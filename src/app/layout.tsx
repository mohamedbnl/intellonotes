// Root layout — passthrough only; <html>/<body> are rendered in [locale]/layout.tsx
// next-intl middleware redirects all requests to /[locale]/* so this wrapper is never
// the outermost HTML shell. Rendering <html>/<body> here would nest them inside
// [locale]/layout.tsx's own <html>/<body> and cause a hydration error.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
