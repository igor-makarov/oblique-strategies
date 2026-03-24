import type { ReactNode, RefObject } from "react";

interface Props {
  children: ReactNode;
  cardRef?: RefObject<HTMLElement | null>;
}

export default function CardLayout({ children, cardRef }: Props) {
  return (
    <div className="reference-layout">
      <article ref={cardRef} className="reference-card">
        {children}
      </article>
    </div>
  );
}
