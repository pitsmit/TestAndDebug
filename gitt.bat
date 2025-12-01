@echo off
if "%1"=="" (
    echo Usage: git-quick "Your commit message"
    echo Example: git-quick "Fixed bug in login feature"
    exit /b 1
)

echo Adding all changes...
git add .

echo Committing with message: %1
git commit -m "%1"

echo Pushing to origin main...
git push origin main

echo Done!