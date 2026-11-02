import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Menu,
  X,
  Expand,
  RotateCcw,
  Pause,
  Play,
  MapPin,
  Plus,
} from "lucide-react";
import { BrazilPlanner, type PlannerEntry } from "./br-planner";
import { useHeroMotion } from "./br-hero-motion";
import { services, machines, scenarios, processSteps, faqs } from "./br-content";

const nav = [
  ["Serviços", "servicos"],
  ["Máquinas", "maquinas"],
  ["Aplicações", "aplicacoes"],
  ["Como funciona", "como-funciona"],
  ["Dúvidas", "duvidas"],
];
function Photo({
  name,
  alt,
  eager = false,
  sizes = "(max-width: 767px) 100vw, 50vw",
  className = "",
}: {
  name: string;
  alt: string;
  eager?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={`/images/${name}-1200.webp`}
      srcSet={`/images/${name}-640.webp 640w, /images/${name}-960.webp 960w, /images/${name}-1200.webp 1200w`}
      sizes={sizes}
      alt={alt}
      width={1200}
      height={name === "br-loader" ? 627 : 800}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
    />
  );
}
function Wordmark() {
  return (
    <a
      className="wordmark"
      href="#inicio"
      aria-label="FIELDNORTH Terraplenagem e Máquinas — voltar ao início"
    >
      <span>
        FIELDNORTH
        <span className="north" aria-hidden="true">
          ↗
        </span>
      </span>
      <small>Terraplenagem e Máquinas</small>
    </a>
  );
}
function trap(event: React.KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const controls = [
    ...event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]'),
  ].filter((el) => el.getClientRects().length);
  const first = controls[0],
    last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
export default function BrazilSite() {
  const [showcase, setShowcase] = useState(0);
  const [entry, setEntry] = useState<PlannerEntry>({ version: 0 });
  const [menu, setMenu] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [overlay, setOverlay] = useState(false);
  const [replay, setReplay] = useState(0);
  const [returning] = useState(() => {
    try {
      return sessionStorage.getItem("fieldnorth-opening") === "seen";
    } catch {
      return false;
    }
  });
  const [quiet, setQuiet] = useState(
    () =>
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
      ),
  );
  const menuDialog = useRef<HTMLDialogElement>(null);
  const photoDialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const hero = useRef<HTMLElement>(null);
  const motion = useHeroMotion(hero, quiet, replay);
  function replayOpening() {
    hero.current?.scrollIntoView({ behavior: "instant", block: "start" });
    setReplay((value) => value + 1);
  }
  useLayoutEffect(() => {
    if (!replay) return;
    hero.current?.querySelector(".hero-scene")?.getAnimations().forEach((animation) => {
      animation.currentTime = 0;
      animation.play();
    });
  }, [replay]);
  useLayoutEffect(() => {
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("fieldnorth-opening", "seen");
    } catch {
      /* opening remains functional without storage */
    }
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () =>
      setQuiet(
        mq.matches ||
          Boolean(
            (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
          ),
      );
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>(".reveal")];
    if (quiet || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.remove("waiting"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("waiting");
            e.target.classList.add("revealed");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("waiting");
        observer.observe(el);
      }
    });
    return () => {
      observer.disconnect();
      elements.forEach((el) => el.classList.remove("waiting"));
    };
  }, [quiet]);
  useLayoutEffect(() => {
    const dialog = menuDialog.current;
    if (menu) dialog?.showModal();
    else if (dialog?.open) dialog.close();
    if (!menu) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [menu]);
  useLayoutEffect(() => {
    const dialog = photoDialog.current;
    if (lightbox !== null) dialog?.showModal();
    else if (dialog?.open) dialog.close();
    if (lightbox === null) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [lightbox]);
  function closeMenu() {
    flushSync(() => setMenu(false));
    menuButton.current?.focus({ preventScroll: true });
  }
  function closePhoto() {
    setLightbox(null);
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }
  function request(service?: number, machine?: string) {
    setEntry((e) => ({ version: e.version + 1, service, machine }));
  }
  const service = services[showcase];
  return (
    <div className={`br-site ${quiet ? "quiet" : ""}`}>
      <a className="skip-link" href="#servicos">
        Ir para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Wordmark key={replay} />
          <nav aria-label="Navegação principal">
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
            <a
              className="button button-amber header-cta"
              href="#orcamento"
              onClick={() => request()}
            >
              Solicitar orçamento <ArrowUpRight size={17} />
            </a>
          </nav>
          <button
            ref={menuButton}
            className="menu-button"
            aria-label="Abrir menu"
            aria-expanded={menu}
            aria-controls="menu-mobile"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
        </div>
      </header>
      <main>
        <section
          id="inicio"
          ref={hero}
          className={`hero ${returning && !replay ? "short-opening" : ""}`}
        >
          <div className="hero-scene">
            <img
              src="/images/br-compact-machine-poster.webp"
              alt="Miniescavadeira laranja com a caçamba junto a uma pilha de terra, em cena ilustrativa de escavação"
              width={1280}
              height={720}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            {motion.enabled && (
              <video
                ref={motion.video}
                className={`hero-video ${motion.ready ? "is-ready" : ""}`}
                src="/videos/br-compact-machine-loop.mp4"
                muted
                playsInline
                loop
                preload="auto"
                aria-hidden="true"
                onPlaying={motion.onPlaying}
                onPause={motion.onPause}
                onError={motion.onError}
              />
            )}
            <div className="hero-shade" />
          </div>
          <div className="container hero-content">
            <span className="eyebrow hero-eyebrow">TERRAPLENAGEM E MÁQUINAS COM OPERADOR</span>
            <h1>
              Prepare o terreno.
              <br />
              <span>
                Dê espaço ao
                <br className="desktop-break" /> seu projeto.
              </span>
            </h1>
            <p>
              Terraplenagem, escavação e máquinas compactas com operador para preparar terrenos,
              acessos e áreas de obra. Conheça as possibilidades e conte o que você precisa
              executar.
            </p>
            <div className="hero-actions">
              <a className="button button-amber" href="#orcamento" onClick={() => request()}>
                Solicitar orçamento <ArrowUpRight size={19} />
              </a>
              <a className="button button-outline" href="#servicos">
                Conhecer os serviços <ArrowDown size={17} />
              </a>
            </div>
          </div>
          <div className="composition-marks" key={`marks-${replay}`} aria-hidden="true">
            <span className="amber-draw" />
            <span className="frame-corner" />
            <span className="scene-coordinate">SOLO · ACESSO · POSSIBILIDADES</span>
          </div>
          <div className="container hero-bottom">
            <p>Projeto demonstrativo · Imagens ilustrativas</p>
            <button className="replay-button" onClick={replayOpening}>
              <RotateCcw size={15} />
              Rever abertura
            </button>
            {motion.enabled && (
              <button className="replay-button video-control" onClick={motion.toggle}>
                {motion.playing ? <Pause size={15} /> : <Play size={15} />}
                {motion.playing ? "Pausar vídeo" : "Reproduzir vídeo"}
              </button>
            )}
            <a
              className="scroll-cue"
              key={`scroll-${replay}`}
              href="#servicos"
              aria-label="Explore os serviços"
            >
              <span>EXPLORE</span>
              <ArrowDown size={18} />
            </a>
          </div>
        </section>
        <section id="servicos" className="section light services-section">
          <div className="container">
            <div className="section-heading reveal">
              <div>
                <span className="eyebrow">01 / SERVIÇOS</span>
                <h2>
                  O começo de uma
                  <br />
                  nova possibilidade.
                </h2>
              </div>
              <p>
                Do primeiro movimento de terra à preparação da área. O trabalho começa com a leitura
                do terreno.
              </p>
            </div>
            <div className="service-showcase">
              <div className="service-menu reveal" role="tablist" aria-label="Conheça os serviços">
                {services.map((s, i) => (
                  <button
                    key={s.title}
                    role="tab"
                    aria-selected={showcase === i}
                    tabIndex={showcase === i ? 0 : -1}
                    aria-controls="service-panel"
                    id={`service-tab-${i}`}
                    onClick={() => setShowcase(i)}
                    onKeyDown={(e) => {
                      const next =
                        e.key === "ArrowDown" || e.key === "ArrowRight"
                          ? (i + 1) % 3
                          : e.key === "ArrowUp" || e.key === "ArrowLeft"
                            ? (i + 2) % 3
                            : e.key === "Home"
                              ? 0
                              : e.key === "End"
                                ? 2
                                : null;
                      if (next !== null) {
                        e.preventDefault();
                        setShowcase(next);
                        document.getElementById(`service-tab-${next}`)?.focus();
                      }
                    }}
                  >
                    <span className="number">0{i + 1}</span>
                    <span>{s.title}</span>
                    <ArrowUpRight size={23} />
                  </button>
                ))}
              </div>
              <div
                id="service-panel"
                role="tabpanel"
                aria-labelledby={`service-tab-${showcase}`}
                className="service-panel reveal"
              >
                <div className="service-photo" key={service.image}>
                  <Photo name={service.image} alt={service.alt} />
                  <span>IMAGEM ILUSTRATIVA</span>
                </div>
                <div className="service-description">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <a className="text-link" href="#orcamento" onClick={() => request(showcase)}>
                    Planejar este serviço <ArrowUpRight size={19} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="maquinas" className="section dark machinery-section">
          <div className="container">
            <div className="section-heading reveal">
              <div>
                <span className="eyebrow">02 / MÁQUINAS COM OPERADOR</span>
                <h2>
                  A máquina certa começa
                  <br />
                  pelo serviço certo.
                </h2>
              </div>
              <p>
                Espaço, acesso e tipo de solo orientam a escolha. Aqui, duas possibilidades para
                visualizar seu projeto.
              </p>
            </div>
            <div className="machine-grid">
              {machines.map((m, i) => (
                <article key={m.title} className="machine-card reveal">
                  <div className="machine-photo">
                    <Photo name={m.image} alt={m.alt} />
                    <span className="machine-number">0{i + 1}</span>
                  </div>
                  <div className="machine-copy">
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    <a className="text-link" href="#orcamento" onClick={() => request(2, m.title)}>
                      Planejar serviço com esta máquina <ArrowUpRight size={18} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <p className="section-footnote">
              Imagens ilustrativas. A escolha do equipamento depende da avaliação do local. Esta
              simulação não confirma disponibilidade ou reserva.
            </p>
          </div>
        </section>
        <section id="aplicacoes" className="section light applications-section">
          <div className="container">
            <div className="section-heading reveal">
              <div>
                <span className="eyebrow">03 / APLICAÇÕES</span>
                <h2>
                  Cada terreno pede
                  <br />
                  um começo diferente.
                </h2>
              </div>
              <p>
                Imagine o uso do espaço.
                <br />
                Depois, planeje o primeiro passo.
              </p>
            </div>
            <div className="applications-grid">
              {scenarios.map((s, i) => (
                <article className={`application application-${i} reveal`} key={s.title}>
                  <button
                    className="application-photo"
                    aria-label={`Ampliar imagem: ${s.title}`}
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setLightbox(i);
                    }}
                  >
                    <Photo
                      name={s.image}
                      alt={s.alt}
                      sizes={
                        i === 0
                          ? "(max-width: 767px) 100vw, 60vw"
                          : "(max-width: 767px) 100vw, 35vw"
                      }
                    />
                    <span className="expand-icon">
                      <Expand size={20} />
                    </span>
                  </button>
                  <span className="eyebrow application-label">Aplicação ilustrativa</span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <a className="text-link" href="#orcamento" onClick={() => request(s.service)}>
                    Planejar esta aplicação <ArrowUpRight size={18} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="planejamento" className="section dark planning-section">
          <div className="container">
            <div className="section-heading reveal">
              <div>
                <span className="eyebrow">04 / LEITURA DO TERRENO</span>
                <h2>
                  Visualize o próximo
                  <br />
                  passo do seu terreno.
                </h2>
              </div>
              <fieldset className="comparison-controls" aria-label="Visualização do terreno">
                <button aria-pressed={!overlay} onClick={() => setOverlay(false)}>
                  Foto do terreno
                </button>
                <button aria-pressed={overlay} onClick={() => setOverlay(true)}>
                  Planejamento ilustrativo
                </button>
              </fieldset>
            </div>
            <figure className="planning-figure reveal">
              <div className={`planning-photo ${overlay ? "overlay-active" : ""}`}>
                <Photo
                  name="br-planning-plot"
                  alt="Terreno vazio com solo e vegetação seca, visto de um ponto elevado, com acesso de terra contornando a área cercada e sem máquinas em primeiro plano"
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) calc(100vw - 64px), (max-width: 1439px) calc(100vw - 112px), 1328px"
                />
                <div className="planning-overlay" aria-hidden={!overlay}>
                  <svg viewBox="0 0 1200 800" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
                    <path d="M75 318 L190 207 L685 202 L531 344 L195 350 Z" className="work-area" />
                    <path
                      d="M18 405 C230 410 405 407 605 404 S972 384 1100 353 Q1176 326 1133 282 Q1092 238 900 207"
                      className="access-path"
                    />
                  </svg>
                  <span className="annotation work-label">Área de trabalho ilustrativa</span>
                  <span className="annotation access-label">Acesso de máquinas</span>
                </div>
                <span className="planning-badge">
                  {overlay ? "Planejamento ilustrativo" : "Foto do terreno"}
                </span>
              </div>
              <figcaption>Simulação visual. A execução depende da avaliação do local.</figcaption>
            </figure>
          </div>
        </section>
        <section id="como-funciona" className="section light process-section">
          <div className="container">
            <span className="eyebrow reveal">05 / COMO FUNCIONA</span>
            <div className="process-grid">
              <h2 className="reveal">
                Uma boa execução
                <br />
                começa com clareza.
              </h2>
              <ol>
                {processSteps.map(([title, text], i) => (
                  <li className="reveal" key={title}>
                    <span className="process-number">0{i + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="coverage reveal">
              <div>
                <span className="eyebrow">OESTE DO PARANÁ</span>
                <h2>
                  Um conceito pensado para
                  <br />o oeste do Paraná.
                </h2>
                <p>
                  Neste demo, Cascavel e Toledo exemplificam a apresentação da área de atendimento.
                  No site de uma empresa real, as cidades são definidas com o responsável.
                </p>
              </div>
              <div className="coverage-places">
                <MapPin size={28} />
                <span>Cascavel</span>
                <span>Toledo</span>
                <small>
                  Referências ilustrativas.
                  <br />
                  Sem delimitação de cobertura.
                </small>
              </div>
            </div>
          </div>
        </section>
        <section id="duvidas" className="section light faq-section">
          <div className="container faq-grid">
            <div className="reveal">
              <span className="eyebrow">06 / DÚVIDAS</span>
              <h2>
                Antes do
                <br />
                primeiro passo.
              </h2>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer]) => (
                <details key={question} className="reveal">
                  <summary>
                    {question}
                    <Plus size={20} />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <BrazilPlanner entry={entry} />
        <section className="closing dark section">
          <div className="container reveal">
            <span className="eyebrow">ABRA ESPAÇO PARA O QUE VEM</span>
            <h2>O próximo passo do seu terreno começa com uma conversa.</h2>
            <a href="#orcamento" className="button button-amber" onClick={() => request()}>
              Solicitar orçamento <ArrowUpRight size={20} />
            </a>
          </div>
        </section>
      </main>
      <footer className="dark">
        <div className="container">
          <div className="footer-top">
            <Wordmark />
            <a className="text-link" href="#inicio">
              Voltar ao início <ArrowUp size={18} />
            </a>
          </div>
          <div className="footer-bottom">
            <p>
              FieldNorth é uma empresa fictícia criada para demonstração. Imagens e aplicações são
              ilustrativas. Projeto de Miguel Ramos.
            </p>
            <span>DEMO · BRASIL</span>
          </div>
        </div>
      </footer>
      <dialog
        id="menu-mobile"
        ref={menuDialog}
        className="mobile-dialog"
        aria-label="Menu de navegação"
        onKeyDown={trap}
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
      >
        <div className="dialog-top">
          <Wordmark />
          <button aria-label="Fechar menu" onClick={closeMenu}>
            <X />
          </button>
        </div>
        <nav aria-label="Navegação móvel">
          {nav.map(([label, id], i) => (
            <a key={id} href={`#${id}`} onClick={closeMenu}>
              <small>0{i + 1}</small>
              {label}
              <ArrowUpRight size={22} />
            </a>
          ))}
          <a
            className="button button-amber"
            href="#orcamento"
            onClick={() => {
              closeMenu();
              request();
            }}
          >
            Solicitar orçamento <ArrowUpRight size={18} />
          </a>
        </nav>
        <p>Projeto demonstrativo · Imagens ilustrativas</p>
      </dialog>
      <dialog
        ref={photoDialog}
        className="photo-dialog"
        aria-labelledby="photo-title"
        onKeyDown={trap}
        onCancel={(e) => {
          e.preventDefault();
          closePhoto();
        }}
      >
        <button className="photo-close" aria-label="Fechar imagem" onClick={closePhoto}>
          <X size={24} />
        </button>
        {lightbox !== null && (
          <figure>
            <Photo
              name={scenarios[lightbox].image}
              alt={scenarios[lightbox].alt}
              eager
              sizes="90vw"
            />
            <figcaption>
              <h3 id="photo-title">{scenarios[lightbox].title}</h3>
              <p>Aplicação ilustrativa. Não representa um serviço executado pela FieldNorth.</p>
              <a
                className="text-link"
                href="#orcamento"
                onClick={() => {
                  request(scenarios[lightbox].service);
                  flushSync(() => setLightbox(null));
                }}
              >
                Planejar esta aplicação <ArrowUpRight size={18} />
              </a>
            </figcaption>
          </figure>
        )}
      </dialog>
    </div>
  );
}
