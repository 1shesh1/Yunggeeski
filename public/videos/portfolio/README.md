# Portfolio videos

Each featured post plays a self-hosted MP4 named after its Instagram reel shortcode
(the part after `/reel/` in the post URL):

    https://www.instagram.com/reel/DSU-Lp6jUqa/  ->  DSU-Lp6jUqa.mp4

Names are case-sensitive. Featured posts and their order are set in /admin
(home shows the first 6, /portfolio shows all). A post with no file here falls
back to its thumbnail, then to a placeholder.

Current featured posts:

| # | Post                          | File               |
|---|-------------------------------|--------------------|
| 1 | Pelosi vs Buffett             | DSU-Lp6jUqa.mp4    |
| 2 | Real Cost of Takeout          | DV6P8a2jY43.mp4    |
| 3 | Inflation vs. everyday costs  | DUPL9DdDezI.mp4    |
| 4 | (untitled — set in /admin)    | DZXvjU4RQzy.mp4    |
| 5 | (untitled — set in /admin)    | DYXzhMvO3qn.mp4    |
| 6 | (untitled — set in /admin)    | Davz1BquTR2.mp4    |
| 7 | Does the Zodiac Affect Stocks? | DdXGAx1OPjr.mp4   |
| 8 | Move Out of Your Parents' House? | DdFEWy_uZkb.mp4 |
| 9 | Day of the Week Returns       | DXhukpDj_fj.mp4    |

MP4s are stored with Git LFS (see .gitattributes) — run `git lfs install` before
committing them. Keep each under ~20 MB (H.264, 1080x1920 or 720x1280).
