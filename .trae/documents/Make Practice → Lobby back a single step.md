## Problem
- Returning from Practice Lobby’s branch list to Game Lobby requires multiple back presses because GameLobby pushes a new `menu` entry when PracticeLobby calls `onBack`, instead of popping the prior `practice` entry.

## Plan
1. In `GameLobby.tsx`, change the `onBack` passed to `PracticeLobby` to call `window.history.back()` and set `showPracticeLobby` to `false`. Do not push a new `menu` state.
2. Keep `handlePracticeLobby` pushing `practice` when entering the practice view.
3. Rely on GameLobby’s `popstate` handler to set `currentView` to `menu` and clear practice state when history pops.

## Scope
- Update only `src/components/GameLobby.tsx` at the PracticeLobby mount.

## Verification
- Navigate menu → practice → branch → back: single press returns to Game Lobby menu. Browser back also steps exactly one level per press.