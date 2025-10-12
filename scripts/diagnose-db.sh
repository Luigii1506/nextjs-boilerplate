#!/bin/bash

echo "🔍 Diagnóstico de Base de Datos"
echo "================================"
echo ""

# Check PostgreSQL local
echo "📊 PostgreSQL Local:"
brew services list | grep postgres || echo "  ✅ No PostgreSQL local encontrado"
echo ""

# Check puerto 5432
echo "🔌 Puerto 5432:"
if lsof -i :5432 > /dev/null 2>&1; then
  echo "  ⚠️  Puerto 5432 está en uso:"
  lsof -i :5432 | grep LISTEN
else
  echo "  ✅ Puerto 5432 libre"
fi
echo ""

# Check Docker
echo "🐳 Docker PostgreSQL:"
docker-compose ps db | grep -q "Up" && echo "  ✅ Corriendo" || echo "  ❌ No está corriendo"
echo ""

# Check .env
echo "📝 Variables de Entorno:"
if [ -f .env ]; then
  grep -q "DATABASE_URL" .env && echo "  ✅ DATABASE_URL configurado" || echo "  ❌ DATABASE_URL falta"
  grep -q "BETTER_AUTH_SECRET" .env && echo "  ✅ BETTER_AUTH_SECRET configurado" || echo "  ❌ BETTER_AUTH_SECRET falta"
else
  echo "  ❌ Archivo .env no existe"
fi
echo ""

# Check conexión
echo "🔗 Test de Conexión:"
if docker-compose exec -T db psql -U nextjs_user -d nextjs_boilerplate -c "SELECT 1;" > /dev/null 2>&1; then
  echo "  ✅ Conexión exitosa"
  echo ""
  echo "📊 Tablas en BD:"
  TABLES_COUNT=$(docker-compose exec -T db psql -U nextjs_user -d nextjs_boilerplate -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
  echo "  Total: $TABLES_COUNT tablas"
  echo ""
  echo "👥 Usuarios:"
  USERS_COUNT=$(docker-compose exec -T db psql -U nextjs_user -d nextjs_boilerplate -t -c "SELECT COUNT(*) FROM \"user\";" | xargs)
  echo "  Total: $USERS_COUNT usuarios"
else
  echo "  ❌ Error de conexión"
fi


