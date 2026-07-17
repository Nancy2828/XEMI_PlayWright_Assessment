import dotenv from "dotenv";

dotenv.config();

export const config = {
  baseURL: process.env.XEMI_BASE_URL || "",
  username: process.env.XEMI_USERNAME || "",
  password: process.env.XEMI_PASSWORD || "",
};