// Existing local imagery for the first gallery draft. Replace illustrative photos
// with confirmed club photography and update captions when the archive is ready.
export const galleryHero = "/heroBanner.jpg";

export const galleryPhotos = [
  {
    id: "campus-life", category: "Campus", title: "Where it all begins",
    image: "/heroBanner.jpg", alt: "Students walking through a sunlit campus courtyard",
    description: "Between classes and conversations, campus is where new friendships and shared ideas begin.",
    placeholder: true,
  },
  {
    id: "time-together", category: "Community", title: "Time together, well spent",
    image: "/images/about/community.jpg", alt: "Friends standing together outdoors with their arms around one another",
    description: "Friendship gives our community its warmth. There is room to meet someone new, share a thought and feel at home.",
    placeholder: true,
  },
  {
    id: "shared-learning", category: "Learning", title: "Learning, side by side",
    image: "/images/about/learning.jpg", alt: "Students listening and taking part in a classroom session",
    description: "Reading circles and shared discussions make space for questions, reflection and a deeper understanding of faith.",
    placeholder: true,
  },
  {
    id: "planning-together", category: "Behind the scenes", title: "From an idea to a plan",
    image: "/images/team/meeting-planning.jpg", alt: "A team sharing ideas around a meeting table",
    description: "Before a programme reaches the campus, teams share ideas, agree on responsibilities and work through the details.",
    placeholder: true,
  },
  {
    id: "shared-conversations", category: "Behind the scenes", title: "Room for conversation",
    image: "/images/team/meeting-discussion.jpg", alt: "People reviewing material together during a discussion",
    description: "Listening to one another helps turn a good idea into something useful for students and the wider community.",
    placeholder: true,
  },
  {
    id: "quiet-reflection", category: "Community", title: "A moment to reflect",
    image: "/images/about/nature.jpg", alt: "Sunlight falling on a mountain above trees and a grassy meadow",
    description: "Growing together also means making space to pause, reflect and carry what we learn into everyday life.",
    placeholder: true,
  },
  {
    id: "islamic-quiz", category: "Learning", title: "Ma’ariful Islamiyyah",
    image: "/event1.png", alt: "ARPC Islamic Quiz Competition poster for Ma’ariful Islamiyyah, Season 3, based on Riyad as-Salihin",
    description: "Club artwork for the Islamic Quiz Competition, Season 3. The programme brings learning and friendly competition together through Riyad as-Salihin.",
    placeholder: false, poster: true,
  },
];

// Wrap neighbouring pages around the active photo; IDs stay stable during turns.
export function journalOffset(index, active, length) {
  let offset = index - active;
  if (offset > Math.floor(length / 2)) offset -= length;
  if (offset < -Math.floor(length / 2)) offset += length;
  return offset;
}

export function journalPosition(offset) {
  return offset === 0 ? 0 : Math.sign(offset) * (17 + (Math.abs(offset) - 1) * 10);
}
