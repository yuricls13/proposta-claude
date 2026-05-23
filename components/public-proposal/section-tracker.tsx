'use client';

import { useEffect, useRef } from 'react';

const SECTIONS = ['hero', 'description', 'items', 'notes', 'cta'] as const;
type Section = (typeof SECTIONS)[number];

interface SectionTrackerProps {
  slug: string;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = sessionStorage.getItem('proposta_session_id');
  if (!id) {
    id = Math.random().toString(36).slice(2, 14);
    sessionStorage.setItem('proposta_session_id', id);
  }
  return id;
}

export function SectionTracker({ slug }: SectionTrackerProps) {
  const sectionTimings = useRef<Record<Section, number>>({
    hero: 0,
    description: 0,
    items: 0,
    notes: 0,
    cta: 0,
  });
  const currentSection = useRef<Section | null>(null);
  const lastTimestamp = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const sessionId = useRef<string>(getSessionId());
  const sentRef = useRef<Set<Section>>(new Set());

  useEffect(() => {
    const sectionEls = SECTIONS.map((id) => ({
      id,
      el: document.querySelector<HTMLElement>(`[data-section="${id}"]`),
    })).filter((s) => s.el !== null) as { id: Section; el: HTMLElement }[];

    if (sectionEls.length === 0) return;

    // IntersectionObserver para detectar seção ativa
    const observer = new IntersectionObserver(
      (entries) => {
        // Pega a seção mais visível
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const section = visible.target.getAttribute('data-section') as Section | null;
        if (!section) return;

        const now = Date.now();
        if (currentSection.current && currentSection.current !== section) {
          sectionTimings.current[currentSection.current] +=
            now - lastTimestamp.current;
        }
        currentSection.current = section;
        lastTimestamp.current = now;
      },
      { threshold: [0.25, 0.5, 0.75] },
    );

    sectionEls.forEach(({ el }) => observer.observe(el));

    // Scroll depth tracking
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      if (pct > maxScrollDepth.current) {
        maxScrollDepth.current = Math.min(100, pct);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Beacon ao sair ou aba ficar invisível
    async function flush() {
      // Fecha timing da seção atual
      if (currentSection.current) {
        const now = Date.now();
        sectionTimings.current[currentSection.current] += now - lastTimestamp.current;
        lastTimestamp.current = now;
      }

      // Envia apenas seções não enviadas com tempo > 500ms
      const toSend = SECTIONS.filter(
        (s) =>
          !sentRef.current.has(s) && sectionTimings.current[s] > 500,
      );
      if (toSend.length === 0) return;

      for (const section of toSend) {
        const payload = JSON.stringify({
          slug,
          section,
          timeSpent: sectionTimings.current[section],
          scrollDepth: maxScrollDepth.current,
          sessionId: sessionId.current,
        });
        sentRef.current.add(section);

        if ('sendBeacon' in navigator) {
          navigator.sendBeacon(
            '/api/track',
            new Blob([payload], { type: 'application/json' }),
          );
        } else {
          fetch('/api/track', {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          }).catch(() => {});
        }
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') flush();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);

    // Flush a cada 20s mesmo sem evento de saída
    const intervalId = window.setInterval(flush, 20_000);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      window.clearInterval(intervalId);
      flush();
    };
  }, [slug]);

  return null;
}
