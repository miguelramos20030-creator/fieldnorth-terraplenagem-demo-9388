import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Menu,
  X,
  Plus,
  Minus,
  Check,
  MoveHorizontal,
  MapPin,
  Expand,
  Compass,
} from "lucide-react";
import { EstimatePlanner } from "./estimate-planner";
import { services, scenarios, faqs, processSteps } from "./fieldnorth-content";

function Wordmark({ large = false }: { large?: boolean }) {
  return (
    <a
      href="#top"
      className={`wordmark ${large ? "large" : ""}`}
      aria-label="FieldNorth Land Clearing — back to top"
    >
      <span>
        FIELDNORTH<span className="wordmark-north">↗</span>
      </span>
      <small>LAND CLEARING</small>
    </a>
  );
}

function Photo({
  name,
  alt,
  className = "",
  eager = false,
  sizes = "(max-width: 767px) 100vw, 65vw",
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  return (
    <img
      className={className}
      src={`/images/${name}-1280.webp`}
      srcSet={`/images/${name}-720.webp 720w, /images/${name}-1280.webp 1280w, /images/${name}-1920.webp 1920w`}
      sizes={sizes}
      alt={alt}
      width={1920}
      height={name === "forestry-loader-concept" ? 1088 : 1280}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

const navItems = [
  ["Services", "services"],
  ["Land Potential", "potential"],
  ["Process", "process"],
  ["FAQs", "faqs"],
];

function trapDialogFocus(event: KeyboardEvent) {
  if (event.key !== "Tab") return;
  const dialog = event.currentTarget as HTMLDialogElement;
  const controls = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
    ),
  ).filter((el) => el.getClientRects().length > 0);
  const first = controls[0],
    last = controls[controls.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export default function FieldNorthSite() {
  const [showcase, setShowcase] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [entryVersion, setEntryVersion] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const menuDialog = useRef<HTMLDialogElement>(null);
  const photoDialog = useRef<HTMLDialogElement>(null);
  const menuOpener = useRef<HTMLButtonElement>(null);
  const galleryOpener = useRef<HTMLButtonElement | null>(null);
  const service = services[showcase]!;

  useLayoutEffect(() => {
    // React can mount after the browser's initial fragment lookup. Honor a
    // direct section link once, without smooth scrolling or entrance replay.
    const hash = window.location.hash;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    target.scrollIntoView({ behavior: "instant", block: "start" });
  }, []);

  useEffect(() => {
    const dialog = menuDialog.current;
    if (menuOpen) dialog?.showModal();
    else dialog?.close();
    if (menuOpen) {
      const old = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog?.addEventListener("keydown", trapDialogFocus);
      return () => {
        document.body.style.overflow = old;
        dialog?.removeEventListener("keydown", trapDialogFocus);
      };
    }
  }, [menuOpen]);
  useEffect(() => {
    const dialog = photoDialog.current;
    if (lightbox !== null) dialog?.showModal();
    else dialog?.close();
    if (lightbox !== null) {
      const old = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog?.addEventListener("keydown", trapDialogFocus);
      return () => {
        document.body.style.overflow = old;
        dialog?.removeEventListener("keydown", trapDialogFocus);
      };
    }
  }, [lightbox]);

  function requestService(index: number) {
    setSelected(index);
    setEntryVersion((v) => v + 1);
    window.location.hash = "estimate";
    document
      .getElementById("estimate")
      ?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
  }
  function menuNavigate() {
    setMenuOpen(false);
  }

  return (
    <>
      <a className="skip-link" href="#services">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Wordmark />
          <span className="concept-tag">PORTFOLIO CONCEPT</span>
          <nav aria-label="Main navigation">
            {navItems.map(([label, id]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
            <a href="#estimate" className="button button-amber header-cta">
              Request an Estimate <ArrowUpRight size={16} />
            </a>
          </nav>
          <button
            ref={menuOpener}
            type="button"
            className="menu-button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={25} />
          </button>
        </div>
      </header>
      <dialog
        ref={menuDialog}
        id="mobile-menu"
        className="mobile-menu"
        aria-labelledby="menu-title"
        onCancel={() => setMenuOpen(false)}
        onClose={() => {
          setMenuOpen(false);
          menuOpener.current?.focus();
        }}
      >
        <div className="menu-top">
          <h2 id="menu-title">Explore FieldNorth</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navItems.map(([label, id], i) => (
            <a key={id} href={`#${id}`} onClick={menuNavigate}>
              <small>0{i + 1}</small>
              {label}
              <ArrowUpRight />
            </a>
          ))}
          <a href="#estimate" onClick={menuNavigate} className="button button-amber">
            Request an Estimate <ArrowUpRight size={20} />
          </a>
        </nav>
        <p>FieldNorth is a fictional portfolio concept.</p>
      </dialog>
      <main>
        <section id="top" className="hero">
          <picture className="hero-picture">
            <source media="(max-width: 767px)" srcSet="/images/forestry-loader-mobile.webp" />
            <img
              src="/images/forestry-loader-concept-1920.webp"
              srcSet="/images/forestry-loader-concept-1280.webp 1280w, /images/forestry-loader-concept-1920.webp 1920w"
              sizes="100vw"
              alt="Illustrative forestry loader with a drum mulcher in sunlit Florida-style woodland"
              width={1920}
              height={1088}
              fetchPriority="high"
              loading="eager"
            />
          </picture>
          <div className="hero-shade" />
          <div className="container hero-content">
            <div className="hero-kicker">
              <span /> LAND CLEARING / CENTRAL FLORIDA
            </div>
            <h1>
              <span className="hero-headline-group"><span className="hero-headline-reveal">Clear the land.</span></span>
              <span className="hero-headline-group"><span className="hero-headline-reveal">Make room for</span></span>
              <span className="hero-headline-group"><span className="hero-headline-reveal"><em>what’s next.</em></span></span>
            </h1>
            <p>
              Land clearing, forestry mulching and brush removal for overgrown properties. Start
              with your location, the work you need and what you want to keep.
            </p>
            <div className="hero-actions">
              <a href="#estimate" className="button button-amber">
                Request an Estimate <ArrowUpRight size={19} />
              </a>
              <a href="#services" className="button button-outline">
                Explore Services <ArrowDown size={17} />
              </a>
            </div>
          </div>
          <div className="container hero-bottom">
            <span className="hero-location">
              <MapPin size={15} /> CENTRAL FLORIDA
            </span>
            <span>Fictional business. Illustrative imagery.</span>
            <a href="#services" aria-label="Scroll to services">
              <ArrowDown size={20} />
            </a>
          </div>
        </section>

        <section id="services" className="services-section section-pad">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">01 / THE RIGHT APPROACH</span>
                <h2>
                  Choose the work
                  <br />
                  your land needs.
                </h2>
              </div>
              <p>
                Different properties call for different approaches. Explore the service that matches
                the area you want to open, manage or make easier to access.
              </p>
            </div>
            <div className="services-layout">
              <div
                className="service-selector"
                role="tablist"
                aria-label="Explore land services"
                aria-orientation="vertical"
              >
                {services.map((item, i) => (
                  <button
                    key={item.title}
                    id={`service-tab-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={showcase === i}
                    aria-controls="service-panel"
                    tabIndex={showcase === i ? 0 : -1}
                    className={showcase === i ? "active" : ""}
                    onClick={() => setShowcase(i)}
                    onKeyDown={(e) => {
                      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
                        e.preventDefault();
                        const next =
                          e.key === "Home"
                            ? 0
                            : e.key === "End"
                              ? 2
                              : (i + (e.key === "ArrowDown" ? 1 : 2)) % 3;
                        setShowcase(next);
                        document.getElementById(`service-tab-${next}`)?.focus();
                      }
                    }}
                  >
                    <span className="service-number">0{i + 1}</span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.short}</small>
                    </span>
                    <ArrowUpRight size={22} />
                  </button>
                ))}
                <div className="service-footnote">
                  <Compass size={23} strokeWidth={1.2} />
                  <p>
                    Start with the land.
                    <br />
                    Shape the scope around it.
                  </p>
                </div>
              </div>
              <div
                id="service-panel"
                role="tabpanel"
                aria-labelledby={`service-tab-${showcase}`}
                className="service-panel"
              >
                <div className="service-photo" key={service.image}>
                  <Photo name={service.image} alt={service.alt} />
                  <span className="photo-label">
                    {showcase === 1 ? "GENERATED EQUIPMENT CONCEPT" : "ILLUSTRATIVE LANDSCAPE"}
                  </span>
                  <span className="image-index">0{showcase + 1} / 03</span>
                </div>
                <div className="service-detail" key={service.title}>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                  <ul>
                    {service.points.map((point) => (
                      <li key={point}>
                        <Check size={16} />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => requestService(showcase)}
                  >
                    Plan {service.title.toLowerCase()} <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="scenarios" className="scenarios-section">
          <div className="container">
            <div className="gallery-heading">
              <div>
                <span className="eyebrow">02 / ROOM FOR POSSIBILITY</span>
                <h2>See the land differently.</h2>
              </div>
              <p>Illustrative scenarios for a portfolio concept.</p>
            </div>
            <div className="scenario-gallery">
              {scenarios.map((item, i) => (
                <figure key={item.title} className={`scenario scenario-${i}`}>
                  <button
                    type="button"
                    aria-label={`Open ${item.title} image`}
                    onClick={(e) => {
                      galleryOpener.current = e.currentTarget;
                      setLightbox(i);
                    }}
                  >
                    <Photo
                      name={item.image}
                      alt={item.alt}
                      sizes={
                        i === 0
                          ? "(max-width: 767px) 100vw, 60vw"
                          : "(max-width: 767px) 100vw, 40vw"
                      }
                    />
                    <span className="expand-label">
                      <Expand size={18} />
                    </span>
                  </button>
                  <figcaption>
                    <div>
                      <small>0{i + 1} / SCENARIO</small>
                      <h3>{item.title}</h3>
                    </div>
                    <ArrowUpRight size={23} />
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="potential" className="potential-section section-pad">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">03 / LAND POTENTIAL</span>
                <h2>
                  Picture the potential
                  <br />
                  of your property.
                </h2>
              </div>
              <div>
                <p>
                  Explore how a more accessible area could fit the way you want to use your land.
                </p>
                <p className="potential-instruction">
                  One landscape. A thoughtful starting point.
                  <br />
                  Reveal a planning concept — not a before-and-after.
                </p>
              </div>
            </div>
            <Potential />
            <div className="potential-footer">
              <span>Illustrative planning concept.</span>
              <span>
                <MoveHorizontal size={17} /> Drag to explore · Use arrow keys
              </span>
            </div>
          </div>
        </section>

        <section id="process" className="process-section section-pad">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">04 / A THOUGHTFUL PROCESS</span>
                <h2>
                  A clear plan before
                  <br />
                  the work begins.
                </h2>
              </div>
              <a href="#estimate" className="text-button">
                Request an Estimate <ArrowUpRight size={19} />
              </a>
            </div>
            <ol className="process-timeline">
              {processSteps.map(([title, copy], i) => (
                <li key={title}>
                  <span className="timeline-number">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="area" className="area-section">
          <div className="container area-layout">
            <div className="area-map">
              <img
                src="/images/central-florida-schematic.svg"
                alt="Schematic Central Florida illustration with Orange, Seminole, Lake and Osceola sample region labels; not precise boundaries"
                width={620}
                height={410}
                loading="lazy"
              />
              <span>Illustrative service area.</span>
            </div>
            <div className="area-copy">
              <span className="eyebrow">05 / CENTRAL FLORIDA</span>
              <h2>
                A local approach to
                <br />
                your next project.
              </h2>
              <p>
                This concept shows how services and coverage could be presented for a Central
                Florida land-services business.
              </p>
              <div className="region-labels">
                <span>Orange</span>
                <span>Seminole</span>
                <span>Lake</span>
                <span>Osceola</span>
              </div>
              <small>Sample regions. A schematic portfolio illustration.</small>
            </div>
          </div>
        </section>

        <section id="faqs" className="faq-section section-pad">
          <div className="container faq-layout">
            <div>
              <span className="eyebrow">06 / GOOD QUESTIONS</span>
              <h2>
                A little clarity
                <br />
                goes a long way.
              </h2>
              <p>
                The practical details,
                <br />
                before the next step.
              </p>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer], i) => (
                <div key={question} className={`faq ${openFaq === i ? "expanded" : ""}`}>
                  <h3>
                    <button
                      id={`faq-button-${i}`}
                      type="button"
                      aria-expanded={openFaq === i}
                      aria-controls={`faq-answer-${i}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span>{question}</span>
                      {openFaq === i ? <Minus size={19} /> : <Plus size={19} />}
                    </button>
                  </h3>
                  <section
                    id={`faq-answer-${i}`}
                    aria-labelledby={`faq-button-${i}`}
                    hidden={openFaq !== i}
                  >
                    <p>{answer}</p>
                  </section>
                </div>
              ))}
            </div>
          </div>
        </section>

        <EstimatePlanner
          selected={selected}
          setSelected={setSelected}
          entryVersion={entryVersion}
        />
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <span className="eyebrow">A CLEARER START. A NEW POSSIBILITY.</span>
              <h2>What’s next for your land?</h2>
            </div>
            <a href="#estimate" className="button button-amber">
              Let’s explore it <ArrowUpRight size={20} />
            </a>
          </div>
          <div className="footer-middle">
            <p>
              Land clearing, forestry mulching and brush removal — a fictional contractor website
              concept.
            </p>
            <nav aria-label="Footer navigation">
              {[
                ["Services", "services"],
                ["Land Potential", "potential"],
                ["Scenarios", "scenarios"],
                ["Process", "process"],
                ["Service Area", "area"],
                ["FAQs", "faqs"],
              ].map(([label, id]) => (
                <a key={id} href={`#${id}`}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <Wordmark large />
          <div className="footer-bottom">
            <span>
              Concept website by <strong>Miguel Filipe Web.</strong>
            </span>
            <span>FieldNorth is a fictional portfolio project. Visuals are illustrative.</span>
            <a href="#top">
              Back to top <ArrowUp size={16} />
            </a>
          </div>
        </div>
      </footer>
      <dialog
        ref={photoDialog}
        className="photo-lightbox"
        aria-labelledby="lightbox-title"
        onCancel={() => setLightbox(null)}
        onClose={() => {
          setLightbox(null);
          galleryOpener.current?.focus({ preventScroll: true });
        }}
      >
        <button
          type="button"
          autoFocus
          className="lightbox-close"
          aria-label="Close image"
          onClick={() => setLightbox(null)}
        >
          <X size={24} />
        </button>
        {lightbox !== null && (
          <figure>
            <Photo
              name={scenarios[lightbox]!.image}
              alt={scenarios[lightbox]!.alt}
              eager
              sizes="90vw"
            />
            <figcaption>
              <h2 id="lightbox-title">{scenarios[lightbox]!.title}</h2>
              <p>{scenarios[lightbox]!.note}</p>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}

function Potential() {
  const [value, setValue] = useState(51);
  return (
    <div className="potential-visual" style={{ "--divider": `${value}%` } as React.CSSProperties}>
      <Photo
        name="property-access"
        alt="Florida woodland and sandy access route, used as a single-photo illustrative planning canvas"
        sizes="(max-width: 767px) 100vw, 90vw"
      />
      <div className="planning-layer" aria-hidden="true">
        <svg className="planning-svg" viewBox="0 0 1280 640" preserveAspectRatio="none">
          <path
            d="M900 420 Q930 385 1070 405 Q1160 425 1220 495 L1240 620 L980 595 Z"
            fill="#f2bb3f"
            fillOpacity=".23"
            stroke="#f2bb3f"
            strokeWidth="2"
            strokeDasharray="10 8"
          />
          <path
            d="M890 640 Q805 550 815 485 Q825 410 750 375"
            fill="none"
            stroke="#f3f0e8"
            strokeOpacity=".2"
            strokeWidth="32"
          />
          <path
            d="M890 640 Q805 550 815 485 Q825 410 750 375"
            fill="none"
            stroke="#f3f0e8"
            strokeWidth="3"
            strokeDasharray="12 9"
          />
          <ellipse
            cx="1120"
            cy="235"
            rx="95"
            ry="165"
            fill="#14251d"
            fillOpacity=".12"
            stroke="#f3f0e8"
            strokeWidth="2"
            strokeDasharray="7 8"
          />
        </svg>
        <span className="planning-marker marker-open">
          <span className="marker-dot amber" />
          Area to open
        </span>
        <span className="planning-marker marker-access">
          <RouteIcon />
          Access route
        </span>
        <span className="planning-marker marker-tree">
          <span className="marker-dot" />
          Trees to keep
        </span>
      </div>
      <span className="visual-label photo-side">PHOTO</span>
      <span className="visual-label plan-side">PLANNING CONCEPT</span>
      <div className="divider-line" aria-hidden="true">
        <span>
          <MoveHorizontal size={25} strokeWidth={1.5} />
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="divider-range"
        aria-label="Reveal planning concept"
        aria-valuetext={`${100 - value}% planning overlay visible`}
      />
      <div className="planning-legend">
        <span>
          <i className="legend-open" /> Area to open
        </span>
        <span>
          <i className="legend-access" /> Access route
        </span>
        <span>
          <i className="legend-tree" /> Trees to keep
        </span>
      </div>
    </div>
  );
}
function RouteIcon() {
  return <span className="route-mark">↝</span>;
}
