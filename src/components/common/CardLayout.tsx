import type { ReactNode, RefObject } from "react";

interface Props {
  children: ReactNode;
  cardRef?: RefObject<HTMLElement | null>;
  cardClassName?: string;
  onTouchStart?: React.TouchEventHandler<HTMLElement>;
  onTouchMove?: React.TouchEventHandler<HTMLElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLElement>;
  onAnimationEnd?: React.AnimationEventHandler<HTMLElement>;
}

export default function CardLayout({ children, cardRef, cardClassName, onTouchStart, onTouchMove, onTouchEnd, onAnimationEnd }: Props) {
  const className = ["reference-card", cardClassName].filter(Boolean).join(" ");
  return (
    <div className="reference-layout">
      <article
        ref={cardRef}
        className={className}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onAnimationEnd={onAnimationEnd}
      >
        {children}
      </article>
    </div>
  );
}
