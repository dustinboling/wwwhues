// Allowlist judging for the parity harness (pure logic; run.mjs wires
// the report, allowlist and baseline).
//
// Rules:
//  1. A pair on the allowlist may fail; a pair off it may not — any
//     failed check not listed for the pair is an error.
//  2. Fixed pairs must leave — a fully passing pair still listed is
//     an error (later packages remove the pairs they fix).
//  3. Never add a pair — an allowlist that grows (new pairs or new
//     checks) versus the committed HEAD baseline is an error unless
//     acknowledged with PARITY_ALLOWLIST_GROWTH=1, which the run log
//     must pair with a PR-body flag. A null baseline (first landing,
//     nothing committed yet) skips this rule.

/**
 * @param report { pairs: [{ id, failedChecks }] }
 * @param allowlist { [pairId]: string[] }
 * @param baseline { [pairId]: string[] } | null
 * @param growthAck boolean (PARITY_ALLOWLIST_GROWTH=1)
 * @returns string[] errors (empty = green)
 */
export function judgeReport(report, allowlist, baseline, growthAck) {
  const errors = []
  for (const pair of report.pairs) {
    const allowed = allowlist[pair.id] ?? []
    const unallowed = pair.failedChecks.filter((c) => !allowed.includes(c))
    if (unallowed.length > 0) {
      errors.push(
        `${pair.id}: unallowlisted failures: ${unallowed.join(', ')} (allowlisted: ${allowed.join(', ') || 'none'})`,
      )
    }
    if (pair.failedChecks.length === 0 && allowed.length > 0) {
      errors.push(`${pair.id}: passes fully but is still allowlisted — remove it (later packages remove the pairs they fix).`)
    }
  }
  if (baseline !== null) {
    const grown = Object.keys(allowlist).filter((id) => baseline[id] === undefined)
    const widened = Object.keys(allowlist).filter(
      (id) => baseline[id] !== undefined && allowlist[id].some((c) => !baseline[id].includes(c)),
    )
    if ((grown.length > 0 || widened.length > 0) && !growthAck) {
      errors.push(
        `allowlist grew versus HEAD (added pairs: ${grown.join(', ') || 'none'}; widened: ${widened.join(', ') || 'none'}). ` +
          `Later packages may never add a pair — flag the growth in the PR body and re-run with PARITY_ALLOWLIST_GROWTH=1.`,
      )
    }
  }
  return errors
}
