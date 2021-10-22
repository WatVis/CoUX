const run_vars = window.APP_CONFIG || {};

export const host =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "//localhost:8888"
    : "//site.com:8080";
