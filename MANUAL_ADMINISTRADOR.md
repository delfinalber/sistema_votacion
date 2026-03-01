# 👨‍💼 MANUAL DEL ADMINISTRADOR - Sistema de Votación Estudiantil

## Bienvenida

Este es el **Panel de Administración** completo para gestionar votaciones estudiantiles.

---

## 🔐 Paso 1: Acceder al Sistema

### Desde el Navegador
```
Abre: http://localhost/sistema_votacion/
```

### Crear Sesión de Administrador
1. Haz clic en el botón **⚙️ Configuración** (esquina superior)
2. Verás un modal con un campo de entrada
3. Ingresa la clave: `admin123`
4. Presiona **Verificar**
5. ✅ Se abre automáticamente el panel de administración

### Si la Clave es Incorrecta
- Aparecerá un mensaje: "Clave incorrecta"
- Intenta de nuevo
- **Clave correcta:** `admin123`

---

## 📊 Panel de Administración

Una vez autenticado, verás 4 **pestañas (tabs)** principales:

```
┌─────────────────────────────────────────────────────┐
│ 📋 Votantes │ 🎓 Candidatos │ ⚙️ Sistema │ 📊 Resultados │ Volver
└─────────────────────────────────────────────────────┘
                   [Contenido de la pestaña]
```

---

## 📋 PESTAÑA 1: GESTIÓN DE VOTANTES

Esta pestaña te permite agregar y administrar a los estudiantes que pueden votar.

### Opción A: Agregar Votantes Individuales

**Cuando usar:** Para añadir 1 o 2 votantes

**Pasos:**

1. Busca la sección **"Agregar Votante Individual"**
2. Completa 2 campos:
   - **Nombre completo:** Nombre del estudiante (ej: "Juan Pérez García")
   - **Código / Documento:** ID único (ej: "1001", "12345", cédula, etc.)
3. Haz clic en botón **[Agregar]**
4. Verás un mensaje: ✓ Votante agregado correctamente
5. El votante aparecerá automáticamente en la **Lista de Votantes Registrados**

**Ejemplo:**
```
Nombre: María López Martínez
Código: 2345
[Agregar]
→ ✓ Votante agregado correctamente
```

### Opción B: Cargar Votantes desde Excel (Recomendado para 10+)

**Cuando usar:** Tienes lista completa de votantes en Excel

**Preparar el archivo Excel:**

1. Abre **Excel** o **Calc** (LibreOffice)
2. Crea 2 columnas:
   - Columna 1: `Código` (o: codigo, code, id, Id, Código)
   - Columna 2: `Nombre` (o: nombre, name, Nombre, Name)

3. Llena los datos:
   ```
   | Código  | Nombre                  |
   |---------|-------------------------|
   | 1001    | Juan Carlos Pérez       |
   | 1002    | María José García       |
   | 1003    | Luis Fernando Rodríguez |
   | 1004    | Ana María López         |
   | 1005    | Carlos Roberto Silva    |
   ```

4. **Guarda el archivo** como: `votantes.xlsx` (Excel 2010+)
5. NO guardes como `.xls` antiguo, asegúrate que sea `.xlsx`

**Cargar en el sistema:**

1. En el panel, busca **"Cargar Votantes desde Excel"**
2. Verás un área punteada: **"Haz clic para seleccionar archivo"**
3. Opción 1: Haz clic y selecciona el archivo
4. Opción 2: Arrastra el archivo sobre el área (Drag & Drop)
5. Espera a que cargue (dice: "⏳ Procesando archivo...")
6. Verás el resultado:
   - **✓ Cargados: 5 | ✗ Errores: 0** (Éxito total)
   - **✓ Cargados: 4 | ✗ Errores: 1** (4 agregados, 1 duplicado/error)

**¿Qué significa "Errores"?**
- Código ya existe en BD
- Datos incompletos
- Formato incorrecto

**Troubleshooting Excel:**
- Error: El archivo no es .xlsx → Guarda como Excel 2010+
- Error: "Errores: 2" → Verifica no haya códigos duplicados
- Error: "Cargados: 0" → Verifica nombres de columnas

### Ver Lista de Votantes

**Automáticamente después de agregar:**

La sección **"Votantes Registrados"** muestra:
```
┌──────────────────────────────────┐
│ María López Martínez             │
│ Código: 2345      [Eliminar]     │
├──────────────────────────────────┤
│ Juan Pérez García                │
│ Código: 1001      [Eliminar]     │
└──────────────────────────────────┘
```

Cada votante tiene:
- ✓ Nombre completo
- ✓ Código/ID
- 🗑️ Botón ELIMINAR

### Eliminar un Votante

**Cuando usar:** Eliminaste por error, o votante no puede participar

**Pasos:**

1. Localiza el votante en la lista
2. Haz clic en **[Eliminar]** (lado derecho)
3. Aparecerá una confirmación: "¿Eliminar este votante?"
4. Haz clic en **OK** para confirmar
5. ✓ Votante eliminado correctamente
6. Desaparece de la lista

⚠️ **IMPORTANTE:** No se puede recuperar. Asegúrate que es correcto.

---

## 🎓 PESTAÑA 2: CANDIDATOS

Aquí registras a los estudiantes que se CANDIDATIZAN para cargos.

### Estructura de Candidaturas

En el sistema hay **2 cargos** diferentes:

1. **Personero Estudiantil** (Representa estudiantes)
2. **Contralor Estudiantil** (Fiscaliza y controla)

Cada votante votará por **1 candidato** en cada cargo.

### Agregar Candidato Personero

**Pasos:**

1. Busca sección: **"Agregar Candidato Personero"**
2. Completa:
   - **Nombre del candidato:** Nombre completo
   - **Número:** Número de candidatura (ej: 1, 2, 3...)
   - **Foto del candidato:** (Opcional) Selecciona foto
3. Click **[Agregar]**
4. ✓ Candidato agregado correctamente
5. Aparece en **"Candidatos Personeros"**

**Ejemplo:**
```
Nombre: Juan Pablo Mendoza
Número: 1
[Agregar]
→ Aparece: "1 - Juan Pablo Mendoza"
```

### Agregar Candidato Contralor

**Exactamente igual que Personero:**

1. Sección: **"Agregar Candidato Contralor"**
2. Nombre, Número, Foto
3. Click **[Agregar]**
4. Aparece en **"Candidatos Contralores"**

### Ver Lista de Candidatos

Debajo de cada formulario ves la lista actual:

```
CANDIDATOS PERSONEROS
- 1 - Juan Pablo Mendoza      [Eliminar]
- 2 - María Elena Gómez      [Eliminar]
- 3 - Carlos Luis Díaz        [Eliminar]

CANDIDATOS CONTRALORES
- 1 - Sofia Rodriguez         [Eliminar]
- 2 - Fernando García         [Eliminar]
```

### Eliminar un Candidato

1. Click en **[Eliminar]** del candidato
2. Confirma: "¿Eliminar este candidato?"
3. ✓ Candidato eliminado

⚠️ **Si ya hay votos:** Los votos registrados en el candidato NO se borran, pero el candidato no aparecerá más para votar.

---

## ⚙️ PESTAÑA 3: CONFIGURACIÓN DEL SISTEMA

Para configuraciones generales de la votación.

### Establecer Fecha y Hora de Votación

**¿Para qué sirve?**
- Registra cuándo comienza oficialmente
- Opcional para validaciones de horario futuro
- Referencia administrativa

**Pasos:**

1. Verás un selector: **"Fecha y Hora de Votación"**
2. Haz clic en el campo
3. Se abre un calendario
4. Selecciona:
   - **Día:** Ej: 5 de Marzo
   - **Hora:** Ej: 08:00 AM
5. Haz clic **[Actualizar Fecha]**
6. ✓ Fecha actualizada correctamente

**Nota:** Se guarda en el navegador. Si cierras todo, se mantiene.

---

## 📊 PESTAÑA 4: RESULTADOS Y EXPORTACIÓN

Aquí ves todos los votos registrados y puedes exportarlos.

### Ver Resultados en Tiempo Real

**El panel muestra 3 secciones:**

#### 1️⃣ Resultados Personero Estudiantil
```
🎓 RESULTADOS PERSONERO
┌────────────────────────────────┐
│ Juan Pablo Mendoza (#1)        │
│ 45 votos                       │
├────────────────────────────────┤
│ María Elena Gómez (#2)         │
│ 38 votos                       │
├────────────────────────────────┤
│ Carlos Luis Díaz (#3)          │
│ 22 votos                       │
├────────────────────────────────┤
│ Voto en Blanco                 │
│ 2 votos                        │
└────────────────────────────────┘
```

#### 2️⃣ Resultados Contralor Estudiantil
```
⚖️ RESULTADOS CONTRALOR
┌────────────────────────────────┐
│ Sofia Rodriguez (#1)           │
│ 43 votos                       │
├────────────────────────────────┤
│ Fernando García (#2)           │
│ 44 votos                       │
├────────────────────────────────┤
│ Voto en Blanco                 │
│ 20 votos                       │
└────────────────────────────────┘
```

#### 3️⃣ Resumen General
```
📊 RESUMEN GENERAL
Total votantes registrados:   107
Total que votaron:            107
Participación:                100%
```

**Se actualiza automáticamente** cada vez que alguien vota.

### Exportar Resultados a Excel

**¿Para qué?**
- Guardar resultados finales
- Hacer reportes
- Enviar a directiva

**Pasos:**

1. Haz clic en **📥 [Exportar a Excel]**
2. Automáticamente se descarga: `Resultados_Votacion.xlsx`
3. Se abre en tu computadora (generalmente en Descargas)
4. Contiene:
   - Personeros con número de votos
   - Contralores con número de votos
   - Resumen estadístico

**Contenido del archivo:**
```
PERSONERO ESTUDIANTIL
Juan Pablo Mendoza      1    45
María Elena Gómez       2    38
Carlos Luis Díaz        3    22
Voto en Blanco               2

CONTRALOR ESTUDIANTIL
Sofia Rodriguez         1    43
Fernando García         2    44
Voto en Blanco              20

RESUMEN GENERAL
Total registrados   107
Total votaron       107
Participación       100%
```

### ⚠️ REINICIAR VOTACIÓN (Cuidado)

**¿Qué hace?**
- Elimina TODOS los votos registrados
- Reinicia estado de votantes (pueden votar nuevamente)
- NO elimina los votantes ni candidatos

**Cuándo usar:**
- Error grave en la votación
- Reiniciar proceso completo
- Nuevo ciclo de votación

**Pasos:**

1. Haz clic en **🔄 [Reiniciar Votación]**
2. Sale un aviso:
   ```
   ⚠️ ¿Estás seguro?
   Esto eliminará todos los votos registrados.
   ```
3. **Si presionas OK:**
   - Se borran todos votos
   - Votantes pueden votar de nuevo
   - ✓ Votación reiniciada correctamente

4. **Si presionas CANCELAR:**
   - Nada se borra
   - Todo continúa normal

⚠️ **MUY IMPORTANTE:** No hay vuelta atrás. Guarda resultados antes con Export a Excel.

---

## 🗳️ INTERFAZ DE VOTACIÓN (Cuando NO estás en Configuración)

### Volver a la Zona de Votación

En cualquier momento desde el panel, haz clic en **[Volver]** para:
- Permitir que los estudiantes voten
- Mostrar interfaz de votación

### Para cada Estudiante Votante

#### 1️⃣ Verificar Identidad
```
"Ingrese su código de votante"
[1001] [Verificar]
```

**Sistema valida:**
- ✓ Código existe en BD
- ✓ Estudiante aún no ha votado
- ✓ Muestra nombre de confirmación

#### 2️⃣ Seleccionar Candidatos

Una vez verificado, aparecen opciones:

**PERSONERO:**
```
Seleccione candidato para Personero:
○ 1 - Juan Pablo Mendoza
○ 2 - María Elena Gómez
○ 3 - Carlos Luis Díaz
○ VOTO EN BLANCO
```

**CONTRALOR:**
```
Seleccione candidato para Contralor:
○ 1 - Sofia Rodriguez
○ 2 - Fernando García
○ VOTO EN BLANCO
```

#### 3️⃣ Emitir Voto
```
[Enviar Voto]
```

Resultado:
```
✅ ¡Voto registrado exitosamente!
→ Muestra Resultados Preliminares
```

#### 4️⃣ Ver Resultados Preliminares

Se muestra:
- Votos parciales actualizados
- Participación hasta el momento
- Opción: **[Volver a Votar]** para siguiente estudiant

---

## 🎯 FLUJO TÍPICO DE UNA VOTACIÓN

### Antes de Abrir Votación (PREPARACIÓN)
```
1. Agregar Votantes (Excel masivo recomendado)
   → 107 estudiantes cargados
   
2. Agregar Candidatos
   → Personero: 3 candidatos
   → Contralor: 2 candidatos
   
3. Configurar Fecha/Hora (opcional)
   → 08:00 AM del día de votación
   
4. Verificar todo esté correcto
   → Ver lista votantes
   → Ver lista candidatos
```

### Durante la Votación (EN VIVO)
```
1. Volver a interfaz de votación
   → [Volver] button

2. Primer estudiante:
   Código: 1001
   [Verificar] → Aparece nombre
   Selecciona Personero: "Juan Pablo"
   Selecciona Contralor: "Sofia"
   [Enviar Voto] → ✓ Registrado
   Ver Resultados → 1 voto registrado
   [Volver a Votar]

3. Segundo estudiante:
   Código: 1002
   [Verificar]
   Selecciona candidatos
   [Enviar Voto] → ✓
   [Volver a Votar]

4. ... Repetir para todos 107 estudiantes

Mientras vota gente:
- Puedes ver [Resultados] en tiempo real
- Se actualiza automáticamente
- Muestra participación en vivo
```

### Después de Votación (CIERRE)
```
1. Cuando termina el horario
   → [Resultados] en panel

2. Verificar números finales
   → Revisión visual

3. Exportar a Excel
   → 📥 [Exportar a Excel]
   → Se descarga Resultados_Votacion.xlsx

4. OPCIONAL: Guardar respaldo
   → Copia archivo Excel a otro lugar
   → Drive, USB, etc.

5. Acto eleccionario/Proclamación
   → Comunica resultados
   → Felicita ganadores
```

---

## 🆘 Problemas Comunes y Soluciones

### "No hay votantes registrados"
**Problema:** Panel vacío en Tab Votantes
**Solución:**  
1. Agrega votantes (individual o Excel)
2. Recarga la página F5

### "Error al cargar Excel"
**Problema:** El archivo Excel no se carga
**Soluciones:**
1. Verifica formato: `.xlsx` (no `.xls` antiguo)
2. Verifica columnas: "Código" y "Nombre"
3. Sin caracteres especiales raros
4. Intenta archivo más pequeño primero

### "Votante no encontrado"
**Problema:** Al ingresar código dice "no existe"
**Solución:**
1. Verifica código escrito correctamente
2. Revisa en Tab Votantes que esté agregado
3. Recarga la página si no aparece

### "Botones no funcionan"
**Problema:** Click en botón pero nada pasa
**Soluciones:**
1. Recarga página: Ctrl + F5
2. Limpia cache: Ctrl + Shift + Del
3. Abre en navegador diferente

### "Datos desaparecieron"
**Problema:** Los votantes/candidatos ya no aparecen
**Causas posibles:**
1. Presionaste "Reiniciar Votación" accidentalmente
2. Base de datos se reinició
**Solución:**
1. Si presionaste reinicio: Debes agregar nuevamente
2. Mantén respaldo en Excel

### "XAMPP no está corriendo"
**Problema:** Página no carga
**Solución:**
1. Abre XAMPP Control Panel
2. Click **[Start]** en Apache y MySQL
3. Espera 3-5 segundos
4. Recarga página en navegador

---

## 💾 Respaldo y Seguridad

### Guardar Resultados Regulares
**Durante votación (cada 30 min):**
1. Tab Resultados
2. 📥 [Exportar a Excel]
3. Guarda en carpeta segura
4. Renombra: `Resultados_12_30.xlsx`

### Guardar Listado de Votantes
**Después de cargar:**
1. En Excel/Calc, vuelve a guardar el archivo original
2. O desde Tab Votantes, manualmente anota
3. Mantén copia en USB o Drive

### En Caso de Error Grave
1. Tienes respaldo en Excel
2. Puedes recargar votantes nuevamente
3. Proceso es rápido

---

## 📞 Resumen

| Tarea | Dónde |
|-------|-------|
| Registrar votantes | Tab: VOTANTES |
| Agregar candidatos | Tab: CANDIDATOS |
| Configurar fecha | Tab: SISTEMA |
| Ver resultados | Tab: RESULTADOS |
| Permitir votar | Botón: VOLVER |
| Descargar resultados | Tab: RESULTADOS → EXPORTAR |
| Reiniciar todo | Tab: RESULTADOS → REINICIAR |

---

## ✅ LISTA DE VERIFICACIÓN PRE-VOTACIÓN

Antes de abrir la votación a estudiantes:

- [ ] ¿Están todos los votantes cargados?
- [ ] ¿Hay suficientes candidatos registrados?
- [ ] ¿Se probó el sistema con un votante de prueba?
- [ ] ¿Se probó verificar código?
- [ ] ¿Se probó enviar un voto de prueba?
- [ ] ¿Se probó ver resultados?
- [ ] ¿Guardaste respaldo en Excel?
- [ ] ¿Están todos los navegadores actualizados?
- [ ] ¿XAMPP está corriendo?
- [ ] ¿Base de datos está funcionando?

---

## 🎉 ¡Listo!

**El sistema está preparado para la votación.**

Para preguntas o problemas, revisa:
- **GUIA_PANEL_ADMINISTRACION.md** → Documentación técnica detallada
- **TEST_RAPIDO.md** → Pruebas rápidas de funcionalidad
- **RESUMEN_TECNICO_v2.md** → Detalles de desarrollo

---

**¡Éxito con tu votación estudiantil!** 🎓✨
