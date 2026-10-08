import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="bg-dark text-ink-inverse-2">
      <div className="max-w-container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] py-16">
          <div>
            <Link to="/" aria-label="Axonite Technology Pvt Ltd — home" className="inline-flex">
              <BrandMark height={40} />
            </Link>

            <p className="mt-6 text-[0.9rem] leading-relaxed max-w-sm">
              Axonite builds and runs product software for teams that cannot
              afford downtime — finance operations, field service and workforce
              planning. Fewer features, all of them load-bearing.
            </p>

            <div className="flex items-center gap-3 mt-7">
              <a
                href="mailto:info@axonite.net"
                aria-label="Email Axonite"
                className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-line-dark text-ink-inverse-2 hover:text-white hover:border-accent-bright transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2.2" />
                  <path d="m3.8 6.8 8.2 6 8.2-6" />
                </svg>
              </a>
              <a
                href="tel:+919823103626"
                aria-label="Call Axonite"
                className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-line-dark text-ink-inverse-2 hover:text-white hover:border-accent-bright transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6.5 3.5h3l1.5 4-2 1.4a11 11 0 0 0 5.1 5.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
                </svg>
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <h3 className="font-mono-label text-[0.7rem] text-ink-inverse tracking-label mb-4">
                Product
              </h3>
              <ul className="space-y-2.5 text-[0.9rem]">
                <li><Link to="/products" className="hover:text-white transition-colors">Overview</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Ledgerline</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Fieldpost</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Rosterly</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono-label text-[0.7rem] text-ink-inverse tracking-label mb-4">
                Company
              </h3>
              <ul className="space-y-2.5 text-[0.9rem]">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/career" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Writing</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono-label text-[0.7rem] text-ink-inverse tracking-label mb-4">
                Services
              </h3>
              <ul className="space-y-2.5 text-[0.9rem]">
                <li><Link to="/services" className="hover:text-white transition-colors">Product engineering</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Platform &amp; infrastructure</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Applied AI</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Design systems</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono-label text-[0.7rem] text-ink-inverse tracking-label mb-4">
                Reach us
              </h3>
              <ul className="space-y-2.5 text-[0.9rem]">
                <li>
                  <a href="mailto:info@axonite.net" className="hover:text-white transition-colors">
                    info@axonite.net
                  </a>
                </li>
                <li>
                  <a href="tel:+919823103626" className="hover:text-white transition-colors">
                    +91 98231 03626
                  </a>
                </li>
                <li>Pune, Maharashtra, India</li>
                <li>Mon – Fri, 09:00 – 21:00 IST</li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-t border-line-dark text-[0.82rem]">
          <span>
            © {new Date().getFullYear()} Axonite Technology Pvt Ltd. All rights
            reserved.
          </span>

          <span className="inline-flex items-center gap-2 text-accent-bright font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-bright" aria-hidden="true" />
            All systems operational
          </span>
        </div>

        <p className="pb-10 max-w-3xl text-[0.78rem] leading-relaxed">
          Ledgerline, Fieldpost and Rosterly are products of Axonite Technology
          Pvt Ltd. Product names and customer references shown on this site are
          illustrative examples used to demonstrate the product layout.
        </p>
      </div>
    </footer>
  );
}
