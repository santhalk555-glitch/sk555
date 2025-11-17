## Changes Overview
- Add two General subjects: Environment, Computer.
- Update all places where General subjects are defined and used.
- Keep existing UI patterns, counts, and Supabase queries.

## Files to Update
1. PracticeLobby
- Update both `generalSubjectNames` arrays to include `'Environment'` and `'Computer'`.
- This ensures:
  - General branch question counts include new subjects.
  - General subject list fetches and shows these subjects.
  - Topic and question counts continue to use exact Supabase counts.

2. SubjectSelectionModal
- Update its `generalSubjectNames` to include the two new subjects for any modal-based selection that lists General subjects.

## Routing
- The app uses `window.history` state, not URL paths. Maintain this to avoid breaking navigation. Continue pushing `practiceView` states while keeping the current pathname unchanged.
- Optionally include `practicePath` in the state for future deep-linking (no visible URL change).

## Backend Integration
- Code queries General subjects via `subjects_hierarchy` where `exam_simple_id IS NULL` and `name IN generalSubjectNames`.
- Ensure Supabase has `subjects_hierarchy` rows for `'Environment'` and `'Computer'` with `simple_id` values (e.g., `environment`, `computer`). The existing code will pick them up automatically.

## Verification
- General page shows Environment and Computer cards.
- Clicking each card shows topics, and practice loads questions with the batch-paginated fetching already implemented.
- Counts on badges use exact Supabase counts and display correctly.

If approved, I will apply these small changes and provide diffs for modified files.