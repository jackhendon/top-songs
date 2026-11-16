import { formatTime, pluralize } from "./format";

/**
 * Result sharing.
 *
 * Kept free of data imports for the same reason as format.ts: this is pulled
 * into client components, and anything that reaches the artist directory JSON
 * drags 130 KB into the browser bundle.
 */

// The canonical host, with the scheme. A bare "topsongs.io" is not linkified by
// several messaging apps, and when it is, it costs a redirect to www.
const SITE_ORIGIN = "https://www.topsongs.io";

// Marks a visit as having come from a shared result, so the loop can be
// measured. Read once on arrival in lib/analytics.ts.
export const SHARE_REF_PARAM = "ref";
export const SHARE_REF_VALUE = "share";

export interface SharePayload {
  /** The message, without the link. */
  text: string;
  /** Where the recipient should land: the same game the sender played. */
  url: string;
}

function shareUrl(path: string): string {
  return `${SITE_ORIGIN}${path}?${SHARE_REF_PARAM}=${SHARE_REF_VALUE}`;
}

function grid(cells: boolean[]): string {
  return cells.map((hit) => (hit ? "🟩" : "🟥")).join("");
}

export function buildQuizShare(props: {
  artistName: string;
  slug: string;
  /** Which of the ten ranks were guessed, in rank order. */
  guessed: boolean[];
  totalGuesses: number;
  hintsUsed: number;
  /** Seconds. Zero when unknown, for example a restored game. */
  elapsedSeconds: number;
}): SharePayload {
  const score = props.guessed.filter(Boolean).length;

  // Half of all finishers get 10/10, so the grid alone is ten green squares
  // for most people who would share. Guesses and time are what differ between
  // two fans, so they are what gives a friend something to beat.
  const stats = [
    `${score}/10 in ${props.totalGuesses} ${pluralize(props.totalGuesses, "guess", "guesses")}`,
    props.hintsUsed > 0
      ? `${props.hintsUsed} ${pluralize(props.hintsUsed, "hint")}`
      : null,
    props.elapsedSeconds > 0 ? formatTime(props.elapsedSeconds) : null,
  ]
    .filter(Boolean)
    .join(", ");

  // Nobody sends a celebration of 2/10. A low score reads better as a dare.
  const challenge =
    score <= 5 ? "Harder than it looks. Can you do better?" : "Can you beat me?";

  const text = [
    `${props.artistName} top 10 on Top Songs`,
    grid(props.guessed.slice(0, 5)),
    grid(props.guessed.slice(5, 10)),
    stats,
    challenge,
  ].join("\n");

  return { text, url: shareUrl(`/artist/${props.slug}`) };
}

export function buildHigherLowerShare(props: {
  mode: "daily" | "unlimited";
  puzzleNumber?: number;
  streak: number;
  results: boolean[];
}): SharePayload {
  const heading =
    props.mode === "daily"
      ? `Top Songs Daily #${props.puzzleNumber}`
      : "Top Songs: Higher or Lower";

  const text = [
    heading,
    `Streak: ${props.streak}`,
    grid(props.results),
    props.mode === "daily" ? "Same puzzle for everyone. Can you beat me?" : "Can you beat me?",
  ].join("\n");

  return {
    text,
    url: shareUrl(props.mode === "daily" ? "/daily" : "/higher-lower"),
  };
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Clipboard API refused: insecure context, denied permission, or an older
    // browser. The selection-based route still works in most of those.
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Opens the system share sheet on touch devices, copies to the clipboard
 * everywhere else. Returns how the share happened, or null if it did not: the
 * user dismissed the sheet, or copying failed.
 */
export async function shareResult(
  payload: SharePayload,
): Promise<"native" | "clipboard" | null> {
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  if (isTouch && typeof navigator.share === "function") {
    try {
      // url is passed on its own rather than inside the text so the receiving
      // app can render a link preview.
      await navigator.share({ text: payload.text, url: payload.url });
      return "native";
    } catch (error) {
      // Dismissing the sheet is a decision, not a failure. Anything else falls
      // through to copying.
      if (error instanceof DOMException && error.name === "AbortError") {
        return null;
      }
    }
  }

  const copied = await copyText(`${payload.text}\n${payload.url}`);
  return copied ? "clipboard" : null;
}
