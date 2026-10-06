import { readFileSync } from "node:fs";
import { summarizeOutcomes } from "./poc-outcomes.mjs";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npm run poc:report -- /absolute/path/to/private-operator-feedback.json");
  process.exit(1);
}
let input;
try {
  input = JSON.parse(readFileSync(inputPath, "utf8"));
} catch {
  console.error("poc:report: unable to read valid JSON; no input contents were printed.");
  process.exit(1);
}
try {
  console.log(JSON.stringify(summarizeOutcomes(input), null, 2));
} catch (error) {
  console.error(`poc:report: ${error instanceof Error ? error.message : "invalid feedback"}`);
  process.exit(1);
}
