#!/usr/bin/env bash
# Run on the VM after the first-time setup (see deploy/README.md) whenever
# new backend code has been pushed to GitHub.
set -euo pipefail

cd "$(dirname "$0")/.."   # backend/
git pull
source myenv/bin/activate
pip install -r requirements.txt
sudo systemctl restart dhiman-backend
sudo systemctl status dhiman-backend --no-pager
