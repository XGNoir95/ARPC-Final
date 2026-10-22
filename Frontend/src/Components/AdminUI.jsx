import { createElement, useEffect, useRef, useState } from 'react';
import { FiSearch, FiX, FiCheck, FiArrowUpRight } from 'react-icons/fi';
import { publicAsset } from '../utils/publicAsset';
import { adminFocus, adminQuiet, adminInput, adminPanel, adminTypography } from './AdminUI.styles';
import StateView from './StateView';

export function AdminBadge({value='draft',children}) {
  const positive=['active','approved','published','verified'].includes(value);
  const negative=['rejected','suspended','failed'].includes(value);
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium ${negative?'bg-danger-soft text-danger':positive?'bg-raised text-ink':'bg-warning-soft text-warning'}`}><span aria-hidden="true" className={`size-1.5 rounded-full ${negative?'bg-[#b65449]':positive?'bg-[#3f7857]':'bg-[#d69c48]'}`}/>{children || `${value[0].toUpperCase()}${value.slice(1)}`}</span>;
}
export function AdminAvatar({name='',image,size='size-11'}) {
  const [failed,setFailed]=useState('');
  return <span aria-hidden="true" className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-raised font-garamond text-xl font-semibold text-ink ${size}`}>{image&&image!==failed?<img src={publicAsset(image)} alt="" className="size-full object-cover" onError={()=>setFailed(image)}/>:name.split(' ').filter(Boolean).slice(0,2).map(s=>s[0]).join('') || 'A'}</span>;
}
export function AdminEmpty({title,description,children,icon:Icon=FiArrowUpRight}) {
  return <StateView fill title={title} description={description} icon={Icon}>{children&&<div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-center">{children}</div>}</StateView>;
}
export function AdminSegments({label,options,value,onChange}) {
  return <div role="group" aria-label={label} className="flex max-w-full flex-wrap gap-1 rounded-xl bg-soft p-1">{options.map(([id,title,count])=><button type="button" key={id} aria-pressed={id===value} onClick={()=>onChange(id)} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-base font-medium sm:px-3.5 transition-colors motion-reduce:transition-none ${adminFocus} ${id===value?'bg-surface text-ink shadow-sm':'text-muted hover:text-ink'}`}>{title}{count!==undefined&&<span className={`rounded-md px-1.5 text-sm ${id===value?'bg-soft':'bg-transparent'}`}>{count}</span>}</button>)}</div>;
}
export function AdminSearch({value,onChange,label='Search entries',placeholder='Search entries',id}) {
  return <div className="relative min-w-0"><FiSearch aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"/><input id={id} type="search" value={value} onChange={e=>onChange(e.target.value)} aria-label={label} placeholder={placeholder} className={`${adminInput} pl-11`}/></div>;
}
export function AdminDialog({title,children,onClose,wide=false}) {
  const dialog=useRef(null);const opener=useRef(document.activeElement);
  useEffect(()=>{const el=dialog.current;const trigger=opener.current;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';if(el.showModal)el.showModal();else el.setAttribute('open','');if(el.animate&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)el.animate([{opacity:0,transform:'translateY(10px) scale(.985)'},{opacity:1,transform:'none'}],{duration:180,easing:'cubic-bezier(.22,1,.36,1)'});return()=>{el.close?.();document.body.style.overflow=overflow;queueMicrotask(()=>{if(trigger?.isConnected)trigger.focus();else document.getElementById('admin-search')?.focus();});};},[]);
  return <dialog ref={dialog} aria-label={title} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}} className={`m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] overflow-y-auto overscroll-contain rounded-3xl border border-ink/15 bg-surface p-0 font-sans text-base leading-7 text-ink shadow-2xl [&::backdrop]:bg-brand-panel/50 [&::backdrop]:backdrop-blur-sm ${wide === 'preview' ? 'max-w-[90rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : wide ? 'max-w-5xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'max-w-xl'}`}><header className="sticky top-0 z-10 flex items-center justify-between gap-5 border-b border-ink/12 bg-surface/95 px-5 py-4 backdrop-blur-sm sm:px-8"><h2 className={adminTypography.sectionTitle}>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className={`${adminQuiet} size-11 shrink-0 px-0`}><FiX aria-hidden="true"/></button></header>{children}</dialog>;
}
export function AdminField({label,name,value='',multiline=false,children,help,...props}) {
  return <label className="block min-w-0 text-base font-semibold">{label}{children?<select name={name} defaultValue={value} className={`${adminInput} mt-2`} {...props}>{children}</select>:multiline?<textarea name={name} defaultValue={value} rows={5} className={`${adminInput} mt-2 resize-y`} {...props}/>:<input name={name} defaultValue={value} className={`${adminInput} mt-2`} {...props}/>} {help&&<span className="mt-2 block text-sm font-normal leading-relaxed text-muted">{help}</span>}</label>;
}
export function AdminCheck({checked,label,onChange}) {return <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg text-base"><span className={`flex size-5 shrink-0 items-center justify-center rounded border focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${checked?'border-ink bg-action text-on-action':'border-ink/30 bg-surface'}`}><input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only"/>{checked&&<FiCheck aria-hidden="true" className="size-3.5"/>}</span>{label}</label>;}
export function AdminSection({title,description,children,aside,fill=true}) {return <section className={`${adminPanel} flex flex-col overflow-hidden ${fill?'h-full':''}`}><header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 p-5 sm:p-6"><div className="min-w-0"><h2 className={adminTypography.sectionTitle}>{title}</h2>{description&&<p className="mt-2 max-w-[60ch] text-base leading-relaxed text-muted">{description}</p>}</div>{aside}</header><div className={`flex min-h-0 flex-col ${fill?'flex-1':''}`}>{children}</div></section>;}

export function AdminIcon({icon,...props}) { return createElement(icon,props); }
