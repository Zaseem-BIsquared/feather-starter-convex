#!/usr/bin/env bash
set -euo pipefail

# TODO: The .git history is kept intact so the project can pull upstream
# starter updates in the future. Once an upstream sync strategy is finalized
# (e.g. git remote add upstream + rebase workflow), document it here.

REPO_URL="https://github.com/siraj-samsudeen/feather-starter-convex.git"

usage() {
  echo "Usage: bash <(curl -s ...) <project-name>"
  echo ""
  echo "Creates a new project from the Feather Starter template."
  echo ""
  echo "Example:"
  echo "  bash <(curl -s https://raw.githubusercontent.com/siraj-samsudeen/feather-starter-convex/main/scripts/create.sh) my-app"
}

if [ $# -lt 1 ]; then
  echo "Error: Project name is required."
  echo ""
  usage
  exit 1
fi

PROJECT_DIR="$1"

if [ -d "$PROJECT_DIR" ]; then
  echo "Error: Directory '$PROJECT_DIR' already exists."
  exit 1
fi

echo ""
echo "🪶 Creating project '$PROJECT_DIR' from Feather Starter..."
echo ""

# Clone
echo "📦 Cloning repository..."
git clone "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm install

# Run interactive setup
echo ""
npm run setup

echo ""
echo "────────────────────────────────────────"
echo ""
echo "  Next steps:"
echo ""
echo "    cd $PROJECT_DIR"
echo "    npm start"
echo ""
echo "────────────────────────────────────────"
echo ""
