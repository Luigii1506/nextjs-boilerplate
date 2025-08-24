# Módulo: @your-org/file-upload

## 📦 Descripción
Módulo de subida de archivos para aplicaciones Next.js con soporte para múltiples proveedores de almacenamiento.

## 🚀 Características Principales
- Subida de archivos con progreso
- Soporte para múltiples proveedores (Local, S3, Cloudinary)
- Validación de tipos y tamaños
- Integración con Prisma para metadatos
- Componentes React listos para usar
- Server Actions para manejo en el servidor

## 🛠 Instalación

### Requisitos Previos
- Node.js 18+
- Next.js 14+
- Prisma
- Cuenta en el proveedor de almacenamiento (opcional)

### Instalación del Paquete

```bash
# Usando pnpm (recomendado)
pnpm add @your-org/file-upload

# Usando npm
npm install @your-org/file-upload

# Usando yarn
yarn add @your-org/file-upload
```

## 🔧 Configuración

### 1. Configuración de Next.js

Añade la configuración del módulo a tu `next.config.js`:

```javascript
const { withFileUpload } = require('@your-org/file-upload/next-config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otras configuraciones de Next.js
};

module.exports = withFileUpload(nextConfig, {
  // Configuración del módulo
  provider: 'local', // 'local' | 's3' | 'cloudinary'
  maxFileSize: '5MB',
  allowedMimeTypes: ['image/*', 'application/pdf'],
  
  // Configuración específica del proveedor
  local: {
    uploadDir: './public/uploads',
    publicPath: '/uploads',
  },
  
  // Para S3
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
  },
  
  // Para Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
});
```

### 2. Configuración de Prisma

Añade los modelos de Prisma a tu esquema:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Importar esquemas del módulo
import "@your-org/file-upload/prisma"
```

Ejecuta las migraciones:

```bash
npx prisma migrate dev --name add_file_upload
```

## 🎯 Uso

### Componente de Subida

```tsx
'use client';

import { FileUpload } from '@your-org/file-upload/client';

export default function UploadPage() {
  const handleUploadComplete = (files) => {
    console.log('Archivos subidos:', files);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Subir Archivos</h1>
      <FileUpload
        onUploadComplete={handleUploadComplete}
        maxSize={5 * 1024 * 1024} // 5MB
        accept="image/*,.pdf"
        multiple
      />
    </div>
  );
}
```

### Server Actions

```typescript
// app/api/upload/route.ts
import { uploadFile } from '@your-org/file-upload/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = {
      uploadedBy: 'user123',
      tags: ['documento', 'importante'],
    };

    const result = await uploadFile({
      file,
      isPublic: true,
      metadata,
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## 🔍 API

### Componentes

#### `FileUpload`

Propiedad | Tipo | Requerido | Por defecto | Descripción
---------|------|-----------|-------------|------------
onUploadComplete | `(files: FileUploadResult[]) => void` | Sí | - | Callback que se ejecuta cuando la subida se completa
maxSize | `number` | No | `5 * 1024 * 1024` (5MB) | Tamaño máximo del archivo en bytes
accept | `string` | No | `*/*` | Tipos MIME aceptados (ej: 'image/*, .pdf')
multiple | `boolean` | No | `false` | Permitir múltiples archivos
maxFiles | `number` | No | `10` | Número máximo de archivos (solo si multiple=true)
disabled | `boolean` | No | `false` | Deshabilitar la subida
className | `string` | No | - | Clases CSS adicionales

### Hooks

#### `useFileUpload`

```typescript
const { 
  upload, 
  progress, 
  isUploading, 
  error 
} = useFileUpload({
  onSuccess: (result) => console.log('Subido:', result),
  onError: (error) => console.error('Error:', error),
});

// Uso:
const handleUpload = async (file: File) => {
  await upload({
    file,
    isPublic: true,
    metadata: { userId: '123' },
  });
};
```

## 🛡️ Seguridad

### Validaciones
- Tamaño máximo de archivo
- Tipos MIME permitidos
- Sanitización de nombres de archivo
- Verificación de autenticación (opcional)

### Permisos

El módulo verifica los siguientes permisos:
- `file:upload` - Permite subir archivos
- `file:delete` - Permite eliminar archivos
- `file:view` - Permite ver archivos

## 📊 Métricas

El módulo registra las siguientes métricas:
- `file_upload_success` - Subida exitosa
- `file_upload_error` - Error en la subida
- `file_download` - Descarga de archivo
- `file_delete` - Eliminación de archivo

## 🧪 Testing

### Pruebas Unitarias

```bash
# Ejecutar pruebas
pnpm test

# Ejecutar pruebas en modo watch
pnpm test:watch
```

### Pruebas de Integración

```bash
# Ejecutar pruebas de integración
pnpm test:integration
```

## 🚀 Despliegue

### Variables de Entorno Requeridas

```env
# Para S3
S3_ACCESS_KEY=tu_access_key
S3_SECRET_KEY=tu_secret_key
S3_REGION=tu_region
S3_BUCKET=tu_bucket

# Para Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Migraciones

```bash
# Crear migración
npx prisma migrate dev --name add_file_upload

# Aplicar migraciones en producción
npx prisma migrate deploy
```

## 📝 Changelog

### v0.1.0 (2025-03-15)
- Versión inicial
- Soporte para subida local de archivos
- Componente React básico
- Server Actions para manejo en el servidor

## 📄 Licencia

MIT

## 👥 Contribución

1. Haz fork del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📧 Soporte

Para soporte, por favor abre un issue en el repositorio o contacta a soporte@tudominio.com.
