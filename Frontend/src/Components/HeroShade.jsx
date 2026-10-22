// Darken photography without changing the hero text, controls or light appearance.
export default function HeroShade() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-black/20 opacity-0 transition-opacity duration-200 dark:opacity-100 motion-reduce:transition-none" />;
}
