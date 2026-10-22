import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const css = readFileSync('src/index.css', 'utf8');
const light = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[a-f\d]{6});/gi)].map(([, key, value]) => [key, value]));
const dark = { ...light, ...Object.fromEntries([...css.matchAll(/dark:\[--color-([\w-]+):(#[a-f\d]{6})\]/gi)].map(([, key, value]) => [key, value])) };
const luminance = hex => {
  const rgb = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};
const contrast = (a, b) => { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + 0.05) / (values[1] + 0.05); };

it.each([['light',light],['dark',dark]])('keeps core text, controls and feedback readable in %s mode', (mode, colors) => {
  // Preserve the existing light palette; all new dark surfaces must meet the threshold.
  for (const bg of mode === 'dark' ? ['page','surface','soft','field','raised'] : ['page','surface','soft','field']) {
    for (const fg of ['ink','muted','copy']) expect(contrast(colors[fg],colors[bg]),`${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  }
  expect(contrast(colors['on-action'],colors.action)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colors.brand,colors.gold)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colors.danger,colors['danger-soft'])).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colors.warning,colors['warning-soft'])).toBeGreaterThanOrEqual(4.5);
});

it('uses neutral dark surfaces and subtly deeper green UI colors',()=>{
  for(const key of ['page','surface','soft','field','raised']){
    const channels=dark[key].slice(1).match(/../g);
    expect(new Set(channels).size,key).toBe(1);
  }
  for(const key of ['action','brand','brand-deep','brand-panel','brand-forest','brand-sage','brand-muted','brand-leaf','brand-leaf-light','device-frame','device-edge','device-stand','device-indicator','device-base','device-notch']){
    expect(luminance(dark[key]),key).toBeLessThan(luminance(light[key]));
    const base=light[key].slice(1).match(/../g).map(value=>parseInt(value,16));
    const shaded=dark[key].slice(1).match(/../g).map(value=>parseInt(value,16));
    // A black tint keeps the existing hue; it does not replace the brand palette.
    base.forEach((value,index)=>expect(Math.abs(shaded[index]-value*0.8),key).toBeLessThanOrEqual(1));
  }
  expect(dark['on-action']).toBe(light['on-action']);
});

it('keeps labels readable on the dark green panels and catalogue illustrations',()=>{
  for(const background of ['brand','brand-deep','brand-panel','brand-forest','brand-muted']){
    expect(contrast('#eef4ef',dark[background]),background).toBeGreaterThanOrEqual(4.5);
  }
  for(const background of ['brand','brand-deep','brand-panel','brand-forest']){
    expect(contrast(dark.gold,dark[background]),`gold on ${background}`).toBeGreaterThanOrEqual(4.5);
  }
  expect(contrast(dark['book-sage-ink'],dark['brand-sage'])).toBeGreaterThanOrEqual(4.5);
});
