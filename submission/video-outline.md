# Chrimata video outline

Output: `brag-output-v2/brag_submission.mp4` (1920×1080, approximately 3:40). The original `brag.mp4` and `brag_architecture.mp4` are preserved.

| Time | Visual | Narration |
|---|---|---|
| 00:00–00:31.5 | Chrimata-branded title card with Niloy Nath, Nitesh Gupta, TEAM n³t, and a real product capture | Niloy and Nitesh introduce themselves as a team, present Chrimata, and frame the question behind the project. |
| 00:31.5–01:38.6 | The original `brag_architecture.mp4` opening and walkthrough through source evidence, change review, and Hindsight | Existing synchronized narration follows the landing page and product screens. |
| 01:38.6–02:10.2 | Live Northstar diligence issue. The sandbox replay compares a review without memory to one with Hindsight; the result shows 8 recalled memories. | Explain how the agent can reopen a resolved question without memory, then frame the side-by-side replay. |
| 02:10.2–02:31.4 | Resume the original walkthrough at Ask and continue into Architecture | Existing scene-matched voiceover explains Ask, then the architecture simulation. |
| 02:31.4–03:04.8 | Branded architecture takeaway diagram | Explain the UI/API Gateway, review and Ask workloads, PostgreSQL operational state, and Hindsight retain/recall flow. |
| 03:04.8–03:40.4 | Original branded close | Share the takeaway: memory brings prior reasoning forward; current evidence still decides. |

## New opening narration

**Intro (about 31 seconds):** “We are Niloy Nath and Nitesh Gupta—we’re team n cubed t. Together, we built Chrimata, a financial due diligence workspace that ties each claim to its source documents, captures why an analyst made a decision, and brings that reasoning into the next review. The question that drove us was simple: when new evidence changes a number, can an agent explain what changed without forgetting why the team made its earlier call? Let’s show you how it works.”

**Problem (about 29 seconds):** “Here’s the failure mode. New evidence changes MRR, but it doesn’t automatically invalidate the analyst’s earlier explanation. Without memory, the agent sees the latest numbers and open questions, but not why a related issue was resolved. It can reopen the same work or ask for the same evidence again. Chrimata runs that review twice—first without memory, then with Hindsight—so we can compare the results.”

**Takeaway (about 28 seconds):** “What surprised me is that the hardest part isn’t finding the new number; it’s remembering why the team treated it that way. Hindsight brings back the earlier decision and explanation, while PostgreSQL tracks current ticket state. The agent still checks today’s evidence, and a real contradiction can change the outcome. Memory doesn’t make a decision permanent; it gives the next review enough context to question it intelligently.”
