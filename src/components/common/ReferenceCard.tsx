import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function ReferenceCard({ children }: Props) {
  return <article className="reference-card">{children}</article>;
}
