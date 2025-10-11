import { generateDummyPassword } from "./db/utils";

// This is used for timing-safe password comparison when user doesn't exist
export const DUMMY_PASSWORD = generateDummyPassword();
