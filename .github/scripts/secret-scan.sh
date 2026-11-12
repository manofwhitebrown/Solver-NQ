#!/usr/bin/env bash
# Fails if tracked files contain key-like patterns or keystore files.
set -u
PATTERNS='github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}'
fail=0
# List only file:line (never the matching text) so a leaked secret is not printed into CI logs.
hits=$(git grep -nIE "$PATTERNS" -- . ':!.github/scripts/secret-scan.sh' ':!package-lock.json' ':!public/tesseract' | cut -d: -f1,2)
if [ -n "$hits" ]; then
  echo "Secret-like text found at:"; echo "$hits"; fail=1
fi
keys=$(git ls-files | grep -Ei '\.(jks|keystore|p12)$' || true)
if [ -n "$keys" ]; then
  echo "Keystore file is tracked:"; echo "$keys"; fail=1
fi
[ "$fail" = 0 ] && echo "secret-scan: clean"
exit $fail
