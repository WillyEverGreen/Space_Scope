import ScrollReveal from "@/components/react-bits/ScrollReveal";

/** One large statement that resolves word by word as the page scrolls past it. */
const Manifesto = () => (
  <section className="relative z-10 py-24 md:py-40">
    <div className="mx-auto max-w-5xl px-6">
      <ScrollReveal
        splitBy="words"
        effect="rise"
        mode="scrub"
        enableBlur
        baseOpacity={0.12}
        containerClassName="my-0!"
        textClassName="font-heading font-semibold! tracking-tight text-[clamp(1.9rem,4.6vw,3.9rem)]! leading-[1.18]! text-(--l-cream)"
      >
        Every satellite, every storm on the Sun and every pass of the station is already up there. SpaceScope makes it readable, live and one tap away.
      </ScrollReveal>
    </div>
  </section>
);

export default Manifesto;
