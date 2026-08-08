import { UAParser } from "ua-parser-js";
import crypto from "crypto";

export const getDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const origin = req.headers["origin"] || req.headers["referer"] || "";
  const secChUa = req.headers["sec-ch-ua"] || "";

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

  // Bỏ ip khỏi fingerprint — IP động của ISP khiến cùng 1 thiết bị bị
  // nhận diện thành nhiều "thiết bị" khác nhau, không phản ánh đúng thực tế
  const raw = `${userAgent}__${secChUa}__${origin}`;
  const fingerprint = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex")
    .slice(0, 16);

  return `${label} [${fingerprint}]`;
};
