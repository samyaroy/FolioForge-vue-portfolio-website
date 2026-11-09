#!/bin/bash
# toggle_branch.sh
# Usage:
#   ./toggle_branch.sh switch V1     -> switch to V1 locally
#   ./toggle_branch.sh switch V2     -> switch to V2 locally
#   ./toggle_branch.sh build         -> build from main
#
# Deployment is not handled here: see the Deployment section of README.md.

set -e

function switch_branch() {
    local branch=$1
    echo "Switching to branch $branch..."
    git fetch origin
    git checkout $branch
}

function build_project() {
    echo "Building from main..."
    git checkout main
    # Replace with your actual build command
    npm run build || echo "⚠️ Replace with correct build command"
}

case "$1" in
    switch)
        switch_branch $2
        ;;
    build)
        build_project
        ;;
    *)
        echo "Usage:"
        echo "  $0 switch V1|V2        -> switch branch"
        echo "  $0 build               -> build from main"
        ;;
esac