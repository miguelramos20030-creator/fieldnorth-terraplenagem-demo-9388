import { useEffect, useRef, useState, type RefObject } from "react";

const desktopQuery = "(min-width: 768px) and (hover: hover) and (pointer: fine)";
/** No source or video element is mounted on mobile/reduced-motion/save-data. */
export function useHeroMotion(hero: RefObject<HTMLElement | null>, quiet: boolean, replay: number) {
  const video = useRef<HTMLVideoElement>(null);
  const [desktop, setDesktop] = useState(() => matchMedia(desktopQuery).matches);
  const [deferred, setDeferred] = useState(false);
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [manualPause, setManualPause] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const eligible = desktop && !quiet;
  const enabled = eligible && deferred && !failed;

  useEffect(() => {
    const mq = matchMedia(desktopQuery);
    const change = () => setDesktop(mq.matches);
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    if (!eligible) {
      setDeferred(false);
      setReady(false);
      setPlaying(false);
      return;
    }
    let first = 0, second = 0, timer = 0;
    const afterLoad = () => {
      first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => {
          timer = window.setTimeout(() => setDeferred(true), 250);
        });
      });
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      window.removeEventListener("load", afterLoad);
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      clearTimeout(timer);
    };
  }, [eligible]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      hero.current?.classList.toggle("offscreen", !entry.isIntersecting);
    });
    if (hero.current) observer.observe(hero.current);
    const visibility = () => {
      setVisible(!document.hidden);
      hero.current?.classList.toggle("tab-hidden", document.hidden);
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [hero]);

  useEffect(() => {
    const media = video.current;
    if (!media || !enabled) return;
    if (inView && visible && !manualPause) {
      media.muted = true;
      void media.play().catch(() => setPlaying(false));
    } else media.pause();
  }, [enabled, inView, visible, manualPause, replay]);

  useEffect(() => {
    if (!replay) return;
    setManualPause(false);
    setFailed(false);
    const media = video.current;
    if (media) media.currentTime = 0;
  }, [replay]);

  function toggle() {
    const media = video.current;
    if (!media) return;
    if (!media.paused) {
      setManualPause(true);
      media.pause();
    } else {
      setManualPause(false);
      void media.play().catch(() => setPlaying(false));
    }
  }
  return { video, enabled, ready, playing, toggle,
    onPlaying: () => { setReady(true); setPlaying(true); },
    onPause: () => setPlaying(false),
    onError: () => { setFailed(true); setReady(false); setPlaying(false); },
  };
}