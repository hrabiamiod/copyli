import { useState, useCallback } from "react";

interface Props {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err);
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard unavailable */ }
  }, [title, text, url]);

  return (
    <button
      onClick={handleShare}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 16px",
        borderRadius: 999,
        border: "1.5px solid var(--forest)",
        background: copied ? "var(--forest)" : "transparent",
        color: copied ? "#fff" : "var(--forest)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
        fontFamily: "inherit",
        lineHeight: 1,
      }}
      aria-label="Udostępnij tę stronę"
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Skopiowano!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Udostępnij
        </>
      )}
    </button>
  );
}
