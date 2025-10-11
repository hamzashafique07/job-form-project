//server/src/utils/dateUtils.ts
export function parseDOB(value) {
  if (!value) return { day: "", month: "", year: "" };
  let date;
  try {
    if (/^\d+(\.\d+)?$/.test(value)) {
      date = new Date(Number(value) * 1000); // epoch
    } else {
      date = new Date(value);
    }
  } catch {
    return { day: "", month: "", year: "" };
  }
  return {
    day: date.getDate() || "",
    month: date.getMonth() + 1 || "",
    year: date.getFullYear() || "",
  };
}
