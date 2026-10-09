/**
 * The page numbers a pager should print.
 *
 * The design draws five numbers, which is all a short listing needs. Waitak,
 * on the Clinical Library, News & events and the search page: "The pagination
 * should eventually have a grouping [...] when the amount becomes too much."
 *
 * So the first and last page are always reachable, the current page travels in
 * a three-wide window, and an ellipsis stands in for whatever is skipped. The
 * row never grows past seven cells, which is what the 40px slots allow for at
 * the phone width.
 */
export function pageSequence(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)

  const out: (number | '…')[] = [1]
  // Near either end the window stops sliding and sits against it, so the row
  // keeps its width instead of collapsing to three numbers on page 1.
  const start = Math.max(2, Math.min(page - 1, pages - 4))
  const end = Math.min(pages - 1, Math.max(page + 1, 5))

  if (start > 2) out.push('…')
  for (let n = start; n <= end; n++) out.push(n)
  if (end < pages - 1) out.push('…')
  out.push(pages)

  return out
}
