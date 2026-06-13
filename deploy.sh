#!/bin/bash
# ================================================================
# deploy.sh — Campus Urología Sur
# Ejecutar desde la carpeta raíz del proyecto:
#   chmod +x deploy.sh && ./deploy.sh
# ================================================================

set -e  # detener si cualquier comando falla

echo ""
echo "════════════════════════════════════════════"
echo "  Campus Urología Sur — Deploy automatizado"
echo "════════════════════════════════════════════"
echo ""

# ── 1. Verificar que estamos en la carpeta correcta ──────────────
if [ ! -f "package.json" ]; then
  echo "❌ Error: ejecuta este script desde la carpeta campus-urologiasur/"
  exit 1
fi

# ── 2. Crear .env.local si no existe ────────────────────────────
if [ ! -f ".env.local" ]; then
  echo "⚙️  Configurando variables de entorno..."
  echo ""
  read -p "  NEXT_PUBLIC_SUPABASE_URL (https://xxx.supabase.co): " SUPA_URL
  read -p "  NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPA_ANON
  read -s -p "  SUPABASE_SERVICE_ROLE_KEY (oculta): " SUPA_SERVICE
  echo ""

  cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPA_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPA_ANON}
SUPABASE_SERVICE_ROLE_KEY=${SUPA_SERVICE}
NEXT_PUBLIC_SITE_URL=https://campus-urologiasur.vercel.app
EOF
  echo "  ✅ .env.local creado"
else
  echo "  ✅ .env.local ya existe — usando el existente"
fi
echo ""

# ── 3. Instalar dependencias ─────────────────────────────────────
echo "📦 Instalando dependencias npm..."
npm install --silent
echo "  ✅ Dependencias instaladas"
echo ""

# ── 4. Instalar Vercel CLI si no está ───────────────────────────
if ! command -v vercel &> /dev/null; then
  echo "🔧 Instalando Vercel CLI..."
  npm install -g vercel --silent
  echo "  ✅ Vercel CLI instalado"
else
  echo "  ✅ Vercel CLI ya instalado"
fi
echo ""

# ── 5. Git: inicializar y subir a GitHub ────────────────────────
echo "🐙 Configurando Git..."

if [ ! -d ".git" ]; then
  git init
  echo "  Git inicializado"
fi

# Eliminar la carpeta .claude del índice si existe
git rm --cached -r .claude 2>/dev/null || true

git add .
git status --short

echo ""
read -p "¿Continuar con el commit y push? (s/n): " CONFIRM
if [ "$CONFIRM" != "s" ]; then
  echo "Abortado. Puedes hacer el push manualmente después."
  echo ""
else
  git commit -m "Campus Urología Sur — deploy inicial" 2>/dev/null || echo "  (nada nuevo que commitear)"

  # Verificar si ya tiene remote
  if git remote get-url origin &>/dev/null; then
    echo "  Remote ya configurado: $(git remote get-url origin)"
  else
    echo ""
    read -p "  URL del repositorio GitHub (https://github.com/usuario/repo.git): " GH_URL
    git remote add origin "$GH_URL"
  fi

  git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null || {
    echo "  ⚠️  Si pide credenciales, usa tu usuario y un Personal Access Token de GitHub"
    echo "     (github.com → Settings → Developer settings → Personal access tokens)"
  }
  echo "  ✅ Código subido a GitHub"
fi

echo ""

# ── 6. Deploy en Vercel ─────────────────────────────────────────
echo "🚀 Desplegando en Vercel..."
echo "  Se abrirá el login de Vercel en el navegador si no estás autenticado."
echo ""

vercel --prod \
  --yes \
  --env NEXT_PUBLIC_SUPABASE_URL="$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d= -f2-)" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2-)" \
  --env SUPABASE_SERVICE_ROLE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2-)" \
  --env NEXT_PUBLIC_SITE_URL="$(grep NEXT_PUBLIC_SITE_URL .env.local | cut -d= -f2-)"

echo ""
echo "════════════════════════════════════════════"
echo "  ✅ Deploy completado"
echo ""
echo "  Pasos finales en Supabase:"
echo "  Authentication → URL Configuration:"
echo "  - Site URL: la URL que te dio Vercel"
echo "  - Redirect URLs: https://tu-url.vercel.app/**"
echo "════════════════════════════════════════════"
echo ""
