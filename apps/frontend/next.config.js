const withPWA = require("next-pwa");
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    // Other experimental features can go here
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);

module.exports = withSentryConfig(
  pwaConfig,
  {
    // For all available options, see:  https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
    // and https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "estate-4c",
    project: "estate",
    
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring-tunnel",

    sourcemaps: {
      disable: !process.env.SENTRY_AUTH_TOKEN,
      deleteSourcemapsAfterUpload: true,
    },

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Disable source map uploads if SENTRY_AUTH_TOKEN is not available
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);