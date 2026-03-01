# ⚡ PRUEBA RÁPIDA - Sistema de Votación

## 🚀 Start (2 minutos)

### 1. Abre el Sistema
```
http://localhost/sistema_votacion/
```

### 2. Autenticación
- Click ⚙️ **Configuración**
- Clave: `admin123`
- → Abre Panel Administrativo

---

## ✅ Checklist de Funcionalidades

### TAB: VOTANTES

- [ ] **Agregar Individual**
  ```
  Nombre: Test Votante 1
  Código: TEST001
  Click: Agregar
  Resultado esperado: Aparece en lista
  ```

- [ ] **Crear Excel de Prueba**
  ```
  Abre Excel/Calc, crea:
  
  | Código | Nombre |
  |--------|--------|
  | TEST002 | Votante Dos |
  | TEST003 | Votante Tres |
  
  Guarda como: votantes_test.xlsx
  ```

- [ ] **Cargar Excel**
  ```
  Tab Votantes → Selecciona votantes_test.xlsx
  Status: "✓ Cargados: 2 | ✗ Errores: 0"
  ```

- [ ] **Listar Votantes**
  ```
  Verifica: TEST001, TEST002, TEST003 en lista
  ```

- [ ] **Eliminar Votante**
  ```
  Haz click Eliminar en TEST003
  Confirma
  Verifica: Solo TEST001 y TEST002 quedan
  ```

---

### TAB: CANDIDATOS

- [ ] **Agregar Personeros**
  ```
  Nombre: Candidato 1
  Número: 1
  Click: Agregar
  →  Aparece en "Lista Personeros"
  ```

- [ ] **Agregar Más Personeros**
  ```
  Nombre: Candidato 2
  Número: 2
  Click: Agregar
  ```

- [ ] **Agregar Contralor**
  ```
  Nombre: Contralor 1
  Número: 1
  Click: Agregar
  → Aparece en "Lista Contralores"
  ```

- [ ] **Agregar Otro Contralor**
  ```
  Nombre: Contralor 2
  Número: 2
  Click: Agregar
  ```

---

### TAB: SISTEMA

- [ ] **Configurar Fecha**
  ```
  Selecciona fecha/hora actual
  Click: Actualizar Fecha
  Resultado: Sin error
  ```

---

### TAB: RESULTADOS

- [ ] **Ver Resultados Vacíos**
  ```
  Verifica que muestre:
  - Personeros: 0 votos
  - Contralores: 0 votos
  - Total votantes: 2
  - Total votaron: 0
  - Participación: 0%
  ```

- [ ] **Exportar Excel**
  ```
  Click: 📥 Exportar a Excel
  Verifica: Se descarga Resultados_Votacion.xlsx
  ```

---

### VOTACIÓN EN VIVO

- [ ] **Volver a Votación**
  ```
  Botón: Volver (en Tab Votantes)
  Resultado: Vuelves a interfaz de votación
  ```

- [ ] **Verificar Votante**
  ```
  Código: TEST001
  Click: Verificar
  Resultado: "Votante: Test Votante 1"
  ```

- [ ] **Seleccionar Candidatos**
  ```
  Personero: Selecciona "Candidato 1"
  Contralor: Selecciona "Contralor 1"
  ```

- [ ] **Enviar Voto**
  ```
  Click: Enviar Voto
  Resultado: "¡Voto registrado exitosamente!"
  ```

- [ ] **Ver Resultados Preliminares**
  ```
  Click: Resultados
  Verifica:
  - Candidato 1: 1 voto
  - Contralor 1: 1 voto
  - Total votaron: 1/2 = 50%
  ```

- [ ] **Volver a Votar**
  ```
  Click: Volver a Votar
  Código: TEST002
  Click: Verificar
  Resultado: "Votante: Votante Dos"
  ```

- [ ] **Segundo Voto**
  ```
  Personero: Candidato 2
  Contralor: Contralor 2
  Click: Enviar Voto
  Resultado: "¡Voto registrado exitosamente!"
  ```

- [ ] **Resultados Finales**
  ```
  Click: Resultados
  Verifica:
  - Candidato 1: 1 voto
  - Candidato 2: 1 voto
  - Contralor 1: 1 voto
  - Contralor 2: 1 voto
  - Participación: 100% (2/2)
  ```

---

## 🎯 Verificación de Consola (F12)

**Abre DevTools (F12) → Console**

Debería NO haber errores en rojo.

Debería ver logs como:
```
Candidatos cargados: {personeros: Array(2), contralores: Array(2)}
Datos cargados correctamente
```

---

## ✨ Todo Funcionando Si

✅ Panel de administración carga sin errores  
✅ Puedes agregar votantes  
✅ Puedes cargar Excel  
✅ Puedes agregar candidatos  
✅ Puedes votar sin errores  
✅ Los votos se registran  
✅ Resultados se actualizan en tiempo real  
✅ Excel se exporta correctamente  

---

## 🐛 Si Algo Falla

1. **Abre Console (F12)**
2. **Copia el error en rojo**
3. **Verifica:**
   - ¿XAMPP está corriendo?
   - ¿Base de datos existe?
   - ¿URLs de APIs son correctas?

---

**¡Listo! El sistema está operativo.** 🚀
