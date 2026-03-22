import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function CardLayout({ children }: Props) {
  return (
    <div className="reference-layout">
      <article className="reference-card">{children}</article>
    </div>
  );
}
