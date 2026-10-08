import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import SignalTrace from "../components/SignalTrace";
import CloudBackground from "../components/CloudBackground";
import { products, process } from "../data/content";

const metrics = [
  { value: "3", label: "Products in production, each doing one job well" },
  { value: "11", label: "Engineers, designers and support specialists" },
  { value: "2026", label: "Founded in Pune, shipping from day one" },
  { value: "10 yr", label: "The horizon we build every product against" },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-paper ambient-wash overflow-hidden pt-32 pb-16 section-rule">
        {/* 1. Independent Cloud Background */}
      <CloudBackground showGrid={true} />
        <div className="relative max-w-container mx-auto px-6">
          <p className="eyebrow mb-5">Axonite Technology Pvt Ltd — Product software</p>

          <h1 className="text-display max-w-[15ch]">
            Software that stays useful after launch day.
          </h1>

          <p className="mt-6 max-w-[46ch] text-[1.16rem] leading-relaxed text-ink-2">
            We build and run product software for teams that can't afford
            downtime finance ops, field service, product planning. Fewer
            features, all of them load-bearing.
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-accent text-white font-semibold text-[0.9375rem] px-7 py-3.5 rounded-full transition-colors hover:bg-accent-strong hover:-translate-y-px"
            >
              Book a walkthrough
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center border border-line text-ink font-semibold text-[0.9375rem] px-7 py-3.5 rounded-full transition-colors hover:border-ink-3 hover:-translate-y-px"
            >
              See what we build
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-12 pt-6 border-t border-line text-[0.85rem] text-ink-3">
            <span>
              <strong className="text-ink font-semibold">In production today  </strong>  three
              products across finance, field and product
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-line"></span>
            <span>Pune, India  — serving teams across India</span>
          </div>
        </div>

        <div className="relative mt-14">
          <SignalTrace className="w-full h-16 md:h-20" variant="light" />
        </div>
      </section>

      {/* METRICS */}
      <section className="bg-paper pb-4">
        <div className="max-w-container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line-soft border border-line rounded-md overflow-hidden">
            {metrics.map((m) => (
              <div key={m.value} className="bg-white px-6 py-7">
                <p className="font-serif text-[clamp(1.9rem,1.4rem+1.4vw,2.5rem)] leading-none tracking-[-0.03em] text-ink">
                  {m.value}
                </p>
                <p className="mt-2.5 text-[0.9rem] leading-snug text-ink-2">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-paper py-24 section-rule mt-20">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <div className="max-w-[720px] mb-12">
              <p className="eyebrow mb-4">What we run</p>
              <h2 className="text-display-sm max-w-[20ch]">
                Three products, each doing one job well.
              </h2>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-2">
                We would rather run three products properly than eight
                adequately. Everything we ship, we intend to still be
                supporting in ten years.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 120} className="h-full">
                <Link
                  to="/products"
                  className="card card--hover flex flex-col p-7 h-full"
                >
                  <p className="font-mono-label text-[0.7rem] text-ink-3 mb-4">
                    {p.tag}
                  </p>
                  <h3 className="text-display-xs">{p.name}</h3>
                  <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-2">
                    {p.desc}
                  </p>
                  <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-accent">
                    Product detail
                    <span aria-hidden="true"></span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section-dark section-rule py-24">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <div className="max-w-[720px] mb-12">
              <p className="eyebrow mb-4">How a project moves</p>
              <h2 className="text-display-sm max-w-[20ch]">
                A process that doesn't hide the middle part.
              </h2>
              <p className="mt-4 text-[1.05rem] leading-relaxed">
                Five stages, repeated every release. Nothing reaches production
                until it has passed the checks we agreed together.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
            {process.map((step, i) => (
              <Reveal key={step.step} delay={i * 100}>
                <div className="border-t border-line-dark pt-5">
                  <p className="font-mono-label text-[0.7rem] text-accent-bright mb-3">
                    0{i + 1}
                  </p>
                  <h3 className="text-[1.15rem] mb-2">{step.step}</h3>
                  <p className="text-[0.875rem] leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper py-24 section-rule">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <div className="relative grid lg:grid-cols-[minmax(0,1fr)_auto] gap-6 items-center px-8 py-12 lg:px-12 border border-line-dark rounded-lg overflow-hidden bg-[linear-gradient(150deg,#151923_0%,#0a1c1a_100%)]">
              <div
                className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(20,184,166,0.18), transparent 68%)",
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <h2 className="text-display-xs !text-ink-inverse">
                  Have a product that needs to be built or enhanced?
                </h2>
                <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed !text-ink-inverse-2">
                  We take on a small number of projects at a time. Tell us where
                  it stands today and we'll be straight about whether we're the
                  right team for it.
                </p>
              </div>
              <div className="relative">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center bg-accent-bright text-accent-ink font-semibold text-[0.9375rem] px-7 py-3.5 rounded-full transition-colors hover:bg-white"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}