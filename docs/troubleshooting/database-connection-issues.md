# 🔧 Troubleshooting: Database Connection Issues

## Problema: "User denied access" después de actualizar macOS/Docker

### **Síntomas**

```
Error: P1010: User `postgres` was denied access on the database `postgres.public`
```

o

```
Error: hex string expected, got undefined
```

### **Causa**

PostgreSQL local instalado con Homebrew está ocupando el puerto 5432, impidiendo que Docker lo use.

### **Solución Rápida**

```bash
# 1. Detener PostgreSQL local
brew services stop postgresql@14

# 2. Verificar que Docker PostgreSQL está corriendo
docker-compose ps

# 3. Recrear base de datos si es necesario
docker-compose down -v
docker-compose up -d

# 4. Sincronizar schema
npm run db:push

# 5. Crear usuario admin
npm run create-super-admin
```

### **Solución Permanente**

#### **Opción 1: Desactivar PostgreSQL local permanentemente**

```bash
brew services stop postgresql@14
brew services disable postgresql@14
```

#### **Opción 2: Cambiar puerto de Docker**

**1. Editar `docker-compose.yml`:**

```yaml
services:
  db:
    ports:
      - "5433:5432" # Usar 5433 en el host
```

**2. Actualizar `.env`:**

```bash
DATABASE_URL="postgresql://nextjs_user:nextjs_password@localhost:5433/nextjs_boilerplate"
```

**3. Reiniciar:**

```bash
docker-compose down
docker-compose up -d
npm run db:push
```

### **Verificación Post-Actualización**

Después de actualizar macOS o Docker, ejecuta este checklist:

```bash
# ✅ 1. Verificar servicios de PostgreSQL
brew services list | grep postgres

# ✅ 2. Verificar puerto 5432 está libre
lsof -i :5432

# ✅ 3. Verificar conexión a Docker
docker-compose exec db psql -U nextjs_user -d nextjs_boilerplate -c "SELECT version();"

# ✅ 4. Verificar tablas
docker-compose exec db psql -U nextjs_user -d nextjs_boilerplate -c "\dt"

# ✅ 5. Verificar variables de entorno
cat .env | grep -E "DATABASE_URL|BETTER_AUTH_SECRET"

# ✅ 6. Test de conexión desde la app
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Admin123!"}'
```

### **Script de Diagnóstico Automático**

Crea este archivo: `scripts/diagnose-db.sh`

```bash
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
  docker-compose exec -T db psql -U nextjs_user -d nextjs_boilerplate -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs echo "  Tablas:"
else
  echo "  ❌ Error de conexión"
fi
```

**Uso:**

```bash
chmod +x scripts/diagnose-db.sh
./scripts/diagnose-db.sh
```

### **Prevención en Scripts de Setup**

Agrega al `package.json`:

```json
{
  "scripts": {
    "setup": "npm run setup:check && npm run setup:db && npm run setup:seed",
    "setup:check": "bash scripts/diagnose-db.sh",
    "setup:db": "docker-compose up -d && sleep 5 && npm run db:push",
    "setup:seed": "npm run create-super-admin"
  }
}
```

### **Errores Comunes y Soluciones**

#### Error: "Connection refused"

```bash
# PostgreSQL no está corriendo
docker-compose up -d
```

#### Error: "Role does not exist"

```bash
# Usuario no configurado correctamente
docker-compose down -v
docker-compose up -d
npm run db:push
```

#### Error: "Table does not exist"

```bash
# Schema no sincronizado
npm run db:push
# o con migraciones
npm run db:migrate
```

#### Error: "BETTER_AUTH_SECRET undefined"

```bash
# Regenerar secret
echo "BETTER_AUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env
# Reiniciar servidor
npm run dev
```

### **Mejores Prácticas**

1. **Usar Docker exclusivamente para desarrollo**

   - No instalar PostgreSQL local si usas Docker
   - Si lo necesitas, usar puertos diferentes

2. **Verificar antes de iniciar**

   ```bash
   npm run setup:check
   ```

3. **Documentar configuración local**

   - Mantener `.env.example` actualizado
   - Documentar cambios de puertos

4. **Backups regulares**

   ```bash
   # Backup
   docker-compose exec db pg_dump -U nextjs_user nextjs_boilerplate > backup.sql

   # Restore
   docker-compose exec -T db psql -U nextjs_user nextjs_boilerplate < backup.sql
   ```

5. **Automatizar con Git Hooks**
   ```bash
   # .husky/post-merge
   #!/bin/sh
   if [ -f docker-compose.yml ]; then
     echo "🔄 Verificando base de datos..."
     npm run setup:check
   fi
   ```

---

## Resumen

| Problema             | Causa                                     | Solución                                      |
| -------------------- | ----------------------------------------- | --------------------------------------------- |
| User denied access   | PostgreSQL local en puerto 5432           | `brew services stop postgresql@14`            |
| hex string undefined | Falta `BETTER_AUTH_SECRET` en auth config | Agregar `secret` y `baseURL` a `betterAuth()` |
| Table does not exist | Schema no sincronizado                    | `npm run db:push`                             |
| Connection refused   | Docker no corriendo                       | `docker-compose up -d`                        |

**Comando de emergencia:**

```bash
brew services stop postgresql@14 && docker-compose down -v && docker-compose up -d && sleep 5 && npm run db:push && npm run create-super-admin
```

