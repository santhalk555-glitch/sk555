## Problem
- Entering Practice Lobby adds an intermediate history entry `{ lobbyView: 'practice' }`, so Back from the Practice Lobby branch list first pops to that entry and only then to `{ lobbyView: 'menu' }`. This requires two presses.

## Plan
- Change `GameLobby.handlePracticeLobby` to use `window.history.replaceState({ section: 'lobby', lobbyView: 'practice' }, '', window.location.pathname)` instead of `pushState`, so there is no intermediate `practice` entry.
- Keep PracticeLobby’s internal `replaceState` to set `{ practiceView: 'branches' }` on mount.
- Ensure PracticeLobby Back continues to call `window.history.back()`; the pop should go directly to `{ lobbyView: 'menu' }`.

## Scope
- Update `src/components/GameLobby.tsx` only.

## Verification
- Navigate: menu → practice; branch list Back returns to lobby menu with a single press. Browser Back also steps correctly.