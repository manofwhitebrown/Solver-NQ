#!/usr/bin/env bash
# Usage: GITHUB_TOKEN=... bash scripts/ci-status.sh [N runs, default 6]
# Lists recent CI runs; for failed runs prints the failing step + annotation text. Never prints the token.
set -u
R=manofwhitebrown/Solver-NQ; N=${1:-6}
[ -z "${GITHUB_TOKEN:-}" ] && { echo "Set GITHUB_TOKEN first"; exit 1; }
api(){ curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$R/$1"; }
api "actions/runs?per_page=$N" | python3 -c '
import sys,json
for r in json.load(sys.stdin).get("workflow_runs",[]):
    print(r["id"],"|",r["name"],"|",r["head_sha"][:7],"|",r["status"],"|",r["conclusion"] or "-")
' | while IFS= read -r line; do
  echo "$line"
  case "$line" in *"| failure"*)
    id=${line%% *}
    api "actions/runs/$id/jobs" | python3 -c '
import sys,json
for j in json.load(sys.stdin).get("jobs",[]):
    for s in j["steps"]:
        if s["conclusion"]=="failure": print(j["id"],s["name"])
' | while read -r jid step; do
      echo "  FAILED STEP: $step"
      api "check-runs/$jid/annotations" | python3 -c '
import sys,json
for a in json.load(sys.stdin): print("   >",a.get("title",""),"-",a.get("message","")[:3500])
'
    done;;
  esac
done
