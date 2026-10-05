// src/components/Quote.jsx
import React from "react";
import { publicAsset } from "../../utils/publicAsset";

const Quote = () => {
  return (
    <section className="my-10 py-16 bg-gradient-to-r from-[#0E291E] via-[#133729] to-green-700">
      <div
        className="
          max-w-8xl lg:mx-20 px-6 2xl:px-24
          flex flex-col-reverse lg:flex-row
          items-center lg:items-start gap-10
        "
      >
        {/* Left on desktop, below image on mobile: Quote text */}
        <div className="w-full lg:w-2/3 text-white">
          <p className="text-[1.5rem] md:text-[1.8rem] font-garamond leading-relaxed text-justify line-clamp-8">
            The education which caters both to the body and the mind is the real
            education. We should make our generation aware of it. Our
            responsibility does not end with the fulfillment of our earthly
            obligation. It is our bounded duty to be aware of the purpose for
            which we have been created and we should make every effort to realise
            the fact. Knowledge by itself cannot bring about perfection in a man.
            One needs to co-ordinate his body, mind and soul. That is knowledge
            which caters to the body, mind and soul. The perfect knowledge is
            that which reduces the distance between the Creator and the created
            and establishes union between them.
          </p>

          <div className="mt-8">
            <p className="font-garamond font-semibold text-[1.6rem] md:text-4xl text-yellow-500 mb-3">
              Khan Bahadur Ahsanullah (R.)
            </p>
            <p className="font-garamond text-[1.3rem] md:text-[1.4rem] opacity-90">
              Founder, Dhaka Ahsania Mission &amp; AUST
            </p>
          </div>
        </div>

        {/* Right on desktop, on top for sm/md: Image */}
        <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
          <img
            src={publicAsset("/founder.png")}
            alt="Khan Bahadur Ahsanullah (R.)"
            className="h-100 w-85 md:h-120 md:w-105 object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Quote;
