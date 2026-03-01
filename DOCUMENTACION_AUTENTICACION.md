## 🔐 Sistema de Autenticación y Seguridad

### Características Implementadas

✅ **Modal de Autenticación**
- Modal de sesión elegante que se muestra automáticamente al cargar index.html
- Diseño consistente con los colores verde (#2e7d32) y fuentes Segoe UI
- Cierre automático después de 20 segundos
- Contador visible de tiempo restante

✅ **Seguridad contra Inyección SQL**
- Uso de Prepared Statements en PHP
- Validación de entrada de datos
- Encriptación de credenciales en tránsito (HTTPS recomendado)

✅ **Protección de Caché e Historial**
- Limpieza de sessionStorage al cerrar el modal sin autenticarse
- Limpieza de historial del navegador en registrop.html
- Prevención de navegación hacia atrás
- Bloqueo de teclas de acceso rápido para atrás

✅ **Validación de Sesión**
- Verificación de autenticación en registrop.html
- Redireccionamiento automático a index.html si no está autenticado
- Uso de sessionStorage (se limpia al cerrar la pestaña)

---

### 📋 Credenciales de Prueba

Para probar el sistema, usa las siguientes credenciales (almacenadas en la BD):

```
Usuario: 12345
Contraseña: delfin123456789
```

---

### 🚀 Flujo de Funcionamiento

1. **Usuario abre index.html**
   - Modal de autenticación se muestra automáticamente
   - Timer de 20 segundos comienza a contar hacia atrás

2. **Usuario intenta cerrar sin autenticarse**
   - Modal se cierra
   - sessionStorage se limpia
   - Caché se limpia
   - Regresa a index.html

3. **Usuario ingresa credenciales válidas**
   - Validación contra BD (Prepared Statements)
   - Datos guardados en sessionStorage (seguro)
   - Redireccionamiento a registrop.html
   - Timer se detiene

4. **En registrop.html**
   - Se verifica que existe sesión activa
   - Si no hay sesión, redirige a index.html
   - Se previene navegación hacia atrás
   - Se limpian datos al cerrar la pestaña

---

### 📁 Archivos Modificados/Creados

#### ✨ Nuevos:
- `votaciones/api/validar_sesion.php` - API de validación segura

#### 🔄 Modificados:
- `index.html` - Agregado modal y JavaScript de autenticación
- `registrop.html` - Agregada validación de sesión y limpieza de caché

---

### 🔒 Medidas de Seguridad

**Backend (PHP):**
- ✅ Prepared Statements para prevenir SQL Injection
- ✅ Validación de entrada de datos
- ✅ Headers de respuesta JSON seguros
- ✅ Control de acceso (POST requerido)

**Frontend (JavaScript):**
- ✅ Validación de campos antes de enviar
- ✅ Manejo de errores seguro
- ✅ Limpieza automática de datos sensibles
- ✅ sessionStorage en lugar de localStorage (más seguro)

**Navegador:**
- ✅ Limpieza de historial
- ✅ Bloqueo de navegación hacia atrás
- ✅ Limpieza de caché al cerrar sesión
- ✅ Desactivación de teclas de atajo para atrás

---

### 🎨 Estilos Consistentes

El modal utiliza:
- Color principal: **#2e7d32** (verde institucional)
- Fuente: **Segoe UI** (igual a la página principal)
- Bordes redondeados y efectos suaves
- Animaciones fluidas (fade in, slide up)
- Responsive design para dispositivos móviles
- Iconos emoji para mejor UX

---

### 🔧 Configuración (si necessitates cambiar algo)

**Tiempo de cierre automático:**
- En index.html, busca `tiempoRestanteModal = 20`
- Cambia 20 por el número de segundos deseado

**Credenciales de prueba:**
- Están en la tabla `usuario` de la BD `votaciones`
- Campos: `usuario` (entero), `paasword` (varchar)

**Endpoint de validación:**
- URL: `Votaciones/api/validar_sesion.php`
- Método: POST
- Body: `{"usuario": "12345", "password": "delfin123456789"}`

---

### ⚙️ Mantenimiento Futuro

Si necesitas:
- **Cambiar credenciales**: Actualiza la tabla `usuario` en la BD
- **Agregar más validaciones**: Edita `validar_sesion.php`
- **Cambiar estilos**: Busca `.modal-` en el CSS de index.html
- **Aumentar tiempo de sesión**: Modifica el JavaScript en index.html

---

### ✅ Checklist de Verificación

- [ ] Las credenciales funcionan correctamente
- [ ] El modal se cierra después de 20 segundos
- [ ] El historial se limpia al cerrar el modal
- [ ] No se puede acceder a registrop.html sin autenticarse
- [ ] El caché se limpia al entrar a registrop.html
- [ ] El navegador no permite volver atrás desde registrop.html
- [ ] Los estilos coinciden con la página principal
- [ ] Las fuentes son correctas (Segoe UI)
- [ ] Los colores son consistentes (#2e7d32)

---

**Sistema creado el 1 de marzo de 2026**
**Versión: 1.0**
