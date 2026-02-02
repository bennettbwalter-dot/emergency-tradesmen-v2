@echo off
REM Daily Gap Fill Runner
REM This script runs the Yelp API gap filler

cd /d "C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen"
python scripts\fill_gaps_yelp_api.py >> logs\daily_gap_fill.log 2>&1
