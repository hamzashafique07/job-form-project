//server/src/utils/parseUserAgent.ts
export function parseUserAgent(ua) {
  let browser = "Unknown",
    os = "Unknown",
    device = "Desktop";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";
  else if (ua.includes("MSIE") || ua.includes("Trident/"))
    browser = "Internet Explorer";

  if (ua.includes("Windows NT 10.0")) os = "Windows 10";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("like Mac")) os = "iOS";

  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) device = "Mobile";

  return { ua, browser, os, device };
}
