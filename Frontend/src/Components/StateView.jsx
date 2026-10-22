import { createElement, useId } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiCheckCircle, FiClock, FiCompass, FiImage, FiInbox, FiLoader, FiLock, FiSearch, FiShield, FiUsers, FiWifiOff } from 'react-icons/fi';
import { publicAsset } from '../utils/publicAsset';
import { publicPageFrame } from './PublicLayout.styles';
import { stateViewStyles as styles } from './StateView.styles';

const icons = { empty: FiInbox, programmes: FiCalendar, gallery: FiImage, team: FiUsers, search: FiSearch, error: FiWifiOff, loading: FiLoader, access: FiShield, pending: FiClock, locked: FiLock, success: FiCheckCircle, missing: FiCompass, learning: FiBookOpen };
export const stateFocus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink';
export const statePrimary = `inline-flex min-h-12 max-w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-action px-6 py-3 text-center text-sm font-semibold text-on-action transition-colors hover:bg-[#E9AD5E] hover:text-brand disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none ${stateFocus}`;
export const stateSecondary = `inline-flex min-h-12 max-w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-ink/20 bg-surface px-6 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-[#E9AD5E] hover:bg-[#E9AD5E] hover:text-brand disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none ${stateFocus}`;

export function StateActions({ actions = [] }) {
  return actions.length > 0 && <div className={styles.actions}>{actions.map(({ label, to, href, onClick, secondary = false, disabled = false, busy = false }) => {
    const props = { className: secondary ? stateSecondary : statePrimary };
    return to ? <Link key={label} to={to} {...props}>{label}</Link> : href ? <a key={label} href={href} {...props}>{label}</a> : <button key={label} type="button" onClick={onClick} disabled={disabled || busy} aria-busy={busy} {...props}>{busy && <FiLoader aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none"/>}{label}</button>;
  })}</div>;
}

export default function StateView({ title, description, kind = 'empty', actions = [], children, headingLevel = 2, compact = false, fill = false, icon }) {
  const id = useId();
  const Icon = icon || icons[kind] || FiInbox;
  return <section aria-labelledby={id} aria-busy={kind==='loading'} className={`${styles.panel} ${fill ? 'flex-1' : ''} ${compact ? 'min-h-64 py-8' : 'min-h-80 py-10 sm:py-12'}`}>
    <div className={styles.content}>
      <span aria-hidden="true" className={styles.icon}><Icon className={`size-7 ${kind === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''}`}/></span>
      {createElement(`h${headingLevel}`, { id, className: styles.title }, title)}
      <p role={kind==='error'?'alert':kind==='loading'?'status':undefined} className={styles.description}>{description}</p>
      {children && <div className="w-full min-w-0 text-left">{children}</div>}
      <StateActions actions={actions}/>
    </div>
  </section>;
}

export function StatePage({ standalone = false, ...props }) {
  return <section className={`flex min-h-[65svh] flex-col bg-soft text-ink ${standalone ? 'min-h-svh' : ''}`}>
    {standalone && <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10"><Link to="/" aria-label="ARPC home" className={`flex items-center gap-3 rounded-lg ${stateFocus}`}><img src={publicAsset('/logo.jpg')} alt="" width="64" height="64" className="size-14 rounded-full sm:size-16"/><span><span className="block font-garamond text-3xl font-semibold">ARPC</span><span className="block text-sm text-muted">Ahsanullah Roh. Peace Club</span></span></Link><Link to="/" className={`inline-flex min-h-11 items-center rounded-lg text-sm font-semibold ${stateFocus}`}>Back to home</Link></header>}
    <div className={`flex flex-1 flex-col justify-center py-12 sm:py-16 ${standalone ? 'mx-auto w-full max-w-5xl px-6 sm:px-10' : publicPageFrame}`}><StateView {...props} headingLevel={1}/></div>
  </section>;
}

export function Notice({ title, children, tone = 'error', action, busy = false }) {
  const Icon = tone === 'success' ? FiCheckCircle : tone === 'info' ? FiClock : FiWifiOff;
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`flex flex-wrap items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${tone === 'error' ? 'border-danger/20 bg-danger-soft text-danger' : 'border-ink/15 bg-soft text-copy'}`}>
    <Icon aria-hidden="true" className="mt-1 size-5 shrink-0"/>
    <div className="min-w-0 flex-1">{title && <p className="font-semibold">{title}</p>}<div>{children}</div>{action && <button type="button" disabled={busy} onClick={action.onClick} className={`mt-2 inline-flex min-h-11 cursor-pointer items-center rounded font-semibold underline underline-offset-4 disabled:opacity-60 ${stateFocus}`}>{busy ? 'Trying again…' : action.label}</button>}</div>
  </div>;
}
