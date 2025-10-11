import { generateDummyPassword } from "./db/utils";

// This is used for timing-safe password comparison when user doesn't exist
export const DUMMY_PASSWORD = generateDummyPassword();

// Check if we're in development environment
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";

// Regex to match guest user emails
export const guestRegex = /^guest-\d+$/;
