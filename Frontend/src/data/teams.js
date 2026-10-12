const memberImage = "/images/team/member-placeholder.svg";
const sampleMembers = (teamId) =>
  Array.from({ length: 5 }, (_, index) => ({
    id: `${teamId}-${index + 1}`,
    name: "Sample Member",
    department: "Department of Computer Science & Engineering",
    image: memberImage,
  }));

// Replace sample profiles with verified club members when the roster is available.
export const teams = [
  {
    id: "committee",
    label: "Executive Committee",
    description:
      "The committee gives our shared ideas a direction. It supports the teams, plans the club's activities and keeps learning, friendship and service at the centre of the work. From the first conversation to the final details, it helps everyone move forward together.",
    members: [
      { id: "president", role: "President", department: "Department of Computer Science & Engineering" },
      { id: "vice-president", role: "Vice President", department: "Department of Electrical & Electronic Engineering" },
      { id: "general-secretary", role: "General Secretary", department: "Department of Civil Engineering" },
      { id: "joint-secretary", role: "Joint Secretary", department: "Department of Mechanical Engineering" },
    ].map((member) => ({ ...member, name: "Sample Member", image: memberImage })),
  },
  {
    id: "executive",
    label: "Executive Panel",
    description:
      "The executive panel connects the committee's plans with the teams carrying them out. It coordinates people, follows up on progress and makes room for members to contribute. Its work keeps the club organised, approachable and ready for the next idea.",
    members: sampleMembers("executive"),
  },
  {
    id: "dawah",
    label: "Dawah Team",
    description:
      "The Dawah team creates space to learn, reflect and ask thoughtful questions. Through study circles, conversations and reminders, it helps members connect Islamic learning with everyday campus life. A welcoming discussion and a useful lesson are at the heart of its work.",
    members: sampleMembers("dawah"),
  },
  {
    id: "social-media",
    label: "Social Media & Content Writing Team",
    description:
      "This team puts the club's work into words. It prepares announcements, shares stories and develops useful content so the campus community can follow what is happening and take part. Clear writing and thoughtful communication bring each activity beyond the room.",
    members: sampleMembers("social-media"),
  },
  {
    id: "graphics",
    label: "Graphics Team",
    description:
      "The graphics team gives our ideas a visual form. It designs posters, social content and event materials that feel connected to ARPC and easy to understand. From a small announcement to a full event identity, it makes the message clear and recognisable.",
    members: sampleMembers("graphics"),
  },
  {
    id: "logistics",
    label: "Logistics & Event Management Team",
    description:
      "This team brings a plan into the room. It looks after venues, materials, schedules and the practical details that help an event run smoothly. Working closely with the other teams, it makes each gathering welcoming, well prepared and easier for everyone to enjoy.",
    members: sampleMembers("logistics"),
  },
  {
    id: "web-dev",
    label: "Web Development Team",
    description:
      "The web development team builds and maintains the club's digital home. It brings information, events and member interfaces together in a website that is clear and accessible across devices. Its work helps people find the club, explore its activities and stay connected.",
    members: sampleMembers("web-dev"),
  },
];

