// Design-preview listings. Replace dates, fees and programme details with verified
// ARPC content before opening registration. All images are bundled local assets.
export const catalogue = {
  events: [
    {
      id: "reflection-evening", title: "An evening of reflection", date: "2026-10-24",
      time: "4:30 PM", location: "AUST Campus", image: "/images/about/community.jpg",
      imageAlt: "Friends spending time together outdoors", format: "Campus gathering",
      description: "Take a pause from the semester. Read, reflect and share a thoughtful conversation with the campus community.",
      details: "A welcoming gathering built around selected readings and everyday questions. There will be time for small-group conversations, personal reflection and meeting other members.",
      takeaways: ["Discuss the readings with other students", "Bring your questions to an open conversation", "Meet people across departments"],
    },
    {
      id: "books-conversations", title: "Books that start conversations", date: "2026-11-07",
      time: "3:00 PM", location: "AUST Campus", image: "/images/about/learning.jpg",
      imageAlt: "Students taking part in a classroom discussion", format: "Reading circle",
      description: "Bring a passage that stayed with you. Discover a new book through the people who read it.",
      details: "An informal reading circle where students share a short passage, explain what it means to them and discuss the ideas it opens up. No previous reading is required.",
      takeaways: ["Share a favourite passage", "Find your next read", "Hear different perspectives"],
    },
    {
      id: "seerah-evening", title: "Stories from the Seerah", date: "2026-10-03",
      time: "5:00 PM", location: "AUST Campus", image: "/images/team/meeting-discussion.jpg",
      imageAlt: "People gathered for a shared conversation", format: "Storytelling evening",
      description: "Stories of character and compassion, followed by a conversation about what they mean for us today.",
      details: "A finished sample gathering exploring selected stories from the Seerah. A verified event recap and related readings can be added to this archive entry.",
      takeaways: ["Listen to selected stories from the Seerah", "Reflect on character and compassion", "Discuss lessons for campus life"],
    },
    {
      id: "community-morning", title: "A morning for our community", date: "2026-09-26",
      time: "9:00 AM", location: "Dhaka", image: "/images/about/nature.jpg",
      imageAlt: "A mountain landscape with trees and a grassy meadow", format: "Community activity",
      description: "Small acts of service, shared with friends. A day to turn good intentions into something useful.",
      details: "A sample community programme bringing members together for a morning of practical service and conversation. A verified recap and photographs can be added to this archive entry.",
      takeaways: ["Work together on a local activity", "Practise thoughtful service", "Reflect on what the community needs"],
    },
  ],
  webinars: [
    {
      id: "faith-campus", title: "Faith in everyday campus life", date: "2026-10-30",
      time: "8:00 PM", location: "Online", image: "/images/team/meeting-discussion.jpg",
      imageAlt: "A group taking part in a discussion", format: "Live conversation",
      description: "A thoughtful conversation about balancing study, personal growth and faith, with room for your questions.",
      details: "A sample online discussion for students exploring daily habits, campus responsibilities and the place of reflection in a busy semester. Speaker and joining details will be added when confirmed.",
      takeaways: ["Build a sustainable daily routine", "Connect reflection with student life", "Ask questions during the discussion"],
    },
    {
      id: "thoughtful-writing", title: "Writing with purpose", date: "2026-11-13",
      time: "8:00 PM", location: "Online", image: "/images/team/meeting-planning.jpg",
      imageAlt: "People sharing ideas during a meeting", format: "Practical workshop",
      description: "Learn to shape a useful idea into a clear message, from a campus announcement to a community story.",
      details: "An introductory sample workshop covering audience, structure and editing. Participants work through a short writing exercise and discuss how clear language helps people understand and take part.",
      takeaways: ["Find the point of your message", "Write for the person reading", "Edit a short piece together"],
    },
    {
      id: "reading-habit", title: "Making room for reading", date: "2026-10-02",
      time: "8:00 PM", location: "Online", image: "/images/about/learning.jpg",
      imageAlt: "A teacher leading a classroom learning session", format: "Learning session",
      description: "Simple ways to choose a book, read consistently and remember the ideas that matter.",
      details: "A finished sample session about making reading part of student life. Recording and resource links will appear here when verified material is available.",
      takeaways: ["Choose a manageable reading goal", "Keep useful notes", "Share what you learn"],
    },
    {
      id: "community-ideas", title: "Turning ideas into community action", date: "2026-09-18",
      time: "8:00 PM", location: "Online", image: "/images/about/community.jpg",
      imageAlt: "Friends spending time together outdoors", format: "Community dialogue",
      description: "Explore how a shared idea becomes a useful project, through listening, planning and working together.",
      details: "A finished sample conversation about starting a small community project. The session explores listening to people, agreeing on a practical goal and sharing responsibilities. Recording and resources will appear when verified material is available.",
      takeaways: ["Listen to what your community needs", "Turn an idea into a practical first step", "Share responsibilities with your team"],
    },
  ],
  courses: [
    // Optional coverTheme: preset id from courseCoverPresets in utils/courseCovers.js.
    // Optional coverImage: e.g. /images/courses/my-course.jpg (file in public/).
    // Without either field, artwork is chosen by the course title and format.
    {
      id: "quran-reflection", title: "An introduction to Qur’an reflection", fee: 0,
      coverTheme: "reflection",
      duration: "4 weeks", pace: "Guided learning", location: "Online", image: "/images/about/nature.jpg",
      imageAlt: "Sunlight on a mountain above a forest", format: "Foundations",
      description: "Build a habit of attentive reading and explore practical lessons from selected ayat.",
      details: "A sample introductory course with guided readings, short reflection exercises and shared discussions. The syllabus, teacher and enrolment dates need confirmation before this course opens.",
      takeaways: ["Read selected ayat attentively", "Keep a personal reflection journal", "Discuss everyday applications"],
    },
    {
      id: "community-writing", title: "Content writing for community work", fee: 1200,
      coverTheme: "writing",
      duration: "6 weeks", pace: "Weekly workshops", location: "Online", image: "/images/team/meeting-planning.jpg",
      imageAlt: "A collaborative planning workshop", format: "Communication",
      description: "Practise announcements, stories and campaigns that make good ideas easier to share.",
      details: "A sample paid course combining practical writing exercises and feedback. The displayed fee is an example, and no payment or enrolment is currently being collected.",
      takeaways: ["Plan a message for its audience", "Write and revise useful content", "Develop a small community campaign"],
    },
    {
      id: "seerah-foundations", title: "Lessons from the Seerah", fee: 0,
      coverTheme: "history",
      duration: "5 weeks", pace: "Guided learning", location: "Online", image: "/images/about/learning.jpg",
      imageAlt: "Students listening during a learning session", format: "Islamic learning",
      description: "Explore character, compassion and responsibility through selected stories from the Seerah.",
      details: "A sample foundational course connecting selected stories with personal reflection and community life. The teaching schedule and reading list will be added when confirmed.",
      takeaways: ["Explore key stories and their context", "Reflect on character and compassion", "Connect lessons with everyday choices"],
    },
  ],
};

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka", calendar: "gregory", numberingSystem: "latn",
  year: "numeric", month: "2-digit", day: "2-digit",
});
export const getCatalogueDay = () => {
  const parts = Object.fromEntries(dayFormatter.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const isFinished = (item, today) => item.date < today;
export const formatCatalogueDate = (date) => new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
}).format(new Date(`${date}T12:00:00Z`));

export function filterCatalogue(items, kind, filter, search, today) {
  const query = search.trim().toLocaleLowerCase();
  return items.filter((item) => {
    const matchesSearch = `${item.title} ${item.description} ${item.format}`.toLocaleLowerCase().includes(query);
    const matchesFilter = filter === "All" || (kind === "courses"
      ? (filter === "Free" ? item.fee === 0 : item.fee > 0)
      : (filter === "Upcoming" ? !isFinished(item, today) : isFinished(item, today)));
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (kind === "courses") return 0;
    const aFinished = isFinished(a, today), bFinished = isFinished(b, today);
    if (aFinished !== bFinished) return aFinished ? 1 : -1;
    return aFinished ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
  });
}
