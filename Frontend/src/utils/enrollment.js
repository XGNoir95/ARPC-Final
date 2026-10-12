import { catalogue, formatCatalogueDate } from "../data/catalogue";
import { featuredEvents } from "../data/featuredEvents";
import { studentFields } from "./studentDetails";

export const enrollmentKinds = { events: "Event", webinars: "Webinar", courses: "Course" };
export const enrollmentPath = (kind, id) => `/enroll/${kind}/${encodeURIComponent(id)}`;
export const enrollmentFields = (kind) => studentFields.filter(({ name }) => kind === "courses" || name !== "phone");

export function getEnrollment(kind, id) {
  if (!Object.hasOwn(enrollmentKinds, kind)) return null;
  const item = catalogue[kind].find((entry) => entry.id === id);
  if (item) return { kind, item, label: enrollmentKinds[kind] };
  if (kind === "events") {
    const featured = featuredEvents.find((entry) => `featured-${entry.id}` === id);
    if (featured) return { kind, label: enrollmentKinds[kind], item: {
      ...featured, id, date: featured.dateTime, location: featured.place,
      heroImage: "/images/about/community.jpg", isPoster: true,
      format: featured.subtitle, details: featured.description, description: featured.exploration,
    } };
  }
  return null;
}

export function enrollmentFromPath(pathname) {
  const match = /^\/enroll\/(events|webinars|courses)\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  try { return getEnrollment(match[1], decodeURIComponent(match[2])); } catch { return null; }
}

export function enrollmentFacts({ kind, item }) {
  return kind === "courses" ? [
    ["Duration", item.duration], ["Learning format", item.pace], ["Place", item.location],
    ["Course fee", item.fee === 0 ? "Free" : `৳${item.fee.toLocaleString("en-BD")}`],
  ] : [["Date", formatCatalogueDate(item.date)], ["Time", item.time], ["Place", item.location]];
}

export function formatEnrollment(enrollment, values) {
  return [
    `ARPC ${enrollment.label.toLowerCase()} enrollment request`, "",
    [enrollment.label, enrollment.item.title].join(": "), `Programme ID: ${enrollment.item.id}`,
    ...enrollmentFacts(enrollment).map(([label, value]) => `${label}: ${value}`), "",
    ...enrollmentFields(enrollment.kind).map(({ name, label }) => `${label}: ${values[name].trim()}`),
    "", "Enrollment status: Pending club confirmation",
  ].join("\n");
}

export function enrollmentEmail(enrollment, values) {
  const subject = `${enrollment.label} enrollment: ${enrollment.item.title}`;
  return `mailto:info@arpc.club?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formatEnrollment(enrollment, values))}`;
}
