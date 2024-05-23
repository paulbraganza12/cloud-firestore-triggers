import fs from "fs";
import { DotenvParseOutput } from "dotenv";

export const loadConfigIntoEnvironment = (): DotenvParseOutput => {
  const envFilePath = `${process.cwd()}/.env`;
  if (fs.existsSync(envFilePath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const result = require("dotenv").config({ path: envFilePath });
    if (result.error) {
      throw result.error;
    }
    return result.parsed!;
  } else {
    throw new Error(`.env file not found at ${envFilePath}. Did you prepare the test environment?`);
  }
};
