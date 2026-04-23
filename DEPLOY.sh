#!/bin/bash
# Script de deploy completo para Boda Caro & Luis
# Ejecutar: bash DEPLOY.sh <VERCEL_TOKEN> <GITHUB_TOKEN>

VERCEL_TOKEN=${1:-""}
GITHUB_TOKEN=${2:-""}
TEAM_ID="team_wcWwUYscji36l8eu8Ev1x8Kk"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Falta el token de Vercel. Obtenerlo en: https://vercel.com/account/tokens"
  echo "Uso: bash DEPLOY.sh <VERCEL_TOKEN> [GITHUB_TOKEN]"
  exit 1
fi

echo "🚀 Iniciando deploy de Boda Caro & Luis..."

# 1. Crear proyecto en Vercel
echo "📦 Creando proyecto en Vercel..."
PROJECT_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v9/projects" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"boda-caro-luis\",\"framework\":\"vite\",\"buildCommand\":\"npm run build\",\"outputDirectory\":\"dist\"}" \
  -G --data-urlencode "teamId=$TEAM_ID")

PROJECT_ID=$(echo $PROJECT_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
  # Proyecto quizás ya existe, intentar obtenerlo
  PROJECT_RESPONSE=$(curl -s "https://api.vercel.com/v9/projects/boda-caro-luis?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN")
  PROJECT_ID=$(echo $PROJECT_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)
fi

echo "  Project ID: $PROJECT_ID"

# 2. Agregar env vars
echo "🔐 Configurando variables de entorno..."
for KEY_VAL in \
  "VITE_SUPABASE_URL|https://lqlvwlpbzznfvjuyrtpq.supabase.co" \
  "VITE_SUPABASE_ANON_KEY|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxbHZ3bHBienpuZnZqdXlydHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjk5OTUsImV4cCI6MjA5MjMwNTk5NX0.xYiXUypf7-yaOeQwFXk2dD28XNscOF71FrCbcYUM1wE" \
  "VITE_APP_PASSWORD|bodacaroluis2026"; do
  KEY=$(echo $KEY_VAL | cut -d'|' -f1)
  VAL=$(echo $KEY_VAL | cut -d'|' -f2)
  curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$KEY\",\"value\":\"$VAL\",\"type\":\"plain\",\"target\":[\"production\",\"preview\",\"development\"]}" > /dev/null
  echo "  ✓ $KEY"
done

# 3. Build
echo "🔨 Compilando..."
npm run build

# 4. Deploy via Vercel CLI
echo "🌐 Desplegando..."
VERCEL_TOKEN=$VERCEL_TOKEN npx vercel deploy --prod \
  --token $VERCEL_TOKEN \
  --scope $TEAM_ID \
  --yes 2>&1

echo ""
echo "✅ Deploy completado"
echo "🌐 URL: https://boda-caro-luis.vercel.app"
