import { useEffect, useState } from "react";
import { getHijriDate, millisecondsToDhakaMidnight } from "../../utils/hijriDate";

export default function HijriDate({ className = "" }) {
  const [date, setDate] = useState(() => getHijriDate());

  useEffect(() => {
    let timer;
    const schedule = () => {
      window.clearTimeout(timer);
      // Refresh at Dhaka midnight, with a one-minute guard for device-clock changes.
      timer = window.setTimeout(refresh, Math.min(60000, millisecondsToDhakaMidnight() + 25));
    };
    const refresh = () => {
      const next = getHijriDate();
      setDate((current) => current.gregorianDate === next.gregorianDate ? current : next);
      schedule();
    };
    const onVisibility = () => { if (!document.hidden) refresh(); };
    schedule();
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <time
      dateTime={date.gregorianDate}
      aria-label={`Hijri date: ${date.label}. Umm al-Qura calendar, Dhaka time.`}
      aria-live="polite"
      aria-atomic="true"
      title="Umm al-Qura calendar · Updates at midnight in Dhaka. Local moon-sighting dates may differ."
      className={`whitespace-nowrap font-garamond text-lg font-semibold leading-relaxed text-[#E9AD5E] sm:text-xl lg:text-[1.35rem] ${className}`}
    >
      {date.label}
    </time>
  );
}
