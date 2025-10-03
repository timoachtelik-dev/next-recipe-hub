// Simple request logger - placeholder for production logging
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : "");
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : "");
    }
  },
};

// Sentry wiring stub (commented for now)
// import * as Sentry from "@sentry/nextjs";
// 
// export const sentryLogger = {
//   captureException: (error: Error) => Sentry.captureException(error),
//   captureMessage: (message: string, level: "info" | "warning" | "error") => 
//     Sentry.captureMessage(message, level),
// };
