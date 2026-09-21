#!/usr/bin/env bash
# Sinh baseline chromium-linux cho tests/e2e/visual.spec.ts qua Playwright Docker image.
# Dùng khi có Docker local; không muốn chờ CI workflow_dispatch.
#
# Yêu cầu: Docker (Desktop hoặc engine). Chạy từ root repo.
# Cách chạy: bash scripts/gen-linux-baselines.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLAYWRIGHT_VERSION="$(node -p "require('./package.json').devDependencies['@playwright/test'].replace(/^[\\^~]/, '')")"
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"

echo "Repo:  ${REPO_ROOT}"
echo "Image: ${IMAGE}"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker chưa cài. Cài Docker Desktop rồi thử lại." >&2
  exit 1
fi

docker run --rm -it \
  -v "${REPO_ROOT}:/work" \
  -w /work \
  -e CI="" \
  "${IMAGE}" \
  bash -lc "
    corepack enable pnpm &&
    pnpm install --frozen-lockfile &&
    pnpm exec playwright test tests/e2e/visual.spec.ts --update-snapshots
  "

echo
echo "Done. Kiểm tra tests/e2e/visual.spec.ts-snapshots/ và commit *-chromium-linux.png."
