export const HIJRI_TIME_ZONE = "Asia/Dhaka";
export const HIJRI_CALENDAR = "islamic-umalqura";

const months = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah",
];
const hijriFormatter = new Intl.DateTimeFormat("en-GB", {
  calendar: HIJRI_CALENDAR, timeZone: HIJRI_TIME_ZONE, numberingSystem: "latn",
  day: "numeric", month: "numeric", year: "numeric",
});
const civilFormatter = new Intl.DateTimeFormat("en-GB", {
  calendar: "gregory", timeZone: HIJRI_TIME_ZONE, numberingSystem: "latn",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});
const partsOf = (formatter, date) => Object.fromEntries(
  formatter.formatToParts(date).filter((part) => part.type !== "literal").map(({ type, value }) => [type, value]),
);

// Use a named calendar, not the browser's locale-dependent Islamic calendar.
// This is the Umm al-Qura civil-date conversion, not a Bangladesh moon-sighting claim.
export function getHijriDate(date = new Date()) {
  const hijri = partsOf(hijriFormatter, date);
  const civil = partsOf(civilFormatter, date);
  return {
    gregorianDate: `${civil.year}-${civil.month}-${civil.day}`,
    label: `${Number(hijri.day)} ${months[Number(hijri.month) - 1]} ${hijri.year} AH`,
  };
}

export function millisecondsToDhakaMidnight(date = new Date()) {
  const civil = partsOf(civilFormatter, date);
  const elapsed = ((Number(civil.hour) * 60 + Number(civil.minute)) * 60 + Number(civil.second)) * 1000 + date.getMilliseconds();
  return 86400000 - elapsed;
}
