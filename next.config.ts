import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Required for Pyodide and Monaco Editor compatibility
  serverExternalPackages: [],
};

export default withNextIntl(nextConfig);
