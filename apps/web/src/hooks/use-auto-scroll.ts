import { useEffect, useRef, useCallback } from "react";

const USER_SCROLL_THRESHOLD = 50;

export function useAutoScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const userHasScrolledRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const lastChildCountRef = useRef(0);

  const isAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= USER_SCROLL_THRESHOLD;
  }, [containerRef]);

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const bottom = bottomRef.current;
      if (!bottom) return;

      isAutoScrollingRef.current = true;
      bottom.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
        block: "end",
      });

      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 500);
    },
    [bottomRef],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout!);

      if (isAutoScrollingRef.current) return;

      if (!isAtBottom()) {
        userHasScrolledRef.current = true;
      } else {
        userHasScrolledRef.current = false;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout!);
    };
  }, [containerRef, isAtBottom]);

  /**
   * Watch for new DOM nodes being added to the container.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      const hasNewNodes = mutations.some(
        (mutation) =>
          mutation.type === "childList" && mutation.addedNodes.length > 0,
      );

      if (!hasNewNodes) return;

      const currentChildCount = container.children[0]?.children.length || 0;

      if (currentChildCount > lastChildCountRef.current) {
        lastChildCountRef.current = currentChildCount;
        userHasScrolledRef.current = false;
      }

      if (!userHasScrolledRef.current) {
        scrollToBottom();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [containerRef, scrollToBottom]);

  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  return {
    containerRef,
    bottomRef,
    scrollToBottom,
    isAtBottom,
    userHasScrolled: () => userHasScrolledRef.current,
  };
}
