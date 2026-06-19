```
# FUNDECODES Digital — Frontend

Plataforma digital de FUNDECODES, desarrollada con Next.js 14 (App Router) y Tailwind CSS. Incluye un portal público informativo y un panel de administración interno.

## Requisitos previos

- Node.js v18 o superior
- npm v9 o superior
- Backend de FUNDECODES corriendo (ver repositorio backend)

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Instalación

```bash
npm install
```

## Ejecutar el proyecto

```bash
# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm run start
```

La aplicación quedará disponible en `http://localhost:3000`.

## Estructura del proyecto

```
src/
├── app/
│   ├── landing/           # Portal público informativo
│   ├── admin/             # Panel administrativo
│   │   ├── page.tsx       # Dashboard con módulos
│   │   ├── voluntariado/  # Gestión de voluntarios y sanciones
│   │   ├── Collaborators/ # Colaboradores y asignaciones
│   │   ├── projects/      # Áreas, proyectos y programas
│   │   ├── accounting/    # Contabilidad y cuentas
│   │   ├── BillingRequest/# Solicitudes y facturación
│   │   ├── visitacion/    # Registro de visitas
│   │   ├── auditoria/     # Auditoría del sistema
│   │   ├── recapitulacion/# Reportes y métricas
│   │   ├── manuales/      # Manuales del sistema
│   │   ├── comments/      # Moderación de comentarios
│   │   ├── respuestas-formulario/ # Respuestas de formularios públicos
│   ├── login/             # Inicio de sesión
│   └── PagInfo/           # Formularios públicos (contacto, voluntariado)
├── services/              # Servicios de conexión con la API
├── lib/                   # Utilidades (autenticación, JWT)
└── components/            # Componentes reutilizables
public/
├── Img/                   # Imágenes del sistema
├── videos/                # Videos del portal público
└── manuales/              # Manuales en PDF
    ├── manual-externo.pdf
    ├── manual-interno.pdf
    └── manual-despliegue.pdf
```

## Roles de usuario

| Rol | Acceso |
|---|---|
| `admin` | Acceso completo a todos los módulos |
| `colaboradorfactura` | Solicitudes y facturación (solo destinos asignados) |
| `colaboradorvoluntariado` | Módulo de voluntariado |
| `colaboradorproyecto` | Módulo de proyectos |
| `colaboradorcontabilidad` | Contabilidad y facturación |
| `colaboradorvisitacion` | Registro de visitaciones |
| `voluntario` | Acceso básico al panel |

## Equipo

Proyecto desarrollado para FUNDECODES — Universidad Nacional de Costa Rica, Sede Regional Chorotega, Campus Nicoya.
```
