/**
 * Third-party reposts used as social proof on the course page.
 *
 * Everything here is a statement of public fact — who shared a chart, on which
 * platform, and (only where they wrote one) their verbatim words. Nothing in
 * this file should characterise a repost as an endorsement of the paid course;
 * see SOCIAL_PROOF_DISCLOSURE, which is rendered under the grid.
 */

export interface SocialProofRepost {
  id: string;
  /** Display name as it appears on the account. */
  name: string;
  /** Account handle, without the leading @. */
  handle: string;
  /** Optional title shown under the name — omit unless it is uncontroversial. */
  descriptor?: string;
  platformLabel: "Instagram" | "Truth Social";
  /** Account carries a platform verification badge. */
  verified: boolean;
  /** Link to the original post, so any claim here is checkable. */
  permalink: string;
  /** The chart of ours that they shared. */
  chartTitle: string;
  /** What they did, in neutral language. */
  action: string;
  /** Their own words, verbatim. Omit when they added no comment. */
  quote?: string;
  /** Path under public/. Falls back to a placeholder card if the file is absent. */
  screenshot: string;
  /**
   * Intrinsic pixel size of the screenshot. Per-entry rather than shared: the
   * captures come from different devices (phone ~9:19.5, desktop ~4:7), and
   * both the card and the modal size from these, so a wrong ratio distorts the
   * image.
   */
  width: number;
  height: number;
  alt: string;
}

export const SOCIAL_PROOF_REPOSTS: SocialProofRepost[] = [
  {
    id: "lara-trump",
    name: "Lara Trump",
    handle: "laraleatrump",
    platformLabel: "Instagram",
    verified: true,
    permalink: "https://www.instagram.com/p/Db03DB9NPWp/",
    chartTitle: "Inflation by Presidency",
    action: "Posted the chart with credit",
    quote: "Wow. Great chart @yunggeeski_ 💯",
    screenshot: "/images/social-proof/lara-trump.png",
    width: 960,
    height: 2079,
    alt: "Instagram post by laraleatrump showing the Inflation by Presidency chart, captioned “Wow. Great chart @yunggeeski_”",
  },
  {
    id: "donald-trump",
    name: "Donald J. Trump",
    handle: "realDonaldTrump",
    descriptor: "President of the United States",
    platformLabel: "Truth Social",
    verified: true,
    permalink: "https://truthsocial.com/@realDonaldTrump/posts/117067400225404799",
    chartTitle: "Inflation by Presidency",
    action: "Re-shared the post carrying the chart credit",
    screenshot: "/images/social-proof/donald-trump.png",
    width: 877,
    height: 1546,
    alt: "Truth Social post by @realDonaldTrump re-sharing the Inflation by Presidency chart credited to @yunggeeski_",
  },
  {
    id: "mandy-patinkin",
    name: "Mandy Patinkin",
    handle: "mandypatinkin",
    platformLabel: "Instagram",
    verified: true,
    permalink: "https://www.instagram.com/reel/DYp3-MCNuXY/",
    chartTitle: "Which Political Party Grew the Debt More?",
    action: "Reposted with credit",
    screenshot: "/images/social-proof/mandy-patinkin.png",
    width: 960,
    height: 2079,
    alt: "Instagram reel by mandypatinkin reposting the “Which Political Party Grew the Debt More?” chart from @yunggeeski_",
  },
];

export const SOCIAL_PROOF_DISCLOSURE =
  "Public posts by the accounts shown, linked so you can verify each one. Sharing a chart is not an endorsement of this course.";
