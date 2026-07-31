import { UAParser } from "ua-parser-js";
import crypto from "crypto";

export const getDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const origin = req.headers["origin"] || req.headers["referer"] || "";
  const secChUa = req.headers["sec-ch-ua"] || "";
  const ip = (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown"
  ).trim();

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  let label;
  if (device.model) {
    label = `${device.vendor || ""} ${device.model}`.trim();
  } else {
    label = `${browser.name || "Unknown"} on ${os.name || "Unknown"}`;
  }

  // secChUa phân biệt được Brave vs Chrome vs Firefox
  // origin phân biệt localhost vs vercel
  const raw = `${userAgent}__${secChUa}__${origin}__${ip}`;
  const fingerprint = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex")
    .slice(0, 16);

  return `${label} [${fingerprint}]`;
};
