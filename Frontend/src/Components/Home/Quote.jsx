import { publicAsset } from "../../utils/publicAsset";

const Quote = ({ onReflectionToggle }) => (
  <figure
    aria-labelledby="founder-attribution"
    className="flex h-full min-w-0 flex-col bg-[#eef4ef] px-6 py-12 text-[#173d2e] sm:py-14 lg:py-16 lg:pr-12 lg:pl-26 2xl:pr-16 2xl:pl-44"
  >
    <figcaption id="founder-attribution" className="flex items-center gap-4">
      <img
        src={publicAsset("/founder.png")}
        alt="Portrait of Khan Bahadur Ahsanullah (R.)"
        loading="lazy"
        decoding="async"
        width="80"
        height="80"
        className="size-16 shrink-0 rounded-full bg-[#dce8df] object-cover object-[center_15%] sm:size-32"
      />
      <div className="min-w-0">
        <p className="font-garamond text-xl leading-tight font-semibold text-balance sm:text-3xl">
          Khan Bahadur Ahsanullah (R.)
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[#173d2e]/70 sm:text-[1rem]">
          Founder, Dhaka Ahsania Mission &amp; AUST
        </p>
      </div>
    </figcaption>

    <blockquote className="my-8 flex flex-1 items-center font-garamond text-[clamp(1.8rem,3.1vw,3.25rem)] leading-[1.15] font-medium tracking-[-0.02em] text-pretty italic sm:my-10">
      <p className="max-w-[30ch]">
        “The perfect knowledge is that which reduces the distance between the
        Creator and the created and establishes union between them.”
      </p>
    </blockquote>

    <details
      onToggle={(event) => onReflectionToggle?.(event.currentTarget.open)}
      className="group border-t border-[#173d2e]/15 pt-6"
    >
      <summary className="flex min-h-12 w-fit cursor-pointer list-none items-center gap-5 rounded-full border border-[#173d2e]/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-[#173d2e] hover:bg-[#173d2e] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700 motion-reduce:transition-none [&::-webkit-details-marker]:hidden sm:text-base">
        <span>Read the full reflection</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <p className="mt-4 max-w-[65ch] font-garamond text-xl leading-relaxed text-[#173d2e]/85 sm:text-2xl">
        The education which caters both to the body and the mind is the real
        education. We should make our generation aware of it. Our responsibility
        does not end with the fulfillment of our earthly obligation. It is our
        bounded duty to be aware of the purpose for which we have been created
        and we should make every effort to realise the fact. Knowledge by itself
        cannot bring about perfection in a man. One needs to co-ordinate his
        body, mind and soul. That is knowledge which caters to the body, mind
        and soul. The perfect knowledge is that which reduces the distance
        between the Creator and the created and establishes union between them.
      </p>
    </details>
  </figure>
);

export default Quote;
