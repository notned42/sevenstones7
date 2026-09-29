# Seven Stones

Seven Stones is a browser-only guessing game built for GitHub Pages. It has no build step and no external dependencies: upload `index.html`, `styles.css`, and `app.js` to a repository and enable GitHub Pages from the repository's Pages settings.

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Add the three site files in this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select the default branch and `/ (root)`, then save.
5. GitHub will provide the public site URL after the Pages deployment finishes.

The project is intentionally static, so it can also be opened locally by double-clicking `index.html`.

## Included game systems

- Equal-probability physical draws from a 7 orange / 7 blue / 1 green bag.
- Ten-turn rounds that end when the player runs out of purple stones or reaches turn ten.
- Dynamic bidding from one stone through the full purple bank.
- Round-score formula with turn proportion, final purple, green-loss penalty, full-round bonus, and longest same-color correct streak.
- Lifetime average score with flat achievement bonuses and cumulative multipliers.
- All 24 badges, including the separate Sacred Cow badge offered by the Faustian Bargain choice.
- Local browser persistence for the lifetime ledger, badges, player name, and an unfinished round.
- Responsive layout for desktop and mobile screens.

## Interpretation notes

- A correct ordinary bid removes the stake and pays `2 × bid`; a correct green bid removes the stake and pays `15 × bid`, matching the stated payout language.
- The Noble Savage check uses `remaining-color probability × payout multiplier` as expected value, so values below `1` are against the odds.
- Babylon 2.0 tracks cumulative successful payout stones across rounds.
- The green-loss flag is set when a failed green bid is the turn that leaves the round at zero purple stones.
- The lifetime score is recalculated from the round-score average and achievement effects in the order the badges were earned, so each bonus takes effect immediately.
