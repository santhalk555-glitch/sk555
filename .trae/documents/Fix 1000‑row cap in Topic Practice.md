## Findings
- Implicit 1000-row cap occurs when fetching all questions without proper pagination:
  - `src/components/PracticeQuestionView.tsx:73–92` uses `.select('*')` with `.range(0, 99999)` for both saved and topic questions. PostgREST caps responses at 1000 by default, so only 1000 rows are returned.
  - The count displayed comes from `questions.length`:
    - `src/components/PracticeQuestionView.tsx:282` shows `{questions.length} Questions Available`, which reports 1000 for topics >1000.
- No explicit `.limit(1000)`, `.range(0, 999)`, or `.slice(0, 1000)` found anywhere in the repo.
- Other large ranges exist (e.g., `.range(0, 9999)` in `QuizSession.tsx`), but the user issue is isolated to the Topic Practice view.

## Fix Strategy
### Counts
- Use `select('id', { count: 'exact', head: true })` to fetch total counts:
  - Topic questions: `supabase.from('quiz_questions').select('id', { count: 'exact', head: true }).eq('topic_id', topicId)`.
  - Saved questions: `supabase.from('saved_questions').select('question_id', { count: 'exact', head: true }).eq('user_id', user.id)`.
- Store in `totalCount` state and replace `{questions.length}` with `{totalCount}` for the header and progress calculations.

### Fetching Questions
- Replace single mega-range fetches with proper retrieval:
  - Topic practice needs all questions in memory (current UI relies on full list for navigation and progress). Implement batch fetching in 1000-sized chunks until `totalCount` is retrieved:
    - Loop: `for (let start = 0; start < totalCount; start += 1000) { const end = Math.min(start + 999, totalCount - 1); await supabase.from('quiz_questions').select('*').eq('topic_id', topicId).order('created_at').range(start, end); }`
    - Concatenate all batches and set `questions` to the full array.
  - Saved-only mode:
    - First get all saved `question_id`s for the user; if the list is large, fetch in 1000-sized chunks and use `.in('id', chunk)` to retrieve questions in batches; merge all results.

### UI Updates
- Replace `{questions.length} Questions Available` with `{totalCount} Questions Available`.
- Compute `totalPages` from `totalCount` and keep existing client-side paging (`questionsPerPage = 20`).
- Keep current navigation behavior intact; it will operate on the full list now that all records are loaded.

### Performance Considerations
- Fetch batches sequentially or with limited concurrency (e.g., 2–3 parallel requests) to avoid overwhelming the backend.
- Preserve `order('created_at')` for consistent pagination across batches.

## Implementation Scope
- Modify only `src/components/PracticeQuestionView.tsx`:
  - Add `totalCount` state.
  - Add `fetchTotalCount()` for both modes.
  - Replace `.range(0, 99999)` calls with batch fetching logic.
  - Update header and progress to use `totalCount`.

## Verification
- Open a topic with >1000 questions (e.g., showing 1188 on the list) and confirm:
  - Header shows `1188 Questions Available`.
  - All 1188 questions are loaded and navigable; no cap at 1000.
- Ensure saved-only mode still works and shows the correct total.

If you approve, I will apply these changes directly and share the final diffs for the modified files.