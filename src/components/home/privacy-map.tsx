import type { ReactNode } from "react";
import { IconAt, IconChrome, IconLayers, IconSparkles, IconTrending } from "@/components/icons";
import s from "./privacy-map.module.css";

type NodeId = "session" | "storage" | "ai";

function Node({ className, icon, title, sub, id }: { className: string; icon: ReactNode; title: string; sub?: string; id?: NodeId }) {
  return (
    <span className={`${s.node} ${className}`} data-node={id}>
      {id ? <span className={s.ring} /> : null}
      <span className={s.icon}>{icon}</span>
      <span className={s.text}>
        <span className={s.title}>{title}</span>
        {sub ? <span className={s.sub}>{sub}</span> : null}
      </span>
    </span>
  );
}

function Wire({ className, packet = false }: { className: string; packet?: boolean }) {
  return (
    <span className={`${s.link} ${className}`}>
      {packet ? (
        <span className={s.run} data-decor="">
          <span className={s.packet} />
        </span>
      ) : null}
    </span>
  );
}

/**
 * Where GrowX's data lives, as an aria-hidden illustration (the cards below say it in words).
 * Everything sits inside the dashed "Your computer" boundary except one link: the x.com session.
 * Three packets travel along the extension's links (6 s, 3 times, >= 1024px) and rest at their
 * destination. Hovering a card (rendered as `children`, each with data-privacy) rings its node
 * through :has(), changing only the ring layer's opacity.
 */
export function PrivacyMap({ children }: { children?: ReactNode }) {
  return (
    <div className={s.wrap}>
      <div className="reveal-scale">
        <div className={s.map} aria-hidden="true" data-ambient="">
          <span className={s.tag}>Illustration</span>
          <div className={s.layout}>
            <div className={s.boundary}>
              <span className={s.label}>Your computer</span>
              <Node className={s.chrome} icon={<IconChrome size={16} />} title="Chrome" />
              <Wire className={s.c0} />
              <Node className={`${s.ext} ${s.brand}`} icon={<IconTrending size={16} />} title="GrowX extension" />
              <Wire className={`${s.c1} ${s.data}`} packet />
              <Node className={s.store} id="storage" icon={<IconLayers size={16} />} title="chrome.storage" sub="queue, history, posts, analytics" />
              <Wire className={`${s.c2} ${s.data}`} packet />
              <Node className={s.ai} id="ai" icon={<IconSparkles size={16} />} title="Chrome's built-in AI" sub="drafts" />
              <Wire className={`${s.cx} ${s.data}`} />
            </div>
            <Wire className={`${s.out} ${s.data}`} packet />
            <div className={s.dest}>
              <Node className="" id="session" icon={<IconAt size={16} />} title="x.com" sub="your signed-in session" />
              <span className={s.no}>No X password · no X OAuth</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted">Optional anonymous usage counts can be switched off.</p>
      </div>
      {children}
    </div>
  );
}
