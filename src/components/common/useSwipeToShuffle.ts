import { useCallback, useEffect, type RefObject, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

const SWIPE_THRESHOLD = 80;

type SwipeState = "idle" | "dragging" | "flying-left" | "flying-right";

export function useSwipeToShuffle(
  cardRef: RefObject<HTMLElement | null>,
  didShuffle: () => void,
) {
  const location = useLocation();
  const navigate = useNavigate();
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

  const shuffleToRandomCard = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
    navigate(cardRoute(obliqueStrategies[randomIndex].slug));
  }, [navigate]);

  useEffect(() => {
    setSwipeState("idle");
    didShuffle();
  }, [didShuffle, location.pathname, setSwipeState]);

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
        shuffleToRandomCard();
      }
    };

    card.addEventListener("touchstart", onTouchStart);
    card.addEventListener("touchmove", onTouchMove);
    card.addEventListener("touchend", onTouchEnd);
    card.addEventListener("animationend", onAnimationEnd);

    return () => {
      card.removeEventListener("touchstart", onTouchStart);
      card.removeEventListener("touchmove", onTouchMove);
      card.removeEventListener("touchend", onTouchEnd);
      card.removeEventListener("animationend", onAnimationEnd);
    };
  }, [setSwipeState, shuffleToRandomCard]);
}
