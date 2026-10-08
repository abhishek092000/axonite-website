import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { products } from "../data/content";
import CloudBackground from "../components/CloudBackground";

const accents = ["bg-accent", "bg-accent-bright", "bg-gold"];

export default function Products() {
  return (
    <div className="bg-paper">
      <section className="relative bg-paper ambient-wash overflow-hidden pt-32 pb-20 section-rule">
        {/* 1. Independent Cloud Background */}
      <CloudBackground showGrid={true} />
        <div className="relative max-w-prose mx-auto px-6">
          <p className="eyebrow mb-5">Product systems</p>
          <h1 className="text-display">
            Engineered as discrete organs. Unified by design.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[1.125rem] leading-relaxed text-ink-2">
            Every product operates along an independent axis of efficiency —
            zero shared bloat, maximum specialized performance.
          </p>
        </div>
      </section>

      <section className="bg-white section-rule">
        
        <div className="max-w-container mx-auto px-6 py-20">
          
          <div className="grid gap-6 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 120} className="h-full">
                <article className="card card--hover h-full flex flex-col overflow-hidden">
                  
                  <div className={`h-1 w-full ${accents[i]}`} aria-hidden="true" />
                  
                  <div className="flex flex-col flex-1 p-7">
                    <Link to="/contact">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${accents[i]}`}
                        aria-hidden="true"
                      />
                      <span className="font-mono-label text-[0.68rem] text-ink-3">
                        {p.tag}
                      </span>
                    </div>

                    <h2 className="text-display-xs mt-3">{p.name}</h2>

                    <p className="text-ink-2 text-[0.9rem] leading-relaxed mt-3">
                      {p.desc}
                    </p>

                    <div className="mt-6 pt-6 border-t border-line-soft">
                      <h3 className="font-mono-label text-[0.68rem] text-ink-3">
                        What it does
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {p.features.map((f) => (
                          <li key={f} className="flex gap-2.5 text-[0.875rem] text-ink-2 leading-snug">
                            <span
                              className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${accents[i]}`}
                              aria-hidden="true"
                            />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-6 border-t border-line-soft">
                      <h3 className="font-mono-label text-[0.68rem] text-ink-3">
                        Best for
                      </h3>
                      <p className="text-[0.875rem] text-ink-3 leading-relaxed mt-2">
                        {p.idealFor}
                      </p>
                    </div>
                    </Link>
                    

                  <div className="mt-auto pt-7">
                      <Link
                        to="/contact"
                        className="w-full inline-flex items-center justify-center bg-accent text-white text-[0.9rem] font-semibold px-5 py-3 rounded-full transition-colors hover:bg-accent-strong"
                      >
                        Explore Product
                      </Link>
                    </div>  
                  </div>
                  
                </article>
                

              </Reveal>

            ))}
            
          </div>
          
        </div>
      </section>

      <section className="bg-paper section-rule py-24">
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
                  Not sure which one fits your workflow?
                </h2>
                <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed !text-ink-inverse-2">
                  Tell us about the problem you're solving and we'll point you
                  to the right one — or tell you honestly if none of them fit
                  yet.
                </p>
              </div>
              <div className="relative">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center bg-accent-bright text-accent-ink font-semibold text-[0.9375rem] px-7 py-3.5 rounded-full transition-colors hover:bg-white"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
