#!/bin/bash

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Vehicle Master Başlatılıyor...${NC}"

# Backend'i Arka Planda Başlat
echo -e "${BLUE}📦 Backend (FastAPI) hazırlanıyor...${NC}"
source ./venv/bin/activate
./venv/bin/uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Backend'in ayağa kalkması için kısa bir süre bekle
sleep 3

# Frontend'i Başlat
echo -e "${BLUE}🎨 Frontend (Next.js) başlatılıyor...${NC}"
cd frontend
npm run dev

# Frontend durdurulduğunda (Ctrl+C yapıldığında) Backend'i de kapat
kill $BACKEND_PID
echo -e "${GREEN}👋 Uygulama kapatıldı.${NC}"
