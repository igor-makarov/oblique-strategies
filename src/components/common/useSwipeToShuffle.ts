import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

const SWIPE_THRESHOLD = 80;

type SwipeState = "idle" | "dragging" | "flying-left" | "flying-right";

export function useSwipeToShuffle() {
  const navigate = useNavigate();
  const [swipeState, setSwipeState] = useState<SwipeState>("idle");
  const dragOffsetXRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  const shuffleToRandomCard = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
    navigate(cardRoute(obliqueStrategies[randomIndex].slug));
  }, [navigate]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (swipeState === "flying-left" || swipeState === "flying-right") return;
      touchStartXRef.current = e.touches[0].clientX;
      dragOffsetXRef.current = 0;
    },
    [swipeState],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (touchStartXRef.current === null) return;
      if (swipeState === "flying-left" || swipeState === "flying-right") return;
      const deltaX = e.touches[0].clientX - touchStartXRef.current;
      dragOffsetXRef.current = deltaX;
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.04}deg)`;
        cardRef.current.style.transition = "none";
      }
      if (swipeState !== "dragging") {
        setSwipeState("dragging");
      }
    },
    [swipeState],
  );

  const onTouchEnd = useCallback(() => {
    if (touchStartXRef.current === null) return;
    const currentOffset = dragOffsetXRef.current;
    touchStartXRef.current = null;
    dragOffsetXRef.current = 0;

    if (Math.abs(currentOffset) >= SWIPE_THRESHOLD) {
      const direction = currentOffset > 0 ? "flying-right" : "flying-left";
      if (cardRef.current) {
        cardRef.current.style.setProperty("--swipe-x", `${currentOffset}px`);
        cardRef.current.style.setProperty("--swipe-rotate", `${currentOffset * 0.04}deg`);
        cardRef.current.style.transform = "";
        cardRef.current.style.transition = "";
      }
      setSwipeState(direction);
    } else {
      if (cardRef.current) {
        cardRef.current.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        cardRef.current.style.transform = "";
        const card = cardRef.current;
        card.addEventListener(
          "transitionend",
          () => {
            card.style.transition = "";
          },
          { once: true },
        );
      }
      setSwipeState("idle");
    }
  }, []);

  const onAnimationEnd = useCallback(() => {
    if (swipeState === "flying-left" || swipeState === "flying-right") {
      shuffleToRandomCard();
    }
  }, [swipeState, shuffleToRandomCard]);

  const cardClassName =
    swipeState === "flying-left"
      ? "card-fly-left"
      : swipeState === "flying-right"
        ? "card-fly-right"
        : undefined;

  return { cardRef, cardClassName, onTouchStart, onTouchMove, onTouchEnd, onAnimationEnd };
}
