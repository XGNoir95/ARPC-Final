import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion, useIsPresent, useReducedMotion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { publicAsset } from "../utils/publicAsset";

function MemberSocial({ member, label, url, icon }) {
  const SocialIcon = icon;
  const classes = "group/social flex w-14 flex-col items-center gap-2 rounded-lg text-[#eef4ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9AD5E] sm:w-16";
  const content = (
    <>
      <span className="flex size-12 items-center justify-center rounded-full bg-[#eef4ef]/10 transition-[background-color,color,translate] duration-250 ease-out group-hover/social:-translate-y-0.5 group-hover/social:bg-[#E9AD5E] group-hover/social:text-[#102c21] group-focus-visible/social:bg-[#E9AD5E] group-focus-visible/social:text-[#102c21] motion-reduce:translate-y-0 motion-reduce:transition-none sm:size-14">
        <SocialIcon aria-hidden="true" className="size-6 sm:size-7" />
      </span>
      <span aria-hidden="true" className="text-xs font-medium leading-tight text-[#d9e6dd] transition-colors duration-250 group-hover/social:text-[#E9AD5E] group-focus-visible/social:text-[#E9AD5E] motion-reduce:transition-none">{label}</span>
    </>
  );
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on ${label}`} title={`${member.name} on ${label}`} className={classes}>
      {content}
    </a>
  ) : (
    <span role="img" aria-label={`${label} profile unavailable`} title={`${label} profile not added yet`} className={`${classes} cursor-default`}>
      {content}
    </span>
  );
}

function ProfileExpansion({ origin, reduceMotion, children }) {
  const present = useIsPresent();
  return (
    <Motion.div
      aria-hidden={!present}
      inert={!present}
      initial={{ clipPath: reduceMotion ? "inset(0px 0px 0px 0px)" : origin, opacity: reduceMotion ? 1 : 0 }}
      animate={{ clipPath: "inset(0px 0px 0px 0px)", opacity: 1 }}
      exit={{ clipPath: origin, opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 0.68, 0.18, 1] }}
      className="absolute inset-0 flex flex-col bg-[#173d2e]"
    >
      {children}
    </Motion.div>
  );
}

export default function MemberRoster({ team, onOpen }) {
  const [selected, setSelected] = useState(null);
  const buttons = useRef(new Map());
  const backButton = useRef(null);
  const profileRef = useRef(null);
  const previousSelection = useRef(null);
  const profileId = `${team.id}-member-profile`;
  const member = team.members.find((person) => person.id === selected?.id);
  const reduceMotion = useReducedMotion();

  const open = (id) => {
    const row = buttons.current.get(id)?.getBoundingClientRect();
    const area = profileRef.current?.getBoundingClientRect();
    const origin = row && area
      ? `inset(${Math.max(0, row.top - area.top)}px ${Math.max(0, area.right - row.right)}px ${Math.max(0, area.bottom - row.bottom)}px ${Math.max(0, row.left - area.left)}px)`
      : "inset(40% 40% 40% 40%)";
    setSelected({ id, origin });
    onOpen?.();
  };
  const close = () => setSelected(null);

  useLayoutEffect(() => {
    if (selected) backButton.current?.focus();
    else if (previousSelection.current) {
      buttons.current.get(previousSelection.current.id)?.focus();
    }
    previousSelection.current = selected;
  }, [selected]);

  return (
    <div
      className="relative grid"
      onKeyDown={(event) => {
        if (event.key === "Escape" && selected) {
          event.stopPropagation();
          close();
        }
      }}
    >
      {/* The roster always supplies the height; the profile fills that same space. */}
      <ul
        aria-label={`${team.label} roster`}
        aria-hidden={Boolean(member)}
        inert={Boolean(member)}
        className={`grid gap-x-6 transition-[opacity,scale] duration-500 ease-out motion-reduce:transition-none motion-reduce:scale-100 xl:grid-cols-2 ${member ? "pointer-events-none scale-[0.98] opacity-0" : "scale-100 opacity-100"}`}
      >
        {team.members.map((person, index) => (
          <li key={person.id} className="min-w-0 border-t border-[#eef4ef]/20">
            <button
              ref={(node) => { if (node) buttons.current.set(person.id, node); else buttons.current.delete(person.id); }}
              type="button"
              aria-label={`View profile: ${person.name}, ${person.role || `${team.label} member ${index + 1}`}`}
              aria-controls={profileId}
              aria-expanded={selected?.id === person.id}
              onClick={() => open(person.id)}
              className="group/member flex h-full w-full cursor-pointer items-start gap-3 rounded-b-xl px-3 py-4 text-left transition-colors duration-300 hover:bg-[#eef4ef]/5 focus-visible:bg-[#eef4ef]/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#E9AD5E] motion-reduce:transition-none"
            >
              <img src={publicAsset(person.image)} alt="" width="56" height="56" loading="lazy" decoding="async" className="size-14 shrink-0 rounded-full bg-[#eef4ef] object-cover" />
              <span className="min-w-0">
                <span className="block font-garamond text-[1.4rem] font-semibold leading-tight text-[#eef4ef] transition-colors duration-300 group-hover/member:text-[#E9AD5E] motion-reduce:transition-none">{person.name}</span>
                {person.role && <span className="mt-1 block text-sm font-medium text-[#E9AD5E]">{person.role}</span>}
                <span className="mt-1 block text-[0.8125rem] leading-relaxed text-[#d9e6dd]">{person.department}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div
        ref={profileRef}
        id={profileId}
        role="region"
        aria-label={member ? `${member.name}, ${member.role || team.label} profile` : "Member profile"}
        aria-hidden={!member}
        inert={!member}
        className={`absolute inset-0 min-h-0 overflow-hidden ${member ? "" : "pointer-events-none"}`}
      >
        <AnimatePresence initial={false}>
          {member && (
            <ProfileExpansion key={member.id} origin={selected.origin} reduceMotion={reduceMotion}>
              <div className="flex shrink-0 justify-end">
                <button ref={(node) => { if (node) backButton.current = node; }} type="button" onClick={close} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-[#d9e6dd] transition-colors hover:text-[#E9AD5E] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#E9AD5E] motion-reduce:transition-none">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4"><path d="m10 6-6 6 6 6M4 12h16" /></svg>
                  All members
                </button>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-[5rem_minmax(0,1fr)] content-center items-center gap-x-4 gap-y-5 px-2 pb-4 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:px-3 xl:grid-cols-[8rem_minmax(0,1fr)_auto] xl:gap-x-6">
                <img src={publicAsset(member.image)} alt="" width="128" height="128" className="size-20 rounded-full bg-[#eef4ef] object-cover xl:size-32" />
                <div className="min-w-0">
                  <h3 className="break-words font-garamond text-[1.6rem] font-semibold leading-[1.05] text-[#eef4ef] sm:text-[1.9rem] xl:text-[2.5rem]">{member.name}</h3>
                  <p className="mt-3 text-base font-medium text-[#E9AD5E] sm:text-lg">{member.role || "Team member"}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#d9e6dd] sm:text-base">{member.department}</p>
                </div>
                <div aria-label="Social profiles" className="col-span-2 flex items-center justify-self-end gap-2 sm:col-span-1">
                  <MemberSocial member={member} label="LinkedIn" url={member.linkedin} icon={FaLinkedin} />
                  <MemberSocial member={member} label="GitHub" url={member.github} icon={FaGithub} />
                </div>
              </div>
            </ProfileExpansion>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
