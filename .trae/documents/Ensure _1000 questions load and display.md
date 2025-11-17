## Diagnosis
- PracticeQuestionView still shows 1000 because only the first 1000 records are being loaded. Count-independent batching may stop early due to unstable ordering or backend behavior with `order('created_at')`.

## Plan
1. Enforce deterministic ordering by primary key:
   - Replace `order('created_at')` with `order('id', { ascending: true })` for topic and saved queries to guarantee stable pagination across `range` windows.
2. Add fallback continuation based on server count:
   - After the count-independent loop, if `totalCount` from the count API is greater than the fetched length, continue fetching remaining batches until fetched length equals the count.
3. Add lazy page fetch safety:
   - When the user navigates to a page whose range exceeds the currently loaded array, fetch that page’s 20 items via `.range(pageStart, pageEnd)` and splice them into `questions`. This guarantees navigation beyond 1000 even if initial batch falls short.
4. Keep UI using `totalCount` for accuracy.

## Scope
- Update `src/components/PracticeQuestionView.tsx` only with:
  - Ordering by `id` in all question queries.
  - Fallback batch loop using server `count` when needed.
  - A `useEffect` on `currentPage` to fetch missing pages lazily.

## Verification
- Open topics with totals >1000 and verify header shows the full count and pagination can reach pages beyond 1000. 