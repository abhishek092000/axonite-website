import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { services, process, products } from "../data/content";
import CloudBackground from "../components/CloudBackground";
export default function Services() {
  return (
    <div>
      <section className="relative bg-paper ambient-wash overflow-hidden pt-32 pb-20 section-rule">
        {/* 1. Independent Cloud Background */}
      <CloudBackground showGrid={true} />
        <div className="relative max-w-prose mx-auto px-6">
          <p className="eyebrow mb-5">Services</p>
          <h1 className="text-display">
            We build the product, and then we keep it running.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[1.125rem] leading-relaxed text-ink-2">
            Whether you need a product built from a blank page or an existing
            one rescued from years of quick fixes, the engagement looks the
            same: one team, accountable end to end.
          </p>
        </div>
      </section>

      <section className="bg-white py-24 section-rule">
        <div className="max-w-container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 100} className="h-full">
                <div className="card card--hover p-8 h-full">
                  <p className="font-mono-label text-[0.68rem] text-accent mb-4">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-display-xs mb-3">{s.title}</h3>
                  <p className="text-ink-2 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark section-rule py-24">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <div className="max-w-[720px] mb-12">
              <p className="eyebrow mb-4">Engagement flow</p>
              <h2 className="text-display-sm max-w-[25ch]">
                Five stages, repeated every release.
              </h2>
            </div>
          </Reveal>

          <div className="border-t border-line-dark">
            {process.map((step, i) => (
              <Reveal key={step.step} delay={i * 80}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 py-6 border-b border-line-dark">
                  <span className="font-mono-label text-[0.72rem] text-accent-bright w-12 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[1.3rem] w-full md:w-52 shrink-0">{step.step}</h3>
                  <p className="text-[0.9rem] leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-24 section-rule">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <div className="max-w-[720px] mb-12">
              <p className="eyebrow mb-4">Products we run today</p>
              <h2 className="text-display-sm max-w-[20ch]">
                Some of this shows up in our own products.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 100} className="h-full">
                <div className="border border-line rounded-md bg-white p-7 h-full">
                  <p className="font-mono-label text-[0.68rem] text-ink-3 mb-3">{p.tag}</p>
                  <h3 className="text-[1.3rem] mb-2">{p.name}</h3>
                  <p className="text-ink-2 text-[0.9rem] leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-start">
              <Link
                to="/products"
                className="inline-flex justify-center border border-line text-ink font-semibold text-[0.9375rem] px-7 py-3.5 rounded-full transition-colors hover:border-ink-3"
              >
                See full product details
              </Link>
              <Link
                to="/contact"
                className="inline-flex justify-center bg-accent text-white font-semibold text-[0.9375rem] px-7 py-3.5 rounded-full transition-colors hover:bg-accent-strong"
              >
                Discuss your project
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}