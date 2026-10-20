# fomo all-time PnL

[fomo](https://fomo.family) profiles only show a trader's 30-day PnL. This bookmarklet shows their **all-time PnL** and all-time rank, plus 30d / 7d / 24h PnL, trade count and volume, in a small panel right on fomo.family.

Unofficial. Not affiliated with fomo.

## Install

You need [Node.js](https://nodejs.org) 18 or newer.

```sh
git clone https://github.com/devincimaker/fomo-pnl.git
cd fomo-pnl
node server.js
```

Open http://localhost:3333 and drag the **fomo PnL** button onto your bookmarks bar (Cmd+Shift+B / Ctrl+Shift+B shows it). You can stop the server afterwards; the bookmark doesn't need it.

**Without Node:** create a new bookmark, and as its URL type `javascript:` followed by the entire contents of [`bookmarklet.js`](bookmarklet.js).

## Use

1. Go to fomo.family while logged in.
2. Click the bookmark. On someone's profile page it looks them up automatically. Anywhere else, type a handle.

If it says your login expired, reload the fomo page and click again.

## How it works

A bookmarklet is a bookmark whose address is JavaScript. Clicking it runs the code inside the page you're on. On fomo.family, the code reads the login token fomo's site already keeps in your browser, then calls fomo's API the same way the site does:

- `GET /v2/users/userHandle/{handle}` to find the user's ID
- `GET /v2/users/{id}/leaderboard` to get their stats. `rank.pnl` is all-time PnL; `rank30d`, `rank7d` and `rank24h` cover the shorter windows.

fomo's API only accepts these requests from fomo.family itself, which is why this is a bookmarklet rather than a standalone website.

## Safety

A bookmarklet runs with your fomo login, so only install one you've read or trust. This one is about 60 lines in [`bookmarklet.js`](bookmarklet.js). It only makes the two read-only requests above, sends nothing anywhere except fomo's own API, and can't trade or move funds.

## License

MIT
