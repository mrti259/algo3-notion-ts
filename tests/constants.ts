import { config } from "dotenv";

config({ path: ".env.test" });

export const NOTION_TOKEN = process.env.NOTION_TOKEN!;
export const PAGE_ID = process.env.PAGE_ID!;
