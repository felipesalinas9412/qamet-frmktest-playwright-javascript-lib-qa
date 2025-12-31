# Playwright API Testing (JS) — Puerto Rico

Framework de **pruebas de APIs con Playwright** escrito en **JavaScript (CommonJS)**.  
Incluye validación de **JSON Schemas** (Ajv), utilidades para **reportes Allure** y estructura modular para múltiples APIs (p1 / p2).

> **Tecnologías**: JavaScript (Node.js), Playwright Test, Ajv, Allure, dotenv.

---

## 🧰 Requisitos previos

1. **Node.js** 18+ (recomendado LTS).  
   - Verifica: `node -v` y `npm -v`

2. **Git** (para clonar el repo).  
   - Verifica: `git --version`

3. **Allure** (opcional para reportes avanzados):  
   - Usamos el paquete `allure-commandline` (se instala con `npm i`).  
   - En algunos entornos puede requerir **Java 8+** si utilizas un binario externo de Allure.

> Si tu empresa usa **VPN/Proxy**, conéctate antes de ejecutar pruebas.

---

## 📦 Instalación del proyecto

```bash
# 1) Clonar el repositorio
git clone <URL-DEL-REPO>
cd 

# 2) Instalar dependencias
npm install
```

Dependencias principales (se instalan con el paso anterior):

- **@playwright/test** — motor de pruebas
- **dotenv** — manejo de variables de entorno
- **ajv / ajv-formats** — validación de esquemas JSON
- **allure-playwright / allure-commandline** — reportes Allure
- **cross-env / module-alias** — utilidades

Instalación manual (si lo necesitas por separado):

```bash
npm i -D @playwright/test allure-playwright allure-commandline cross-env dotenv module-alias
npm i ajv ajv-formats
```

---

## ⚙️ Configuración (.env)

Crea un archivo **`.env`** en la raíz del proyecto (al lado de `package.json`) con este contenido de ejemplo:

```env
# API p1 (DRP)
P1_BASE_URL=https://preprod.mapfrepr.com/MPRPACIssuanceIntegrationAPI/api/v1

# API p2 (Eligibility / Health)
P2_BASE_URL=https://preprod.mapfrehealth.com/HealthElegibilityRestServices/api/v1

# Parámetros dinámicos de pruebas (p2)
P2_GROUP_REG_ID=1
P2_FROM_DATE=2025-07-14
P2_THRU_DATE=2025-08-13
P2_UPDATED_BY=jcolonc
```

> Si cambias entornos (preprod/prod), **solo actualiza estas URLs/valores**.

---

## 🧱 Estructura del proyecto

```
playwright-refactor-optionA/
├─ data/                               # Cuerpos (payloads) de requests en JSON
│  
├─ schemas/                            # JSON Schemas para validar respuestas
│  
├─ src/
│  ├─ api/
│  │  ├─ client.js                     # Crea el APIRequestContext según api='p1' | 'p2'
│  │  └─ endpoints.js                  # Rutas relativas por API (p1/p2)
│  └─ utils/
│     ├─ reportUtils.js                # Allure: metadatos y adjuntos
│     ├─ schema-validator.js           # Ajv: validación contra schema
│     └─ validateResponse.js           # Asserts comunes (200, array/obj, schema, headers)
├─ tests/
│     
├─ playwright.config.js                # Config Playwright (reporters, use, etc.)
├─ package.json
└─ .env                                # Variables de entorno
```

---

## ▶️ Cómo ejecutar

### 1) Todos los tests
```bash
npx playwright test
```

### 2) Un archivo de tests
```bash
npx playwright test tests/drp/catalogos/HealthCheckCatalogos.test.js
npx playwright test tests/drp/cuadreGeneral/HealthCheckCuadreGeneral.test.js
npx playwright test tests/drp/vistas/HealthCheckCuadroMando.test.js
npx playwright test tests/drp/lobClasif/HealthCheckLobClasif.test.js
npx playwright test tests/drp/prerenovDetail/HealthCheckPrerenovDetail.test.js
npx playwright test tests/drp/prerenovHeader/HealthCheckPrerenovHeader.test.js

npx playwright test tests/eligibility/group-registration/HealthCheckGroupRegistration.test.js

npx playwright test tests/storage/
npx playwright test tests/storage/groupPolicy/GroupPolicyCheck.test.js
npx playwright test tests/storage/insurance/InsurancePolicyCheck.test.js
```

### 3) Filtrar por nombre del test
```bash
npx playwright test -g "GetCompanias"
```

### 4) Cambiar entorno por variable (si tuvieras varios `.env`)
```bash
npm run test:env
```

> **Importante**: la mayoría de tests usan `createAPIClient({ api: 'p1' | 'p2' })`. Si ves `baseURL no definido para api=...`, revisa tu `.env`.

---

## 📑 Reportes

### Reporte Allure
Generar:
```bash
npm run report:allure:generate
```
Abrir con servidor local:
```bash
npm run report:allure:open
# Muestra: "Server started at http://127.0.0.1:<puerto>"
```

> Si quieres abrir el reporte **sin** levantar servidor, puedes usar:
>
> ```bash
> npx allure open allure-report --single-file
> ```
>
> Para facilitarlo, agrega este script en `package.json`:
> ```json
> "report:allure:open-file": "npx allure open allure-report --single-file"
> ```

---

## 🧪 Patrón de tests y validaciones

Los tests siguen un patrón común:

- Crear cliente HTTP según API destino (`p1`/`p2`):  
  `api = await createAPIClient({ api: 'p1', auth: false });`
- Llamar endpoint desde `src/api/endpoints.js`.
- Validar **Status 200** y **estructura de respuesta** con `Ajv`:
  - Para **arrays**: `validateCommonApiResponse(res, schema)`
  - Para **objetos**: `validateCommonApiObjectResponse(res, schema)`
- Adjuntar logs a Allure con `attachLogs`.
- (Opcional) Cargar **payload** desde `data/*.json` para `POST/PUT`.

### Utilidades de validación

```js
// src/utils/validateResponse.js
- validateCommonApiResponse(res, schema)         // Espera Array
- validateCommonApiObjectResponse(res, schema)   // Espera Objeto
// Adicionalmente valida Headers básicos (Content-Type) y ejecuta validador Ajv.
```

---

## ➕ Añadir un nuevo endpoint/test

1. **Define la ruta** en `src/api/endpoints.js` dentro del bloque `p1` o `p2`:
   ```js
   p1: {
     baseURL: process.env.P1_BASE_URL,
     myService: { getFoo: '/MyService/GetFoo' }
   }
   ```

2. **Crea el schema** en `schemas/.../*.schema.json`.

3. **Escribe el test** en `tests/**`:
   ```js
   const schema = require('@schemas/tu/ruta/mi.schema.json');
   test('GET /MyService/GetFoo - Validar...', async () => {
     const res = await api.get(endpoints.p1.myService.getFoo);
     await validateCommonApiResponse(res, schema);
   });
   ```

4. **(Opcional)** si es `POST/PUT`, guarda el **payload** en `data/**.json` y cárgalo con `fs.readFile`.

---

## 🧩 Scripts disponibles

```json
{
  "scripts": {
    "test": "npx playwright test",
    "test:env": "cross-env NODE_ENV=test npx playwright test",
    "report": "npx playwright show-report --port=9330",
    "report:html": "npx playwright show-report",
    "report:allure:generate": "allure generate allure-results --clean -o allure-report",
    "report:allure:open": "npx allure open allure-report"
    // "report:allure:open-file": "npx allure open allure-report --single-file"  // (opcional)
  }
}
```

---

## 🧯 Solución de problemas comunes

- **`baseURL no definido para api=p1`**  
  Faltan URLs en `.env`. Asegúrate de tener:
  ```env
  P1_BASE_URL=...
  P2_BASE_URL=...
  ```

- **`getaddrinfo ENOTFOUND preprod.mapfrepr.com`** o `preprod.mapfrehealth.com`  
  No hay acceso DNS/red. Conéctate a **VPN corporativa** o verifica proxy/firewall.

- **`Cannot find module 'dotenv'`**  
  Instala dependencias: `npm install`. Si persiste: `npm i -D dotenv`.

- **`ENOENT ... post-*.json`**  
  El archivo en `data/` no existe o la ruta es incorrecta. Revisa nombres y carpetas.

- **El reporte Allure abre “en blanco”**  
  Asegúrate de haber ejecutado tests **y** `npm run report:allure:generate` antes de abrir.  
  Si usas `--single-file`, verás un HTML único sin servidor.

---

## 🔐 Notas de seguridad

- No subas **.env** al repositorio.
- Oculta credenciales y tokens. Usa variables de entorno.

---

## 🧭 Convenciones

- **JS CommonJS**: `require(...) / module.exports`
- **Nombres** de test: `HealthCheck*` para validaciones y disponibilidad.
- **Schemas**: Draft-07 (`$schema`: `http://json-schema.org/draft-07/schema#`).

---

## ✅ Ejemplos rápidos

**Ejecutar todo:**
```bash
npx playwright test
```

**Ejecutar solo GroupRegistration (p2):**
```bash
npx playwright test tests/eligibility/group-registration/HealthCheckGroupRegistration.test.js
```

**Allure (generar y abrir):**
```bash
npm run report:allure:generate
npm run report:allure:open
```
