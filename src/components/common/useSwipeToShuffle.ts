import { useCallback, useEffect, type RefObject, useRef } from "react";
import { useLocation } from "react-router";

const SWIPE_THRESHOLD = 80;

type SwipeState = "idle" | "dragging" | "flying-left" | "flying-right";

export function useSwipeToShuffle(
  cardRef: RefObject<HTMLElement | null>,
  onShuffleComplete: () => void,
) {
  const location = useLocation();
  const dragOffsetXRef = useRef(0);
  const swipeStateRef = useRef<SwipeState>("idle");
  const touchStartXRef = useRef<number | null>(null);

  const setSwipeState = useCallback((nextState: SwipeState) => {
    swipeStateRef.current = nextState;

    if (cardRef.current) {
      cardRef.current.classList.toggle(
        "card-fly-left",
        nextState === "flying-left",
      );
      cardRef.current.classList.toggle(
        "card-fly-right",
        nextState === "flying-right",
      );
    }
  }, []);

  const resetCard = useCallback(() => {
    touchStartXRef.current = null;
    dragOffsetXRef.current = 0;
    setSwipeState("idle");

    if (cardRef.current) {
      cardRef.current.style.transform = "";
      cardRef.current.style.transition = "";
      cardRef.current.style.removeProperty("--swipe-x");
      cardRef.current.style.removeProperty("--swipe-rotate");
    }
  }, [cardRef, setSwipeState]);

  useEffect(() => {
    resetCard();
  }, [location.pathname, resetCard]);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const onTouchStart = (event: TouchEvent) => {
      if (
        swipeStateRef.current === "flying-left" ||
        swipeStateRef.current === "flying-right"
      ) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      touchStartXRef.current = touch.clientX;
      dragOffsetXRef.current = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartXRef.current === null) return;
      if (
        swipeStateRef.current === "flying-left" ||
        swipeStateRef.current === "flying-right"
      ) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - touchStartXRef.current;
      dragOffsetXRef.current = deltaX;
      card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.04}deg)`;
      card.style.transition = "none";

      if (swipeStateRef.current !== "dragging") {
        setSwipeState("dragging");
      }
    };

    const onTouchEnd = () => {
      if (touchStartXRef.current === null) return;
      const currentOffset = dragOffsetXRef.current;
      touchStartXRef.current = null;
      dragOffsetXRef.current = 0;

      if (Math.abs(currentOffset) >= SWIPE_THRESHOLD) {
        const direction = currentOffset > 0 ? "flying-right" : "flying-left";
        card.style.setProperty("--swipe-x", `${currentOffset}px`);
        card.style.setProperty("--swipe-rotate", `${currentOffset * 0.04}deg`);
        card.style.transform = "";
        card.style.transition = "";
        setSwipeState(direction);
        onShuffleComplete();
      } else {
        card.style.transition =
          "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        card.style.transform = "";
        card.addEventListener(
          "transitionend",
          () => {
            card.style.transition = "";
          },
          { once: true },
        );
        setSwipeState("idle");
      }
    };

    card.addEventListener("touchstart", onTouchStart);
    card.addEventListener("touchmove", onTouchMove);
    card.addEventListener("touchend", onTouchEnd);

    return () => {
      card.removeEventListener("touchstart", onTouchStart);
      card.removeEventListener("touchmove", onTouchMove);
      card.removeEventListener("touchend", onTouchEnd);
    };
  }, [onShuffleComplete, resetCard, setSwipeState]);
}
