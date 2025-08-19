#!/bin/bash
# toggle_branch.sh
# Usage:
#   ./toggle_branch.sh set-main V1   -> make V1 the new main
#   ./toggle_branch.sh set-main V2   -> make V2 the new main
#   ./toggle_branch.sh switch V1     -> switch to V1 locally
#   ./toggle_branch.sh switch V2     -> switch to V2 locally
#   ./toggle_branch.sh build         -> build from main
#   ./toggle_branch.sh deploy        -> deploy from main

set -e

function switch_branch() {
    local branch=$1
    echo "Switching to branch $branch..."
    git fetch origin
    git checkout $branch
}

function set_main() {
    local branch=$1
    echo "Setting $branch as main..."

    # Ensure branch exists locally
    git fetch origin
    git checkout $branch

    # Rename current branch to main (locally)
    git branch -M main

    # Push and set upstream
    git push -u origin main --force

    echo "✅ Branch $branch is now main."
}

function build_project() {
    echo "Building from main..."
    git checkout main
    # Replace with your actual build command
    npm run build || echo "⚠️ Replace with correct build command"
}

function deploy_project() {
    echo "Deploying from main..."
    git checkout main
    # Replace with your actual deploy command
    npm run deploy || echo "⚠️ Replace with correct deploy command"
}

case "$1" in
    switch)
        switch_branch $2
        ;;
    set-main)
        set_main $2
        ;;
    build)
        build_project
        ;;
    deploy)
        deploy_project
        ;;
    *)
        echo "Usage:"
        echo "  $0 switch V1|V2        -> switch branch"
        echo "  $0 set-main V1|V2      -> set main branch"
        echo "  $0 build               -> build from main"
        echo "  $0 deploy              -> deploy from main"
        ;;
esac