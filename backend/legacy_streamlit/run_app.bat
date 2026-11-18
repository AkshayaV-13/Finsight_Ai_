@echo off
title FinSight AI — Streamlit Legacy Runner
cd /d "%~dp0"
set PYTHONUTF8=1
echo Starting FinSight AI Streamlit on http://localhost:8501 ...
python -m streamlit run app.py --server.port 8501
pause
