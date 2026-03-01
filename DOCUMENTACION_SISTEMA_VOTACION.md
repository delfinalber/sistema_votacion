# DOCUMENTACIÓN - Sistema de Votación Completo

## 📋 Resumen de la Implementación

Se ha implementado un sistema de votación electrónica completo con autenticación, validación de votantes, registro de votos y visualización de resultados preliminares.

---

## 🔐 AUTENTICACIÓN (index.html)

### Funcionalidad Principal
- Modal de autenticación que se abre al hacer clic en "Ir a Votar"
- Validación de 30 segundos
- Limpieza automática de datos al cierre

### API Utilizada
- **Endpoint**: `/sistema_votacion/Votaciones/api/validar_sesion.php`
- **Método**: POST
- **Parámetros**: 
  - `usuario` (INT) - Código de usuario
  - `paasword` (VARCHAR) - Contraseña (nota: campo con typo en BD)
- **Respuesta**:
  ```json
  {
    "success": true,
    "usuario_id": 1,
    "usuario_nombre": "Admin"
  }
  ```

### Algoritmo de Validación
1. Usuario clickea "Ir a Votar"
2. Se abre modal de autenticación
3. Ingresa usuario y contraseña
4. Sistema valida contra tabla `usuario` en BD
5. Si es válido → Se almacena sesión y redirige a votación.html
6. Si es inválido → Muestra error, limpia formulario

---

## 🗳️ VOTACIÓN (votacion.html)

### Flujo de Votación

1. **Verificación de Votante**
   - Usuario ingresa su código de votante
   - Sistema valida en tabla `votantes`
   - Verifica que `voto_realizado = 0`
   
2. **Carga de Candidatos**
   - Sistema obtiene lista de candidatos por cargo
   - Personero: Se muestran todos los candidatos
   - Contralor: Se muestran todos los candidatos
   - Opción de "Voto en Blanco" para cada cargo

3. **Registro del Voto**
   - Usuario selecciona candidato para Personero
   - Usuario selecciona candidato para Contralor
   - Clickea "Enviar Voto"
   - Sistema registra ambos votos en transacción

4. **Confirmación**
   - Muestra mensaje de éxito
   - Limpia la interfaz
   - Redirige a resultados preliminares

### APIs Utilizadas

#### 1. validar_votante.php
**Endpoint**: `/sistema_votacion/Votaciones/api/validar_votante.php`
**Método**: POST
**Parámetros**:
```json
{
  "id_votante": "12345"
}
```
**Respuesta**:
```json
{
  "success": true,
  "message": "Votante verificado",
  "votante": {
    "id_votante": "12345",
    "nombre": "Juan Pérez"
  }
}
```

#### 2. obtener_candidatos.php
**Endpoint**: `/sistema_votacion/Votaciones/api/obtener_candidatos.php`
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "personeros": [
    {
      "id_candidato": 1,
      "nombre": "Pedro López",
      "numero": "001",
      "cargo": "Personero"
    }
  ],
  "contralores": [
    {
      "id_candidato": 5,
      "nombre": "María García",
      "numero": "101",
      "cargo": "Contralor"
    }
  ]
}
```

#### 3. registrar_votos_completo.php
**Endpoint**: `/sistema_votacion/Votaciones/api/registrar_votos_completo.php`
**Método**: POST
**Parámetros**:
```json
{
  "id_votante": "12345",
  "id_personero": 1,
  "id_contralor": 5
}
```
**Respuesta**:
```json
{
  "success": true,
  "message": "Voto registrado correctamente",
  "votante": "12345"
}
```

**Notas**:
- Para voto en blanco: usar `id_candidato = 0`
- Registra dos votos en transacción atómica
- Marca votante como `voto_realizado = 1`
- Previene duplicados con validación

#### 4. obtener_consolidado.php
**Endpoint**: `/sistema_votacion/Votaciones/api/obtener_consolidado.php`
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "personeros": [
    {
      "id_candidato": 1,
      "nombre": "Pedro López",
      "numero": "001",
      "total_votos": 45
    }
  ],
  "contralores": [
    {
      "id_candidato": 5,
      "nombre": "María García",
      "numero": "101",
      "total_votos": 38
    }
  ],
  "votos_blanco_personero": 5,
  "votos_blanco_contralor": 8,
  "total_registrados": 200,
  "total_votaron": 88
}
```

---

## 📊 RESULTADOS PRELIMINARES

### Secciones Mostradas

1. **Personero Estudiantil**
   - Lista de candidatos con número y votos
   - Votos en blanco para Personero

2. **Contralor Estudiantil**
   - Lista de candidatos con número y votos
   - Votos en blanco para Contralor

3. **Resumen General**
   - Total de votantes registrados
   - Total que votaron
   - Porcentaje de participación

### Funcionalidades
- Botón "Actualizar" para refrescar resultados en tiempo real
- Botón "Volver a Votar" para permitir otro votante

---

## 🔒 SEGURIDAD

### Medidas Implementadas

1. **Prepared Statements**
   - Todos los APIs usan prepared statements
   - Previene SQL injection

2. **Validación de Votantes**
   - Verifica que votante existe en BD
   - Verifica que no ha votado (`voto_realizado = 0`)
   - Solo permite un voto por persona

3. **Transacciones Atómicas**
   - Ambos votos se registran en una transacción
   - Si falla uno, se revierte todo

4. **Sesiones**
   - Autenticación basada en sessionStorage
   - Se limpia al cerrar modal

---

## 📍 ESTRUCTURA DE CARPETAS

```
sistema_votacion/
├── index.html (Landing page con modal de autenticación)
├── votacion.html (Página principal de votación)
├── Votaciones/
│   ├── script_votacion.js (Lógica de votación)
│   ├── styles.css (Estilos)
│   ├── api/
│   │   ├── db.php (Conexión a BD)
│   │   ├── validar_sesion.php (Autenticación)
│   │   ├── validar_votante.php (Verificar votante)
│   │   ├── obtener_candidatos.php (Listar candidatos)
│   │   ├── registrar_votos_completo.php (Registrar ambos votos)
│   │   ├── obtener_consolidado.php (Resultados)
│   │   └── ... (Otros APIs)
│   └── Img/ (Imágenes)
└── DB/
    └── votaciones.sql (Esquema de BD)
```

---

## 🗄️ BASE DE DATOS

### Tablas Principales

#### tabla: votantes
```sql
CREATE TABLE votantes (
  id_votante VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(255),
  voto_realizado TINYINT(1) DEFAULT 0
);
```

#### tabla: candidatos
```sql
CREATE TABLE candidatos (
  id_candidato INT PRIMARY KEY,
  nombre VARCHAR(255),
  numero VARCHAR(50),
  cargo VARCHAR(100), -- 'Personero' o 'Contralor'
  foto LONGTEXT
);
```

#### tabla: votos
```sql
CREATE TABLE votos (
  id_voto INT PRIMARY KEY,
  id_candidato INT,
  id_votante VARCHAR(50),
  es_blanco TINYINT(1),
  valor_voto INT,
  fecha_voto TIMESTAMP
);
```

---

## 🎯 VALIDACIONES

### Cliente (JavaScript)

1. Código de votante no vacío
2. Selección de candidatos para ambos cargos obligatoria
3. Verificación de sesión activa

### Servidor (PHP)

1. Votante existe en BD
2. Votante no ha votado (`voto_realizado = 0`)
3. Parámetros completos en request
4. Transacción exitosa

---

## 🚀 FUNCIONES JAVASCRIPT CLAVE

```javascript
// Verificar código de votante
verificarCodigo() → fetch validar_votante.php

// Cargar candidatos
cargarCandidatos() → fetch obtener_candidatos.php

// Enviar voto
enviarVoto() → fetch registrar_votos_completo.php

// Mostrar resultados
mostrarResultadosPreliminares() → fetch obtener_consolidado.php

// Actualizar resultados
actualizarResultadosPreliminares() → fetch obtener_consolidado.php
```

---

## 📈 FLUJO COMPLETO

```
1. Usuario abre index.html
   ↓
2. Usuario clickea "Ir a Votar"
   ↓
3. Se abre modal de autenticación (30 segundos)
   ↓
4. Usuario ingresa usuario/contraseña
   ↓
5. validar_sesion.php valida credenciales
   ↓
6. Si válido → redirige a votacion.html
   ↓
7. Usuario ingresa código de votante
   ↓
8. validar_votante.php verifica que pueda votar
   ↓
9. Se cargan candidatos con obtener_candidatos.php
   ↓
10. Usuario selecciona Personero y Contralor
    ↓
11. Usuario clickea "Enviar Voto"
    ↓
12. registrar_votos_completo.php registra ambos votos en transacción
    ↓
13. Se marca votante como votado
    ↓
14. Se muestran resultados preliminares
    ↓
15. obtener_consolidado.php obtiene resultados actualizados
```

---

## ⚙️ CONFIGURACIÓN

### Base de Datos
- **Host**: localhost
- **Puerto**: 3307
- **User**: root
- **Password**: (sin contraseña)
- **Database**: votaciones

### URLs Base
- **Aplicación**: `http://localhost/sistema_votacion/`
- **APIs**: `http://localhost/sistema_votacion/Votaciones/api/`

---

## 📝 NOTAS IMPORTANTES

1. **Campo con Typo en BD**: El campo de contraseña en la tabla `usuario` es `paasword` (con dos 'a's). Esto debe preservarse en todas las consultas.

2. **Votos en Doble Vía**: Cada votante registra TWO votos (uno para Personero, uno para Contralor) en una sola transacción.

3. **Cálculo de Votos en Blanco**: Se calcula como: `total_votantes_que_votaron - total_votos_de_candidatos_de_ese_cargo`

4. **Seguridad**: Todas las consultas usan prepared statements para prevenir SQL injection.

---

## 🔄 PRÓXIMOS PASOS (Opcional)

1. Implementar gestión completa en panel de configuración
2. Agregar exportación a Excel de resultados
3. Implementar auditoría de votos
4. Agregar reporte detallado de votación
5. Mejorar interfaz de administración

---

**Última actualización**: 2024
**Estado**: Funcional y listo para uso
