import reflection from "../assets/courses/reflection-cover.svg?no-inline";
import writing from "../assets/courses/writing-cover.svg?no-inline";
import history from "../assets/courses/seerah-cover.svg?no-inline";
import learning from "../assets/courses/learning-cover.svg?no-inline";
import nature from "../assets/courses/nature-cover.svg?no-inline";
import science from "../assets/courses/science-cover.svg?no-inline";
import community from "../assets/courses/community-cover.svg?no-inline";
import leadership from "../assets/courses/leadership-cover.svg?no-inline";
import language from "../assets/courses/language-cover.svg?no-inline";
import creativity from "../assets/courses/creativity-cover.svg?no-inline";
import technology from "../assets/courses/technology-cover.svg?no-inline";
import { publicAsset } from "./publicAsset";

const themes = {
  reflection: { label: "Reflection", color: "#dce8df", ink: "var(--color-brand)", cover: reflection },
  writing: { label: "Writing", color: "#E9AD5E", ink: "var(--color-brand)", cover: writing },
  history: { label: "History", color: "var(--color-brand-muted)", ink: "#fff", cover: history },
  learning: { label: "General learning", color: "#b9cdbd", ink: "var(--color-brand)", cover: learning },
  nature: { label: "Nature", color: "var(--color-brand-muted)", ink: "#fff", cover: nature },
  science: { label: "Science", color: "#dce8df", ink: "var(--color-brand)", cover: science },
  community: { label: "Community", color: "#b9cdbd", ink: "var(--color-brand)", cover: community },
  leadership: { label: "Leadership", color: "#E9AD5E", ink: "var(--color-brand)", cover: leadership },
  language: { label: "Language", color: "#dce8df", ink: "var(--color-brand)", cover: language },
  creativity: { label: "Creativity", color: "#E9AD5E", ink: "var(--color-brand)", cover: creativity },
  technology: { label: "Technology", color: "var(--color-brand-muted)", ink: "#fff", cover: technology },
};

// A future admin picker can use the label and cover as its preview and save id
// to the course's coverTheme. These ids stay independent of course records.
export const courseCoverPresets = Object.entries(themes).map(([id, theme]) => ({ id, ...theme }));

export function getCourseCover(item) {
  const subject = `${item.title} ${item.format}`.toLowerCase();
  const inferred = /seerah|history|heritage/.test(subject) ? "history"
    : /writ|communication|storytelling|content/.test(subject) ? "writing"
    : /qur.?an|reflection|faith|spiritual/.test(subject) ? "reflection"
    : /coding|programming|technology|software|computer/.test(subject) ? "technology"
    : /science|physics|chemistry|biology/.test(subject) ? "science"
    : /language|english|arabic|linguistic/.test(subject) ? "language"
    : /nature|environment|ecology|sustainab/.test(subject) ? "nature"
    : /leadership|management|planning/.test(subject) ? "leadership"
    : /design|creativity|creative|art\b/.test(subject) ? "creativity"
    : /community|service|volunteer/.test(subject) ? "community" : "learning";
  const theme = Object.hasOwn(themes, item.coverTheme) ? themes[item.coverTheme] : themes[inferred];
  const custom = typeof item.coverImage === "string" && item.coverImage.trim();
  return {
    ...theme,
    cover: custom ? /^https?:\/\//i.test(custom) ? custom : publicAsset(custom) : theme.cover,
    fallbackCover: theme.cover,
  };
}
