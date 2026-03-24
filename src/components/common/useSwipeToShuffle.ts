import { useCallback, useEffect, type RefObject, useRef } from "react";
import { useLocation } from "react-router";

const SWIPE_THRESHOLD = 80;
const SHUFFLE_CALLBACK_PERCENT = 70;

type SwipeState = "idle" | "dragging" | "flying-left" | "flying-right";

function getAnimationDurationMs(element: HTMLElement) {
  const animationDuration = getComputedStyle(element)
    .animationDuration.split(",")[0]
    ?.trim();

  if (!animationDuration) {
    return 0;
  }

  if (animationDuration.endsWith("ms")) {
    return Number.parseFloat(animationDuration);
  }

  if (animationDuration.endsWith("s")) {
    return Number.parseFloat(animationDuration) * 1000;
  }

  return 0;
}

export function useSwipeToShuffle(
  cardRef: RefObject<HTMLElement | null>,
  onShuffleComplete: () => void,
) {
  const location = useLocation();
  const dragOffsetXRef = useRef(0);
  const didTriggerShuffleRef = useRef(false);
  const shuffleCallbackTimeoutRef = useRef<number | null>(null);
  const swipeStateRef = useRef<SwipeState>("idle");
  const touchStartXRef = useRef<number | null>(null);

  const clearScheduledShuffleCallback = useCallback(() => {
    if (shuffleCallbackTimeoutRef.current !== null) {
      window.clearTimeout(shuffleCallbackTimeoutRef.current);
      shuffleCallbackTimeoutRef.current = null;
    }
  }, []);

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
    clearScheduledShuffleCallback();
    didTriggerShuffleRef.current = false;
    touchStartXRef.current = null;
    dragOffsetXRef.current = 0;
    setSwipeState("idle");

    if (cardRef.current) {
      cardRef.current.style.transform = "";
      cardRef.current.style.transition = "";
      cardRef.current.style.removeProperty("--swipe-x");
      cardRef.current.style.removeProperty("--swipe-rotate");
    }
  }, [cardRef, clearScheduledShuffleCallback, setSwipeState]);

  useEffect(() => {
    resetCard();
  }, [location.pathname, resetCard]);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const triggerShuffleComplete = () => {
      if (didTriggerShuffleRef.current) {
        return;
      }

      didTriggerShuffleRef.current = true;
      clearScheduledShuffleCallback();
      onShuffleComplete();
    };

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
        didTriggerShuffleRef.current = false;
        setSwipeState(direction);
        clearScheduledShuffleCallback();
        shuffleCallbackTimeoutRef.current = window.setTimeout(
          triggerShuffleComplete,
          getAnimationDurationMs(card) * (SHUFFLE_CALLBACK_PERCENT / 100),
        );
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

    const onAnimationEnd = () => {
      if (
        swipeStateRef.current === "flying-left" ||
        swipeStateRef.current === "flying-right"
      ) {
        triggerShuffleComplete();
      }
    };

    card.addEventListener("touchstart", onTouchStart);
    card.addEventListener("touchmove", onTouchMove);
    card.addEventListener("touchend", onTouchEnd);
    card.addEventListener("animationend", onAnimationEnd);

    return () => {
      clearScheduledShuffleCallback();
      card.removeEventListener("touchstart", onTouchStart);
      card.removeEventListener("touchmove", onTouchMove);
      card.removeEventListener("touchend", onTouchEnd);
      card.removeEventListener("animationend", onAnimationEnd);
    };
  }, [clearScheduledShuffleCallback, onShuffleComplete, setSwipeState]);
}
