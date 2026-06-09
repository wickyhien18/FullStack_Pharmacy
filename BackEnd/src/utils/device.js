import UAParser from "ua-parser-js";

export const getDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent);

  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  // Mobile
  if (device.model) {
    return `${device.vendor || ""} ${device.model}`.trim();
  }

  // Desktop
  return `${browser.name || "Unknown Browser"} on ${os.name || "Unknown OS"}`;
};
