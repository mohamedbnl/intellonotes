// Root layout — next-intl handles locale routing via middleware
// All actual content is in src/app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
