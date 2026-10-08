import Reveal from "../components/Reveal";
import SignalTrace from "../components/SignalTrace";
import CloudBackground from "../components/CloudBackground";

const values = [
  {
    title: "Fewer, better products",
    desc: "We'd rather run three products well than eight adequately. Every product we ship, we intend to still be running in ten years.",
  },
  {
    title: "Slow to promise, fast to build",
    desc: "We scope carefully before we start, then move quickly once we do — so estimates hold and surprises don't.",
  },
  {
    title: "Built by the people who support it",
    desc: "The engineers who build a feature are the ones who get paged when it breaks. That keeps the code honest.",
  },
];

const facts = [
  { label: "Founded", value: "2026" },
  { label: "Team", value: "11 people" },
  { label: "Products live", value: "3" },
  { label: "Based in", value: "Pune - IN & US" },
];

export default function About() {
  return (
    <div>
     <section className="relative bg-paper ambient-wash overflow-hidden pt-32 pb-20 section-rule">
      {/* 1. Independent Cloud Background */}
      <CloudBackground showGrid={true} />
      
  <div className="relative max-w-4xl mx-auto px-6">

    <div className="">
      <p className="eyebrow mb-5">About Axonite</p>

      <h1 className="text-display">
        A scalable team building software we'd want to use ourselves.
      </h1>

      <div  />

      <p className="max-w-3xl text-[0.95rem] leading-relaxed text-ink-2 mt-6">
        Axonite Technologies builds intelligent software that connects
        manufacturing operations, enterprise workflows, and business data,
        helping organizations operate with greater efficiency, visibility,
        and control.

        <br />
        <br/>
        

        Based in India and backed by more than two decades of industry
        experience through our parent company, ShopFloor Automation Inc. in
        Iowa, USA, we combine deep manufacturing expertise with modern
        software engineering and AI-enabled automation to develop practical,
        reliable technology solutions.

        <br />
        <br/>
       

        Our solutions support organizations across the complete operational
        lifecycle, from shop-floor execution and equipment connectivity to
        document processing, ERP integration, technical support, and
        controlled business-process automation. By connecting people,
        processes, and systems, we help businesses streamline operations,
        improve traceability, and make better use of their data.
      </p>
    </div>

  </div>
</section>
      <section className="bg-white py-24 section-rule">
        <div className="max-w-container mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
          <Reveal>
            <p className="eyebrow mb-4">Where we work from</p>
            <h2 className="text-display-xs mb-5">
              Pune, with a team that ships remotely too.
            </h2>
            <p className="text-ink-2 leading-relaxed mb-4 max-w-3xl text-[0.95rem]">
              We're headquartered in Pune, Maharashtra, with engineers and
              designers working both in-office and remote. Most of our
              customers are operations teams across India who've outgrown
              spreadsheets but don't want enterprise software's overhead.
            </p>
            <p className="text-ink-2 leading-relaxed max-w-3xl text-[0.95rem]">
              We stay small on purpose — every person here can trace a support
              ticket back to the code they wrote.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="card p-8">
              <SignalTrace className="w-full h-14 mb-7" variant="light" />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-7">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="font-mono-label text-[0.68rem] text-ink-3 mb-1.5">
                      {f.label}
                    </dt>
                    <dd className="font-serif text-[1.55rem] leading-tight tracking-[-0.02em] text-ink">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

    <section className="vision bg-paper ambient-wash overflow-hidden py-20 section-rule">
  <div className="max-w-container mx-auto px-6">

    {/* Our Approach */}
    <div className="approach">
      <Reveal>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-display-sm">
            Our Approach
          </h2>

          <div  />

          <p className="mt-6 text-left   leading-relaxed !text-ink-2 md:text-[0.95rem]">
            We believe automation should always be built with control, reliability, and accountability at its core. Our solutions are designed around traceability, human oversight, and measurable operational outcomes, ensuring that automation supports people and processes rather than replacing essential control. We work closely with our customers to understand their unique workflows, integrate seamlessly with existing systems, and introduce practical, responsible automation that delivers lasting value.
            <br />
            <br />
           Our cross-border delivery model combines product strategy and client engagement in the United States with engineering, implementation, and support capabilities in India. This enables us to provide responsive customer service, continuous product support, and scalable technology solutions that help organizations operate efficiently across regions.
          </p>
        </div>
      </Reveal>
    </div>
    </div>
    </section>
   
  <section className="vision bg-white  ambient-wash overflow-hidden py-20 section-rule">
  <div className="max-w-container mx-auto px-6">

    <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-20 ">

      {/* Our Mission */}
      <div className="mission md:pl-16 lg:pl-24">
        <Reveal>
          <div className="mx-auto w-full max-w-4xl">
            <h2 className="text-center text-[2rem] leading-tight md:text-[2.25rem]">
              Our Mission
            </h2>

            <div  />

            <p className="mt-6 text-[0.9rem] leading-relaxed !text-ink-2 md:text-[0.95rem]">
              Our mission is to simplify complex manufacturing and enterprise processes through dependable, intelligent, and controlled automation, helping organizations improve efficiency, reduce operational complexity, and achieve consistent, measurable outcomes.

            </p>
          </div>
        </Reveal>
      </div>

      {/* Our Vision */}
      <div className="vision md:pr-16 lg:pr-24">
        <Reveal>
          <div className="mx-auto w-full max-w-4xl">
            <h2 className="text-center text-[2rem] leading-tight md:text-[2.25rem]">
              Our Vision
            </h2>

            <div />

            <p className="mt-6 text-[0.9rem] leading-relaxed !text-ink-2 md:text-[0.95rem]">
              Our vision is to become a trusted global technology partner for organizations by connecting operations, documents, data, and enterprise systems, creating seamless digital workflows from the shop floor to SAP.

            </p>
          </div>
        </Reveal>
      </div>

    </div>

  </div>
</section>
 <section className="bg-white py-20 section-rule">
  <div className="max-w-4xl mx-auto px-6">

    {/* Section Heading */}
    <Reveal>
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="eyebrow mb-4">Our Leadership</p>

        <h2 className="text-display-sm">
          The people behind Axonite
        </h2>

        <p className="mt-4 text-ink-2 leading-relaxed">
          Axonite is built on deep industry experience, practical technology,
          and a commitment to solving real operational challenges.
        </p>
      </div>
    </Reveal>

    {/* Founders */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Founder 1 */}
      <Reveal>
        <div className="card flex h-full max-w-sm mx-auto w-full flex-col overflow-hidden">

          <div className="aspect-[4/3] overflow-hidden bg-paper">
            <img
              src="Founder1.png"
              alt="Founder of Axonite Technologies"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 p-6">
            <p className="eyebrow mb-2">Founder</p>

            <h3 className="font-serif text-[1.5rem] leading-tight text-ink">
              Subodh Mahant
            </h3>

            <p className="mt-3 text-sm text-ink-2 leading-relaxed">
              With extensive experience in manufacturing automation and
              enterprise technology, the founder brings a practical
              understanding of industrial operations and a vision for
              building reliable software solutions.
            </p>
          </div>

        </div>
      </Reveal>

      {/* Founder 2 */}
      <Reveal delay={100}>
  <div className="card flex h-full max-w-sm mx-auto w-full flex-col overflow-hidden">

    <div className="aspect-[4/3] overflow-hidden bg-paper">
      <img
        src="Founder2.png"
        alt="David Havenridge, Founder of Axonite Technologies"
        className="w-full h-full object-cover object-[center_25%]"
      />
    </div>

    <div className="flex-1 p-6">
      <p className="eyebrow mb-2">Founder</p>

      <h3 className="font-serif text-[1.5rem] leading-tight text-ink">
        David Havenridge
      </h3>

      <p className="mt-2 text-sm text-ink-2 leading-relaxed">
        Combining technology expertise with a strong focus on business
        operations, the founder helps shape Axonite's products,
        engineering capabilities, and long-term technology direction.
      </p>
    </div>

  </div>
</Reveal>

    </div>

  </div>
</section>

      <section className="section-dark section-rule py-24">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <div className="max-w-[720px] mb-12">
              <p className="eyebrow mb-4">What we hold to</p>
              <h2 className="text-display-sm max-w-[22ch]">
                Three things that shape how we build.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-x-6 gap-y-10">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 120}>
                <div className="border-t border-line-dark pt-5 h-full">
                  <h3 className="text-[1.35rem] mb-3">{v.title}</h3>
                  <p className="text-[0.9rem] leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
