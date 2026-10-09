import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { publicAsset } from "../utils/publicAsset";
import MemberRoster from "../Components/MemberRoster";

const memberImage = "/images/team/member-placeholder.svg";
const sampleMembers = (teamId) =>
  Array.from({ length: 5 }, (_, index) => ({
    id: `${teamId}-${index + 1}`,
    name: "Sample Member",
    department: "Department of Computer Science & Engineering",
    image: memberImage,
  }));

// Replace sample profiles with verified club members when the roster is available.
const teams = [
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

const cardMotion = "duration-[650ms] ease-[cubic-bezier(0.22,0.68,0.18,1)] motion-reduce:transition-none";

function TeamCard({ team, index, expanded, onToggle, onHover, onLeave, onMemberOpen }) {
  const titleRef = useRef(null);
  const overviewRef = useRef(null);
  const rosterRef = useRef(null);
  const [sizes, setSizes] = useState({ title: 0, overview: 0, roster: 0 });

  useLayoutEffect(() => {
    // Measure natural content, not the animated wrappers, so height can interpolate.
    const measure = () => {
      const next = {
        title: Math.max(44, titleRef.current.getBoundingClientRect().height),
        overview: overviewRef.current.getBoundingClientRect().height,
        roster: rosterRef.current.getBoundingClientRect().height,
      };
      setSizes((previous) => Object.keys(next).every((key) => previous[key] === next[key]) ? previous : next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    [titleRef, overviewRef, rosterRef].forEach((ref) => observer.observe(ref.current));
    return () => observer.disconnect();
  }, []);

  return (
    <article
      aria-labelledby={`${team.id}-heading`}
      data-team-id={team.id}
      data-expanded={expanded}
      onPointerMove={(event) => {
        // Require mouse movement so scrolling a card under the cursor cannot open it.
        if (event.pointerType === "mouse" && event.buttons === 0) onHover(team.id);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onLeave(team.id);
      }}
      style={{
        "--heading-size": `${sizes.title}px`,
        "--overview-size": `${sizes.overview}px`,
        "--roster-size": `${sizes.roster}px`,
        "--frame-pad": expanded ? "var(--open-pad)" : "var(--card-pad)",
      }}
      className={`relative grid grid-cols-[3.5rem_minmax(0,1fr)] content-start gap-x-4 gap-y-5 overflow-hidden border-t border-[#eef4ef]/35 px-5 py-[var(--frame-pad)] transition-[height,background-color,padding-block] ${cardMotion} last:border-b [--card-pad:2.125rem] [--open-pad:1.75rem] [--number-row:3.825rem] [--content-gaps:2.5rem] [--closed-floor:18rem] sm:grid-cols-[38%_minmax(0,1fr)] sm:gap-x-7 sm:px-8 sm:[--card-pad:2.625rem] sm:[--open-pad:2.25rem] sm:[--number-row:0rem] sm:[--content-gaps:1.25rem] sm:[--closed-floor:19rem] lg:grid-cols-[40%_minmax(0,1fr)] lg:gap-x-10 lg:px-10 lg:[--card-pad:2.875rem] lg:[--open-pad:2.75rem] lg:[--closed-floor:20rem] xl:px-12 ${expanded ? "bg-[#173d2e] h-[max(var(--closed-floor),calc(var(--heading-size)+var(--roster-size)+var(--number-row)+var(--content-gaps)+2*var(--open-pad)))]" : "bg-[#102c21] hover:bg-[#173d2e] focus-within:bg-[#173d2e] h-[max(calc(var(--closed-floor)+0.75rem),calc(var(--heading-size)+var(--overview-size)+var(--number-row)+var(--content-gaps)+2*var(--card-pad)))]"}`}
    >
      {/* Keep each number entirely within its own card. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none col-start-1 row-start-1 self-start text-[4.5rem] font-light leading-[0.85] tracking-[-0.075em] transition-[color] ${cardMotion} sm:absolute sm:col-auto sm:row-auto sm:left-6 sm:self-auto sm:top-1/2 sm:-translate-y-[calc(50%+0.07em)] sm:text-[clamp(11rem,21vw,20rem)] lg:left-8 ${expanded ? "text-[#E9AD5E]" : "text-[#d9e6dd]"}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Keep the control aligned with the card's header padding. */}
      <button
        type="button"
        aria-label={`${expanded ? "Close team" : "View team"}: ${team.label}`}
        aria-expanded={expanded}
        aria-controls={`${team.id}-members`}
        onClick={() => onToggle(team.id)}
        className={`group relative z-10 col-start-2 row-start-1 flex min-h-11 shrink-0 cursor-pointer items-center self-start justify-self-end gap-2 rounded-full py-1 pl-3 pr-1 text-[#eef4ef] outline-offset-6 transition-[top,background-color] ${cardMotion} hover:bg-[#eef4ef]/10 focus-visible:outline-2 focus-visible:outline-[#E9AD5E] sm:absolute sm:top-[var(--frame-pad)] sm:right-8 sm:col-auto sm:row-auto sm:self-auto lg:right-10 xl:right-12`}
      >
        <span className="text-sm font-medium">{expanded ? "Close team" : "View team"}</span>
        <span className="flex size-11 items-center justify-center rounded-full border border-[#eef4ef]/40 transition-colors group-hover:bg-[#eef4ef]/10 motion-reduce:transition-none">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
            <path d="M5 12h14" />
            <path d="M12 5v14" className={`origin-center transition-transform ${cardMotion} ${expanded ? "scale-y-0" : "scale-y-100"}`} />
          </svg>
        </span>
      </button>

      <div className={`contents sm:absolute sm:right-8 sm:left-[calc(38%+1.5rem)] sm:block sm:transition-[top,translate] ${cardMotion} lg:right-10 lg:left-[calc(40%+1.25rem)] xl:right-12 ${expanded ? "sm:top-1/2 sm:-translate-y-1/2" : "sm:top-[var(--card-pad)] sm:translate-y-0"}`}>
      <div className="contents sm:block sm:min-w-0 sm:pr-36 lg:pr-40">
        <h2
          ref={titleRef}
          id={`${team.id}-heading`}
          className="col-span-2 row-start-2 min-w-0 max-w-[24ch] self-center text-balance font-garamond text-[1.8rem] font-semibold leading-[1.13] text-[#eef4ef] sm:col-span-1 sm:row-auto sm:text-[2.2rem] lg:text-[2.75rem]"
        >
          {team.label}
        </h2>
      </div>

      <div className="col-span-2 min-w-0 sm:mt-5">
        <div
          aria-hidden={expanded}
          className={`grid transition-[grid-template-rows,opacity] ${cardMotion} ${expanded ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
        >
          <div className="min-h-0 overflow-hidden">
            <p ref={overviewRef} className="max-w-[68ch] text-justify text-base leading-[1.85] text-[#d9e6dd] sm:text-[1.0625rem] lg:text-lg">
              {team.description}
            </p>
          </div>
        </div>

        <div
          id={`${team.id}-members`}
          role="region"
          aria-label={`${team.label} members`}
          aria-hidden={!expanded}
          inert={!expanded}
          className={`grid transition-[grid-template-rows,opacity] ${cardMotion} ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div ref={rosterRef}>
              <MemberRoster key={`${team.id}-${expanded}`} team={team} onOpen={() => onMemberOpen(team.id)} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </article>
  );
}

export default function TeamPage() {
  const [activeTeam, setActiveTeam] = useState(null);
  const interaction = useRef(null);
  const hoverTimer = useRef(null);
  const pendingTeam = useRef(null);
  const dismissedTeam = useRef(null);
  const clearHoverTimer = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    pendingTeam.current = null;
  }, []);
  const hoverTeam = (id) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || dismissedTeam.current === id) return;
    if (interaction.current?.id === id) {
      clearHoverTimer();
      return;
    }
    if (pendingTeam.current === id) return;
    clearHoverTimer();
    pendingTeam.current = id;
    hoverTimer.current = window.setTimeout(() => {
      pendingTeam.current = null;
      hoverTimer.current = null;
      interaction.current = { id, source: "hover" };
      setActiveTeam(id);
    }, 120);
  };
  const leaveTeam = (id) => {
    clearHoverTimer();
    if (dismissedTeam.current === id) dismissedTeam.current = null;
    if (interaction.current?.id !== id || interaction.current.source !== "hover") return;
    // A short grace period prevents flicker at card boundaries.
    hoverTimer.current = window.setTimeout(() => {
      hoverTimer.current = null;
      if (interaction.current?.id === id && interaction.current.source === "hover") {
        interaction.current = null;
        setActiveTeam(null);
      }
    }, 180);
  };
  const toggleTeam = (id) => {
    clearHoverTimer();
    if (interaction.current?.id === id) {
      dismissedTeam.current = id;
      interaction.current = null;
      setActiveTeam(null);
    } else {
      dismissedTeam.current = null;
      interaction.current = { id, source: "activation" };
      setActiveTeam(id);
    }
  };

  const pinTeamForMember = (id) => {
    clearHoverTimer();
    dismissedTeam.current = null;
    interaction.current = { id, source: "activation" };
    setActiveTeam(id);
  };

  useEffect(() => {
    const dismissTeam = (event) => {
      if (event.key !== "Escape") return;
      clearHoverTimer();
      dismissedTeam.current = interaction.current?.id ?? null;
      interaction.current = null;
      setActiveTeam(null);
    };
    const cancelPendingHover = () => {
      // Cancel entry intent during scrolling, but let a scheduled exit complete.
      if (pendingTeam.current) clearHoverTimer();
    };
    document.addEventListener("keydown", dismissTeam);
    window.addEventListener("scroll", cancelPendingHover, true);
    return () => {
      clearHoverTimer();
      document.removeEventListener("keydown", dismissTeam);
      window.removeEventListener("scroll", cancelPendingHover, true);
    };
  }, [clearHoverTimer]);

  return (
    <section aria-labelledby="team-page-heading" className="bg-white pb-12 text-[#173d2e] md:pb-16">
      <header className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-[#102c21] text-white sm:min-h-[25rem] lg:min-h-[28rem]">
        {/* Stock meeting placeholders, not club portraits. Replace with ARPC photography.
            Walls.io: https://unsplash.com/photos/O0jOMufR1_g
            Vlada Karpovich: https://www.pexels.com/photo/people-having-a-meeting-7433823/ */}
        <picture aria-hidden="true" className="pointer-events-none absolute inset-0 -z-30">
          <source media="(max-width: 639px)" srcSet={publicAsset("/images/team/meeting-discussion.jpg")} />
          <img
            src={publicAsset("/images/team/meeting-planning.jpg")}
            alt=""
            width="1200"
            height="703"
            fetchPriority="high"
            className="size-full object-cover object-[55%_45%] grayscale-[0.65] sm:object-[center_45%]"
          />
        </picture>
        {/* A second view of collaboration forms a diagonal photographic spread. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 -z-20 hidden w-[56%] overflow-hidden [clip-path:polygon(0_0,100%_0,84%_100%,0_100%)] sm:block">
          <img
            src={publicAsset("/images/team/meeting-discussion.jpg")}
            alt=""
            width="1600"
            height="1067"
            className="size-full object-cover object-[65%_42%] grayscale-[0.65]"
          />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-[#102c21]/85 via-[#102c21]/65 to-[#102c21]/30" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-[#102c21]/85 via-transparent to-[#102c21]/35" />
        <div className="flex w-full flex-col items-start gap-6 px-6 pt-28 pb-8 sm:gap-7 sm:pt-32 sm:pb-10 lg:mx-20 lg:w-auto lg:flex-1 lg:pb-12 2xl:px-24">
          <h1 id="team-page-heading" className="font-garamond text-[clamp(2.5rem,9vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.025em] text-[#eef4ef] sm:text-[clamp(3.75rem,7vw,6rem)]">
            <span className="block">The teams</span>{" "}
            <span className="block">behind <span className="text-[#E9AD5E]">ARPC</span>.</span>
          </h1>
          <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <p className="min-w-0 max-w-[72ch] flex-1 text-justify text-base leading-[1.75] text-[#eef4ef] lg:text-lg">
              Meet the people behind our events, ideas and campus community. Explore their teams and find where you can contribute.
            </p>
            <Link
              to="/register"
              className="group inline-flex min-h-14 shrink-0 items-center justify-center self-end gap-7 rounded-full border border-[#eef4ef]/30 bg-[#eef4ef] px-6 py-3 text-base font-semibold leading-normal text-[#102c21] transition-colors duration-200 hover:border-[#E9AD5E] hover:bg-[#E9AD5E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E] motion-reduce:transition-none sm:px-7 sm:text-lg"
            >
              Join ARPC
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
                <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      <div className="max-w-8xl px-6 pt-10 lg:mx-20 lg:pt-14 2xl:px-24">
        <div id="panel-teams" aria-label="Club teams" className="scroll-mt-6">
          {teams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              index={index}
              expanded={activeTeam === team.id}
              onToggle={toggleTeam}
              onHover={hoverTeam}
              onLeave={leaveTeam}
              onMemberOpen={pinTeamForMember}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
