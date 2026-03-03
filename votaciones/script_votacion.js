// ======================================
// VARIABLES GLOBALES
// ======================================
let votanteActual = null;
let candidatos = {
    personeros: [],
    contralores: []
};
let temporizadorReinicioVotacion = null;
let segundosReinicioVotacion = 30;
let temporizadorCargaVotantesExcel = null;
let segundosCargaVotantesExcel = 30;
let cargaVotantesExcelPendiente = null;
window.__intervaloCandidatosAdmin = null;
window.__intervaloCandidatosVotacion = null;
const EVENTO_ACTUALIZACION_CANDIDATOS = 'sv_candidatos_updated_at';

function tabCandidatosVisible() {
    const tab = document.getElementById('tabCandidatos');
    const config = document.getElementById('configArea');
    return !!tab && !!config && !tab.classList.contains('hidden') && !config.classList.contains('hidden');
}

function notificarActualizacionCandidatos() {
    try {
        localStorage.setItem(EVENTO_ACTUALIZACION_CANDIDATOS, String(Date.now()));
    } catch (error) {
        console.warn('No se pudo notificar actualización de candidatos:', error);
    }
}

function esDocumentoValido(documento) {
    return /^\d{6,11}$/.test(String(documento || '').trim());
}

function normalizarCabecera(valor) {
    return String(valor || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function normalizarDocumentoExcel(valor) {
    let documento = String(valor ?? '').trim();

    if (/^\d+\.0+$/.test(documento)) {
        documento = documento.split('.')[0];
    }

    return documento.replace(/\s+/g, '');
}

function obtenerValorColumna(row, aliasCabeceras, valorPorDefecto = '') {
    if (!row || typeof row !== 'object') return String(valorPorDefecto || '');

    const valoresPorCabecera = {};
    Object.keys(row).forEach((key) => {
        valoresPorCabecera[normalizarCabecera(key)] = row[key];
    });

    for (const alias of aliasCabeceras) {
        const clave = normalizarCabecera(alias);
        if (Object.prototype.hasOwnProperty.call(valoresPorCabecera, clave)) {
            return String(valoresPorCabecera[clave] ?? '').trim();
        }
    }

    return String(valorPorDefecto || '').trim();
}

// ======================================
// CARGAR CANDIDATOS Y DATOS AL INICIAR
// ======================================
window.addEventListener('load', async function() {
    // Verificar sesión de administrador
    const autenticado = sessionStorage.getItem('autenticado');
    const configAccessDiv = document.querySelector('.config-access');
    
    if (autenticado && autenticado === 'true') {
        // Usuario es administrador - mostrar panel de configuración
        document.getElementById('votingArea').classList.add('hidden');
        document.getElementById('preliminaresArea').classList.add('hidden');
        document.getElementById('configArea').classList.remove('hidden');
        document.getElementById('modalKey').classList.add('hidden');
        
        // Esconder botones de configuración (ya está en panel)
        if (configAccessDiv) {
            configAccessDiv.style.display = 'none';
        }
        
        // Cargar datos del panel administrativo
        try {
            await cargarCandidatos();
            cargarVotantes();
            await cargarCandidatosAdmin();
            await cargarResultados();
            console.log('Panel administrativo cargado correctamente');
        } catch (error) {
            console.error('Error al cargar datos administrativos:', error);
        }
    } else {
        // Usuario regular - mostrar interfaz de votación
        document.getElementById('configArea').classList.add('hidden');
        document.getElementById('preliminaresArea').classList.add('hidden');
        document.getElementById('votingArea').classList.remove('hidden');
        document.getElementById('modalKey').classList.add('hidden');
        
        // Mostrar botones de configuración
        if (configAccessDiv) {
            configAccessDiv.style.display = 'flex';
        }
        
        // Cargar solo candidatos para votación
        try {
            await cargarCandidatos();
            console.log('Interfaz de votación cargada correctamente');
        } catch (error) {
            console.error('Error al cargar candidatos:', error);
        }
    }
});

window.addEventListener('storage', async function(event) {
    if (event.key !== EVENTO_ACTUALIZACION_CANDIDATOS) return;
    if (!tabCandidatosVisible()) return;

    await cargarTabCandidatos();
});

// ======================================
// CARGAR CANDIDATOS DEL API
// ======================================
async function cargarCandidatos() {
    try {
        const apiUrl = `${window.location.origin}/sistema_votacion/votaciones/api/obtener_candidatos.php?t=${Date.now()}`;
        const response = await fetch(apiUrl, { cache: 'no-store' });
        const data = await response.json();

        if (data.success) {
            candidatos = data;
            console.log('Candidatos cargados:', candidatos);
        } else {
            console.error('Error:', data.message);
        }

        return data;
    } catch (error) {
        console.error('Error al cargar candidatos:', error);
        return null;
    }
}

// ======================================
// CARGAR VOTANTES PARA ADMIN
// ======================================
async function cargarVotantes() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/votaciones/api/get_votantes.php?t=' + Date.now();
        const response = await fetch(apiUrl, { cache: 'no-store' });
        const data = await response.json();

        if (data.success) {
            mostrarListaVotantes(data.votantes);
        }
    } catch (error) {
        console.error('Error al cargar votantes:', error);
    }
}

// ======================================
// CARGAR TODOS LOS VOTANTES DEL API
// ======================================
async function cargarTodosVotantes() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/votaciones/api/get_votantes.php?t=' + Date.now();
        const response = await fetch(apiUrl, { cache: 'no-store' });
        const data = await response.json();

        if (data.success && data.votantes) {
            mostrarListaVotantes(data.votantes);
        } else {
            const listaDiv = document.getElementById('listaVotantesDiv');
            listaDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-style: italic;">No hay votantes registrados</p>';
        }
    } catch (error) {
        console.error('Error al cargar votantes:', error);
        const listaDiv = document.getElementById('listaVotantesDiv');
        listaDiv.innerHTML = '<p style="text-align: center; color: #dc3545;">Error al cargar votantes</p>';
    }
}

// ======================================
// MOSTRAR LISTA DE VOTANTES
// ======================================
function mostrarListaVotantes(votantes) {
    const listaDiv = document.getElementById('listaVotantesDiv');
    listaDiv.innerHTML = '';

    if (!votantes || votantes.length === 0) {
        listaDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-style: italic;">No hay votantes registrados</p>';
        return;
    }

    votantes.forEach(votante => {
        const item = document.createElement('div');
        item.className = 'votante-item';
        
        // Determinar estado del voto
        const estadoVoto = votante.voto_realizado ? '✓ Votó' : 'Pendiente';
        const colorEstado = votante.voto_realizado ? '#28a745' : '#ffc107';
        
        item.innerHTML = `
            <div class="votante-info">
                <strong>${votante.nombre}</strong>
                <small>Código: ${votante.id_votante}</small>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 12px; color: ${colorEstado}; font-weight: 600;">${estadoVoto}</span>
                <button class="btn-eliminar" onclick="eliminarVotanteAdmin('${votante.id_votante}')">Eliminar</button>
            </div>
        `;
        listaDiv.appendChild(item);
    });
}

// ======================================
// AGREGAR VOTANTE INDIVIDUAL
// ======================================
async function agregarVotanteIndividual() {
    const nombre = document.getElementById('nuevoNombreVotante').value.trim();
    const codigo = document.getElementById('nuevoCódigoVotante').value.trim();

    if (!nombre || !codigo) {
        alert('Por favor completa todos los campos');
        return;
    }

    if (!esDocumentoValido(codigo)) {
        alert('El documento debe tener entre 6 y 11 dígitos numéricos');
        return;
    }

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/add_votante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codigo: codigo,
                nombre: nombre
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Votante agregado correctamente');
            document.getElementById('nuevoNombreVotante').value = '';
            document.getElementById('nuevoCódigoVotante').value = '';
            await cargarTodosVotantes();
        } else {
            alert('Error: ' + (data.message || data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar votante');
    }
}

// ======================================
// CARGAR VOTANTES DESDE EXCEL
// ======================================
async function cargarVotantesExcel(input) {
    const file = input.files[0];
    if (!file) return;

    const statusDiv = document.getElementById('statusCarga');
    statusDiv.textContent = '⏳ Procesando archivo...';

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const filasTotales = jsonData.length;

        const votantes = jsonData
            .map((row) => {
                const codigo = normalizarDocumentoExcel(
                    obtenerValorColumna(row, [
                        'codigo',
                        'código',
                        'code',
                        'id',
                        'id_votante',
                        'documento',
                        'nro_documento',
                        'numero_documento',
                        'num_documento',
                        'cedula',
                        'cédula'
                    ])
                );
                const nombre = obtenerValorColumna(row, [
                    'nombre',
                    'nombres',
                    'name',
                    'nombre_completo',
                    'votante'
                ]);
                return { codigo, nombre };
            })
            .filter((row) => row.codigo && row.nombre && esDocumentoValido(row.codigo))
            .map((row) => ({
                codigo: row.codigo,
                nombre: row.nombre.slice(0, 150)
            }));

        const filasDescartadas = filasTotales - votantes.length;

        if (votantes.length === 0) {
            statusDiv.className = 'error';
            statusDiv.textContent = '✗ El archivo no contiene filas válidas (documento 6-11 dígitos y nombre)';
            input.value = '';
            return;
        }

        cargaVotantesExcelPendiente = {
            votantes,
            input,
            statusDiv
        };

        statusDiv.className = '';
        statusDiv.textContent = `ℹ️ Archivo leído: ${votantes.length} válido(s) de ${filasTotales}. Descartados: ${filasDescartadas}. Autoriza para cargar.`;
        abrirModalCargaVotantesExcel(votantes.length);
    } catch (error) {
        statusDiv.className = 'error';
        statusDiv.textContent = '✗ Error al procesar archivo';
        input.value = '';
        console.error('Error:', error);
    }
}

function abrirModalCargaVotantesExcel(totalRegistros) {
    const modal = document.getElementById('modalCargaVotantesExcel');
    const usuarioInput = document.getElementById('usuarioAdministradorCarga');
    const passwordInput = document.getElementById('passwordAdministradorCarga');
    const mensaje = document.getElementById('mensajeCargaVotantesExcel');
    const btnConfirmar = document.getElementById('btnConfirmarCargaVotantesExcel');

    if (!modal || !usuarioInput || !passwordInput) return;

    usuarioInput.value = '';
    passwordInput.value = '';
    if (mensaje) {
        mensaje.style.display = 'block';
        mensaje.style.color = '#666';
        mensaje.textContent = `Se cargarán ${totalRegistros} registro(s).`;
    }
    if (btnConfirmar) {
        btnConfirmar.disabled = false;
    }

    segundosCargaVotantesExcel = 30;
    actualizarTextoTimerCargaVotantesExcel();

    modal.classList.remove('hidden');
    usuarioInput.focus();

    if (temporizadorCargaVotantesExcel) {
        clearInterval(temporizadorCargaVotantesExcel);
    }

    temporizadorCargaVotantesExcel = setInterval(() => {
        segundosCargaVotantesExcel -= 1;
        actualizarTextoTimerCargaVotantesExcel();

        if (segundosCargaVotantesExcel <= 0) {
            cancelarCargaVotantesExcel(true);
        }
    }, 1000);
}

function actualizarTextoTimerCargaVotantesExcel() {
    const timer = document.getElementById('timerCargaVotantesExcel');
    if (!timer) return;
    timer.textContent = `Tiempo restante: ${segundosCargaVotantesExcel}s`;
}

function mostrarMensajeModalCargaVotantesExcel(texto, esError = false) {
    const mensaje = document.getElementById('mensajeCargaVotantesExcel');
    if (!mensaje) return;

    mensaje.style.display = 'block';
    mensaje.textContent = texto;
    mensaje.style.color = esError ? '#dc3545' : '#2e7d32';
}

function cerrarModalCargaVotantesExcel() {
    const modal = document.getElementById('modalCargaVotantesExcel');
    const usuarioInput = document.getElementById('usuarioAdministradorCarga');
    const passwordInput = document.getElementById('passwordAdministradorCarga');
    const mensaje = document.getElementById('mensajeCargaVotantesExcel');
    const btnConfirmar = document.getElementById('btnConfirmarCargaVotantesExcel');

    if (temporizadorCargaVotantesExcel) {
        clearInterval(temporizadorCargaVotantesExcel);
        temporizadorCargaVotantesExcel = null;
    }

    if (modal) modal.classList.add('hidden');
    if (usuarioInput) usuarioInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (mensaje) {
        mensaje.style.display = 'none';
        mensaje.textContent = '';
        mensaje.style.color = '#666';
    }
    if (btnConfirmar) {
        btnConfirmar.disabled = false;
    }
}

function cancelarCargaVotantesExcel(esTimeout = false) {
    const estado = cargaVotantesExcelPendiente?.statusDiv;
    const inputArchivo = cargaVotantesExcelPendiente?.input;

    cerrarModalCargaVotantesExcel();

    if (estado) {
        estado.className = 'error';
        estado.textContent = esTimeout
            ? '✗ Tiempo agotado. La carga fue cancelada.'
            : '✗ Carga cancelada por el usuario.';
    }

    if (inputArchivo) {
        inputArchivo.value = '';
    }

    cargaVotantesExcelPendiente = null;
}

async function confirmarCargaVotantesExcel() {
    const usuarioInput = document.getElementById('usuarioAdministradorCarga');
    const passwordInput = document.getElementById('passwordAdministradorCarga');
    const btnConfirmar = document.getElementById('btnConfirmarCargaVotantesExcel');

    if (!usuarioInput || !passwordInput) return;
    if (!cargaVotantesExcelPendiente || !Array.isArray(cargaVotantesExcelPendiente.votantes)) {
        mostrarMensajeModalCargaVotantesExcel('No hay archivo pendiente para cargar', true);
        return;
    }
    if (btnConfirmar && btnConfirmar.disabled) return;

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value;
    const errorCredenciales = validarCredencialesReinicio(usuario, password);

    if (errorCredenciales) {
        mostrarMensajeModalCargaVotantesExcel(errorCredenciales, true);
        return;
    }

    if (btnConfirmar) {
        btnConfirmar.disabled = true;
    }

    mostrarMensajeModalCargaVotantesExcel('Validando credenciales y cargando registros...');

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/cargar_votantes_excel.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_adminstrador: usuario,
                password_adminstrador: password,
                votantes: cargaVotantesExcelPendiente.votantes
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            mostrarMensajeModalCargaVotantesExcel(data.error || 'No fue posible cargar los votantes', true);
            passwordInput.value = '';
            return;
        }

        const estado = cargaVotantesExcelPendiente.statusDiv;
        const inputArchivo = cargaVotantesExcelPendiente.input;

        cerrarModalCargaVotantesExcel();

        if (estado) {
            estado.className = 'success';
            estado.textContent = `✓ Cargados: ${data.insertados || 0} | Actualizados: ${data.actualizados || 0} | Errores: ${data.errores || 0}`;
        }

        if (inputArchivo) {
            inputArchivo.value = '';
        }

        cargaVotantesExcelPendiente = null;
        await cargarTodosVotantes();
    } catch (error) {
        mostrarMensajeModalCargaVotantesExcel('Error al cargar los votantes', true);
        passwordInput.value = '';
        console.error('Error:', error);
    } finally {
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
        }
    }
}

// ======================================
// ELIMINAR VOTANTE
// ======================================
async function eliminarVotante(idVotante) {
    if (!confirm('¿Eliminar este votante?')) return;

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/delete_votante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_votante: idVotante })
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Votante eliminado');
            await cargarVotantes();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar votante');
    }
}

// ======================================
// ELIMINAR VOTANTE (DESDE ADMIN)
// ======================================
async function eliminarVotanteAdmin(idVotante) {
    if (!confirm('¿Está seguro de eliminar este votante? Se eliminarán todos sus registros.')) return;

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/delete_votante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_votante: idVotante })
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Votante eliminado correctamente');
            await cargarTodosVotantes();
        } else {
            alert('Error: ' + (data.error || data.message));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar votante');
    }
}

// ======================================
// CARGAR CANDIDATOS PARA ADMIN
// ======================================
async function cargarCandidatosAdmin() {
    try {
        const apiUrl = `${window.location.origin}/sistema_votacion/votaciones/api/obtener_candidatos.php?t=${Date.now()}`;
        const response = await fetch(apiUrl, { cache: 'no-store' });
        const data = await response.json();

        if (data.success) {
            mostrarListaCandidatos('personeros', data.personeros);
            mostrarListaCandidatos('contralores', data.contralores);
        }

        return data;
    } catch (error) {
        console.error('Error al cargar candidatos:', error);
        return null;
    }
}

// ======================================
// MOSTRAR LISTA DE CANDIDATOS
// ======================================
function mostrarListaCandidatos(tipo, candidatos) {
    const elementId = tipo === 'personeros' ? 'listaPersoneros' : 'listaContralores';
    const containerDiv = document.getElementById(elementId);
    containerDiv.innerHTML = '';

    if (candidatos.length === 0) {
        containerDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-style: italic;">No hay candidatos registrados</p>';
        return;
    }

    candidatos.forEach(candidato => {
        const item = document.createElement('div');
        item.className = 'candidato-item';
        
        // Crear elemento de foto
        const fotoDiv = document.createElement('div');
        fotoDiv.style.display = 'flex';
        fotoDiv.style.alignItems = 'center';
        fotoDiv.style.flex = '1';
        
        if (candidato.foto) {
            const fotoImg = document.createElement('img');
            fotoImg.src = candidato.foto;
            fotoImg.alt = candidato.nombre;
            fotoImg.className = 'candidato-foto';
            fotoDiv.appendChild(fotoImg);
        } else {
            const fotoPlaceholder = document.createElement('div');
            fotoPlaceholder.className = 'candidato-foto sin-foto';
            fotoPlaceholder.innerHTML = '<i class="fas fa-user"></i>';
            fotoDiv.appendChild(fotoPlaceholder);
        }
        
        // Crear elemento de información
        const infoDiv = document.createElement('div');
        infoDiv.className = 'candidato-info';
        infoDiv.innerHTML = `
            <strong>${candidato.nombre}</strong>
            <small>Cargo: ${candidato.cargo || (tipo === 'personeros' ? 'Personero' : 'Contralor')}</small>
            <small>Número: ${candidato.numero}</small>
        `;
        fotoDiv.appendChild(infoDiv);
        
        // Crear botón eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.onclick = () => eliminarCandidato(candidato.id_candidato, tipo);
        
        item.appendChild(fotoDiv);
        item.appendChild(btnEliminar);
        containerDiv.appendChild(item);
    });
}

// ======================================
// AGREGAR CANDIDATO PERSONERO
// ======================================
async function agregarCandidatoPersonero() {
    await agregarCandidato('Personero');
    document.getElementById('nombrePersonero').value = '';
    document.getElementById('numeroPersonero').value = '';
}

// ======================================
// AGREGAR CANDIDATO CONTRALOR
// ======================================
async function agregarCandidatoContralor() {
    await agregarCandidato('Contralor');
    document.getElementById('nombreContralor').value = '';
    document.getElementById('numeroContralor').value = '';
}

// ======================================
// AGREGAR CANDIDATO GENERAL
// ======================================
async function agregarCandidato(cargo) {
    const nombre = cargo === 'Personero' 
        ? document.getElementById('nombrePersonero').value.trim()
        : document.getElementById('nombreContralor').value.trim();
    const numero = cargo === 'Personero'
        ? document.getElementById('numeroPersonero').value.trim()
        : document.getElementById('numeroContralor').value.trim();
    const fotoInput = cargo === 'Personero'
        ? document.getElementById('fotoPersonero')
        : document.getElementById('fotoContralor');

    if (!nombre || !numero) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        // Crear FormData para enviar archivos
        const formData = new FormData();
        formData.append('cargo', cargo);
        formData.append('nombre', nombre);
        formData.append('numero', numero);
        
        // Agregar imagen si existe
        if (fotoInput.files.length > 0) {
            formData.append('foto', fotoInput.files[0]);
        }

        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/add_candidato.php', {
            method: 'POST',
            body: formData
            // No establecer Content-Type, el navegador lo hace automáticamente
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Candidato agregado correctamente');
            // Limpiar campos
            document.getElementById('nombrePersonero').value = '';
            document.getElementById('numeroPersonero').value = '';
            document.getElementById('fotoPersonero').value = '';
            document.getElementById('nombreContralor').value = '';
            document.getElementById('numeroContralor').value = '';
            document.getElementById('fotoContralor').value = '';
            await cargarCandidatosAdmin();
            notificarActualizacionCandidatos();
        } else {
            alert('Error: ' + data.error || data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar candidato');
    }
}

// ======================================
// ELIMINAR CANDIDATO
// ======================================
async function eliminarCandidato(idCandidato, tipo) {
    if (!confirm('¿Está seguro de eliminar este candidato? Se eliminarán todos sus registros.')) return;

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/delete_candidato.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_candidato: idCandidato })
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Candidato eliminado correctamente');
            await cargarCandidatosAdmin();
            notificarActualizacionCandidatos();
        } else {
            alert('Error: ' + (data.error || data.message || 'No se pudo eliminar el candidato'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar candidato');
    }
}

// ======================================
// ACTUALIZAR FECHA DE VOTACIÓN
// ======================================
async function actualizarFechaVotacion() {
    const fecha = document.getElementById('fechaVotacionInput').value;

    if (!fecha) {
        alert('Por favor selecciona una fecha');
        return;
    }

    try {
        localStorage.setItem('fechaVotacion', fecha);
        alert('✓ Fecha actualizada correctamente');
    } catch (error) {
        alert('Error al actualizar fecha');
    }
}

function cargarFechaVotacionEnSistema() {
    const input = document.getElementById('fechaVotacionInput');
    if (!input) return;

    const fechaGuardada = localStorage.getItem('fechaVotacion');
    if (!fechaGuardada) return;

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fechaGuardada)) {
        input.value = fechaGuardada;
        return;
    }

    const fecha = new Date(fechaGuardada);
    if (Number.isNaN(fecha.getTime())) return;

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    input.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ======================================
// CARGAR Y MOSTRAR RESULTADOS
// ======================================
async function cargarResultados() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/votaciones/api/obtener_consolidado.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            mostrarResultadosAdmin(data);
        }
    } catch (error) {
        console.error('Error al cargar resultados:', error);
    }
}

// ======================================
// MOSTRAR RESULTADOS EN ADMIN
// ======================================
function mostrarResultadosAdmin(data) {
    const resumenDiv = document.getElementById('resumenResultados');
    let html = '';

    // Personeros
    html += '<div class="resultado-cargo-admin">';
    html += '<h4>🎓 Resultados Personero Estudiantil</h4>';
    data.personeros.forEach(p => {
        html += `
            <div class="resultado-item-admin">
                <span>${p.nombre} (#${p.numero})</span>
                <span class="votos-count">${p.total_votos} votos</span>
            </div>
        `;
    });
    if (data.votos_blanco_personero > 0) {
        html += `
            <div class="resultado-item-admin">
                <span>Voto en Blanco</span>
                <span class="votos-count">${data.votos_blanco_personero} votos</span>
            </div>
        `;
    }
    html += '</div>';

    // Contralores
    html += '<div class="resultado-cargo-admin">';
    html += '<h4>⚖️ Resultados Contralor Estudiantil</h4>';
    data.contralores.forEach(c => {
        html += `
            <div class="resultado-item-admin">
                <span>${c.nombre} (#${c.numero})</span>
                <span class="votos-count">${c.total_votos} votos</span>
            </div>
        `;
    });
    if (data.votos_blanco_contralor > 0) {
        html += `
            <div class="resultado-item-admin">
                <span>Voto en Blanco</span>
                <span class="votos-count">${data.votos_blanco_contralor} votos</span>
            </div>
        `;
    }
    html += '</div>';

    // Resumen General
    html += '<div class="resultado-cargo-admin">';
    html += '<h4>📊 Resumen General</h4>';
    html += `
        <div class="resultado-item-admin">
            <span>Total de votantes registrados</span>
            <span class="votos-count">${data.total_registrados}</span>
        </div>
        <div class="resultado-item-admin">
            <span>Total que votaron</span>
            <span class="votos-count">${data.total_votaron}</span>
        </div>
        <div class="resultado-item-admin">
            <span>Participación</span>
            <span class="votos-count">${data.total_registrados > 0 ? Math.round((data.total_votaron / data.total_registrados) * 100) : 0}%</span>
        </div>
    `;
    html += '</div>';

    resumenDiv.innerHTML = html;
}

// ======================================
// EXPORTAR RESULTADOS A EXCEL
// ======================================
async function exportarResultadosExcel() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/votaciones/api/obtener_consolidado.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            const datosExcel = [];

            // Personeros
            datosExcel.push(['PERSONERO ESTUDIANTIL']);
            data.personeros.forEach(p => {
                datosExcel.push([p.nombre, p.numero, p.total_votos]);
            });
            datosExcel.push(['Voto en Blanco', '', data.votos_blanco_personero]);
            datosExcel.push([]);

            // Contralores
            datosExcel.push(['CONTRALOR ESTUDIANTIL']);
            data.contralores.forEach(c => {
                datosExcel.push([c.nombre, c.numero, c.total_votos]);
            });
            datosExcel.push(['Voto en Blanco', '', data.votos_blanco_contralor]);
            datosExcel.push([]);

            // Resumen
            datosExcel.push(['RESUMEN GENERAL']);
            datosExcel.push(['Total registrados', data.total_registrados]);
            datosExcel.push(['Total votaron', data.total_votaron]);
            datosExcel.push(['Participación', Math.round((data.total_votaron / data.total_registrados) * 100) + '%']);

            const ws = XLSX.utils.aoa_to_sheet(datosExcel);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
            XLSX.writeFile(wb, 'Resultados_Votacion.xlsx');
        }
    } catch (error) {
        alert('Error al exportar resultados');
        console.error('Error:', error);
    }
}

async function exportarRegistroMesaExcel() {
    try {
        const apiUrl = `${window.location.origin}/sistema_votacion/votaciones/api/obtener_registro_mesa.php?t=${Date.now()}`;
        const response = await fetch(apiUrl, { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.error || 'No fue posible obtener el registro de mesa');
            return;
        }

        if (!Array.isArray(data.registros) || data.registros.length === 0) {
            alert('No hay registros de mesa para descargar');
            return;
        }

        const datosExcel = [
            ['ID', 'Acción', 'Usuario Sesión', 'Profesor Nombre', 'Profesor Materia', 'Puesto Votación', 'Profesor Teléfono', 'Jurado Nombre', 'Jurado Grado', 'Fecha Registro']
        ];

        data.registros.forEach((fila) => {
            datosExcel.push([
                fila.id || '',
                fila.accion || '',
                fila.usuario_sesion || '',
                fila.profesor_nombre || '',
                fila.profesor_materia || '',
                fila.puesto_votacion || '',
                fila.profesor_telefono || '',
                fila.jurado_nombre || '',
                fila.jurado_grado || '',
                fila.fecha_registro || ''
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(datosExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'RegistroMesa');

        const fecha = new Date();
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        XLSX.writeFile(wb, `Registro_Mesa_${yyyy}${mm}${dd}.xlsx`);
    } catch (error) {
        alert('Error al descargar registro de mesa');
        console.error('Error:', error);
    }
}

async function exportarRegistroMesaCSV() {
    try {
        const apiUrl = `${window.location.origin}/sistema_votacion/votaciones/api/obtener_registro_mesa.php?t=${Date.now()}`;
        const response = await fetch(apiUrl, { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.error || 'No fue posible obtener el registro de mesa');
            return;
        }

        if (!Array.isArray(data.registros) || data.registros.length === 0) {
            alert('No hay registros de mesa para descargar');
            return;
        }

        const encabezados = [
            'ID',
            'Acción',
            'Usuario Sesión',
            'Profesor Nombre',
            'Profesor Materia',
            'Puesto Votación',
            'Profesor Teléfono',
            'Jurado Nombre',
            'Jurado Grado',
            'Fecha Registro'
        ];

        const escaparCSV = (valor) => {
            const texto = String(valor ?? '');
            return `"${texto.replace(/"/g, '""')}"`;
        };

        const filas = data.registros.map((fila) => [
            fila.id || '',
            fila.accion || '',
            fila.usuario_sesion || '',
            fila.profesor_nombre || '',
            fila.profesor_materia || '',
            fila.puesto_votacion || '',
            fila.profesor_telefono || '',
            fila.jurado_nombre || '',
            fila.jurado_grado || '',
            fila.fecha_registro || ''
        ]);

        const contenidoCSV = [encabezados, ...filas]
            .map((fila) => fila.map(escaparCSV).join(','))
            .join('\n');

        const fecha = new Date();
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');

        const blob = new Blob([`\uFEFF${contenidoCSV}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `Registro_Mesa_${yyyy}${mm}${dd}.csv`;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('Error al descargar registro de mesa en CSV');
        console.error('Error:', error);
    }
}

async function exportarRegistroMesaPDF() {
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('No fue posible cargar el generador de PDF');
            return;
        }

        const [respMesa, respResultados, respConsolidado] = await Promise.all([
            fetch(`${window.location.origin}/sistema_votacion/votaciones/api/obtener_registro_mesa.php?t=${Date.now()}`, { cache: 'no-store' }),
            fetch(`${window.location.origin}/sistema_votacion/votaciones/api/obtener_resultados_votos.php?t=${Date.now()}`, { cache: 'no-store' }),
            fetch(`${window.location.origin}/sistema_votacion/votaciones/api/obtener_consolidado.php?t=${Date.now()}`, { cache: 'no-store' })
        ]);

        const dataMesa = await respMesa.json();
        const dataResultados = await respResultados.json();
        const dataConsolidado = await respConsolidado.json();

        if (!respMesa.ok || !dataMesa.success) {
            alert(dataMesa.error || 'No fue posible obtener el registro de mesa');
            return;
        }

        if (!Array.isArray(dataMesa.registros) || dataMesa.registros.length === 0) {
            alert('No hay registros de mesa para descargar');
            return;
        }

        const votosBlancoPersonero = dataConsolidado?.success
            ? Number(dataConsolidado.votos_blanco_personero || 0)
            : 0;

        const votosBlancoContralor = dataConsolidado?.success
            ? Number(dataConsolidado.votos_blanco_contralor || 0)
            : 0;

        const totalPersonero = dataConsolidado?.success
            ? (Array.isArray(dataConsolidado.personeros)
                ? dataConsolidado.personeros.reduce((acumulado, item) => acumulado + Number(item.total_votos || 0), 0)
                : 0) + votosBlancoPersonero
            : 0;

        const totalContralor = dataConsolidado?.success
            ? (Array.isArray(dataConsolidado.contralores)
                ? dataConsolidado.contralores.reduce((acumulado, item) => acumulado + Number(item.total_votos || 0), 0)
                : 0) + votosBlancoContralor
            : 0;

        const totalVotosEnBlanco = votosBlancoPersonero + votosBlancoContralor;

        const obtenerResultadoFinalCargo = (candidatosCargo, votosBlanco) => {
            const lista = Array.isArray(candidatosCargo)
                ? candidatosCargo.map((item) => ({
                    nombre: String(item.nombre || '').trim() || 'Sin nombre',
                    votos: Number(item.total_votos || 0)
                }))
                : [];

            lista.push({ nombre: 'Voto en Blanco', votos: Number(votosBlanco || 0) });

            const votosMaximos = lista.reduce((maximo, actual) => Math.max(maximo, actual.votos), 0);
            if (votosMaximos <= 0) return 'Sin votos registrados';

            const ganadores = lista.filter((item) => item.votos === votosMaximos);
            if (ganadores.length > 1) {
                return `Empate: ${ganadores.map((item) => `${item.nombre} (${item.votos})`).join(' / ')}`;
            }

            return `${ganadores[0].nombre} (${ganadores[0].votos} votos)`;
        };

        const resultadoFinalPersonero = obtenerResultadoFinalCargo(
            dataConsolidado.personeros,
            votosBlancoPersonero
        );

        const resultadoFinalContralor = obtenerResultadoFinalCargo(
            dataConsolidado.contralores,
            votosBlancoContralor
        );

        const fechaHoraGeneracion = obtenerFechaHoraLocalSistema();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

        doc.setFontSize(14);
        doc.text('Registro de Mesa de Votación', 40, 40);

        doc.setFontSize(10);
        doc.text(`Fecha y hora de generación: ${fechaHoraGeneracion}`, 40, 60);
        doc.text(`Total votos en blanco: ${totalVotosEnBlanco}`, 40, 76);
        doc.text(`Total votos Personeros: ${totalPersonero}`, 40, 92);
        doc.text(`Total votos Contralores: ${totalContralor}`, 40, 108);
        doc.text(`Actualizado en resultados: ${dataResultados?.actualizado_en || 'N/D'}`, 40, 124);
        doc.text('Resultado final en tiempo real:', 40, 140);
        doc.text(`Personero: ${resultadoFinalPersonero}`, 52, 156);
        doc.text(`Contralor: ${resultadoFinalContralor}`, 52, 172);

        const nombresPersoneros = dataConsolidado?.success && Array.isArray(dataConsolidado.personeros)
            ? dataConsolidado.personeros
                .map((item) => String(item.nombre || '').trim())
                .filter((nombre) => nombre !== '')
            : [];

        const nombresContralores = dataConsolidado?.success && Array.isArray(dataConsolidado.contralores)
            ? dataConsolidado.contralores
                .map((item) => String(item.nombre || '').trim())
                .filter((nombre) => nombre !== '')
            : [];

        const cantidadFilasNombres = Math.max(nombresPersoneros.length, nombresContralores.length, 1);
        const filasNombres = Array.from({ length: cantidadFilasNombres }, (_, indice) => [
            nombresPersoneros[indice] || '',
            nombresContralores[indice] || ''
        ]);

        if (nombresPersoneros.length === 0 && nombresContralores.length === 0) {
            filasNombres[0] = ['Sin registros', 'Sin registros'];
        }

        doc.setFontSize(10);
        doc.text('Nombres completos de candidatos', 40, 188);

        doc.autoTable({
            startY: 196,
            head: [['Personeros', 'Contralores']],
            body: filasNombres,
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [46, 125, 50] },
            margin: { left: 20, right: 20 }
        });

        const inicioTablaRegistroMesa = (doc.lastAutoTable?.finalY || 196) + 18;

        const filasTabla = dataMesa.registros.map((fila) => [
            fila.id || '',
            fila.accion || '',
            fila.usuario_sesion || '',
            fila.profesor_nombre || '',
            fila.profesor_materia || '',
            fila.puesto_votacion || '',
            fila.profesor_telefono || '',
            fila.jurado_nombre || '',
            fila.jurado_grado || '',
            fila.fecha_registro || ''
        ]);

        doc.autoTable({
            startY: inicioTablaRegistroMesa,
            head: [[
                'ID',
                'Acción',
                'Usuario Sesión',
                'Profesor',
                'Materia',
                'Puesto',
                'Teléfono',
                'Jurado',
                'Grado',
                'Fecha Registro'
            ]],
            body: filasTabla,
            styles: { fontSize: 8, cellPadding: 4 },
            headStyles: { fillColor: [46, 125, 50] },
            margin: { left: 20, right: 20 }
        });

        const altoPagina = doc.internal.pageSize.getHeight();
        let yFirmas = (doc.lastAutoTable?.finalY || inicioTablaRegistroMesa) + 50;

        if (yFirmas > altoPagina - 90) {
            doc.addPage();
            yFirmas = 120;
        }

        const margenIzquierdo = 40;
        const margenDerecho = 40;
        const anchoContenido = doc.internal.pageSize.getWidth() - margenIzquierdo - margenDerecho;
        const centroIzquierdo = margenIzquierdo + (anchoContenido * 0.25);
        const centroDerecho = margenIzquierdo + (anchoContenido * 0.75);
        const anchoLineaFirma = 180;

        doc.setDrawColor(80, 80, 80);
        doc.line(centroIzquierdo - (anchoLineaFirma / 2), yFirmas, centroIzquierdo + (anchoLineaFirma / 2), yFirmas);
        doc.line(centroDerecho - (anchoLineaFirma / 2), yFirmas, centroDerecho + (anchoLineaFirma / 2), yFirmas);

        doc.setFontSize(10);
        doc.text('TESTIGO ELECTORAL', centroIzquierdo, yFirmas + 14, { align: 'center' });
        doc.text('RECTOR I.E', centroDerecho, yFirmas + 14, { align: 'center' });

        const fecha = new Date();
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        doc.save(`Registro_Mesa_${yyyy}${mm}${dd}.pdf`);
    } catch (error) {
        alert('Error al descargar registro de mesa en PDF');
        console.error('Error:', error);
    }
}

// ======================================
// REINICIAR VOTACIÓN
// ======================================
function reiniciarVotacionSistema() {
    abrirModalReinicioVotacion();
}

function validarCredencialesReinicio(usuario, password) {
    if (!usuario || !password) {
        return 'Debes ingresar usuario y contraseña';
    }

    if (usuario.length > 100 || password.length > 100) {
        return 'Credenciales inválidas';
    }

    if (!/^[A-Za-z0-9._@-]{3,100}$/.test(usuario)) {
        return 'Usuario inválido';
    }

    return null;
}

function abrirModalReinicioVotacion() {
    const modal = document.getElementById('modalReinicioVotacion');
    const usuarioInput = document.getElementById('usuarioAdministradorReinicio');
    const passwordInput = document.getElementById('passwordAdministradorReinicio');
    const mensaje = document.getElementById('mensajeReinicioVotacion');
    const btnConfirmar = document.getElementById('btnConfirmarReinicioVotacion');

    if (!modal || !usuarioInput || !passwordInput) return;

    usuarioInput.value = '';
    passwordInput.value = '';
    if (mensaje) {
        mensaje.style.display = 'none';
        mensaje.textContent = '';
    }
    if (btnConfirmar) {
        btnConfirmar.disabled = false;
    }

    segundosReinicioVotacion = 30;
    actualizarTextoTimerReinicio();

    modal.classList.remove('hidden');
    usuarioInput.focus();

    if (temporizadorReinicioVotacion) {
        clearInterval(temporizadorReinicioVotacion);
    }

    temporizadorReinicioVotacion = setInterval(() => {
        segundosReinicioVotacion -= 1;
        actualizarTextoTimerReinicio();

        if (segundosReinicioVotacion <= 0) {
            cerrarModalReinicioVotacion();
            alert('Tiempo agotado. Vuelve a intentarlo.');
        }
    }, 1000);
}

function actualizarTextoTimerReinicio() {
    const timer = document.getElementById('timerReinicioVotacion');
    if (!timer) return;
    timer.textContent = `Tiempo restante: ${segundosReinicioVotacion}s`;
}

function cerrarModalReinicioVotacion() {
    const modal = document.getElementById('modalReinicioVotacion');
    const usuarioInput = document.getElementById('usuarioAdministradorReinicio');
    const passwordInput = document.getElementById('passwordAdministradorReinicio');
    const mensaje = document.getElementById('mensajeReinicioVotacion');
    const btnConfirmar = document.getElementById('btnConfirmarReinicioVotacion');

    if (temporizadorReinicioVotacion) {
        clearInterval(temporizadorReinicioVotacion);
        temporizadorReinicioVotacion = null;
    }

    if (modal) modal.classList.add('hidden');
    if (usuarioInput) usuarioInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (mensaje) {
        mensaje.style.display = 'none';
        mensaje.textContent = '';
        mensaje.style.color = '#666';
    }
    if (btnConfirmar) {
        btnConfirmar.disabled = false;
    }
}

function mostrarMensajeModalReinicio(texto, esError = false) {
    const mensaje = document.getElementById('mensajeReinicioVotacion');
    if (!mensaje) return;

    mensaje.style.display = 'block';
    mensaje.textContent = texto;
    mensaje.style.color = esError ? '#dc3545' : '#2e7d32';
}

function limpiarEstadoDespuesDeReinicio() {
    document.querySelectorAll('input').forEach(input => {
        if (input.type !== 'button' && input.type !== 'submit' && input.type !== 'reset') {
            input.value = '';
        }
    });

    try {
        sessionStorage.clear();
        localStorage.clear();
    } catch (error) {
        console.warn('No se pudo limpiar storage:', error);
    }

    if (typeof caches !== 'undefined' && caches.keys) {
        caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).catch(() => {});
    }

    try {
        history.replaceState(null, '', window.location.pathname);
    } catch (error) {
        console.warn('No se pudo limpiar historial:', error);
    }
}

async function confirmarReinicioVotacionSistema() {
    const usuarioInput = document.getElementById('usuarioAdministradorReinicio');
    const passwordInput = document.getElementById('passwordAdministradorReinicio');
    const btnConfirmar = document.getElementById('btnConfirmarReinicioVotacion');

    if (!usuarioInput || !passwordInput) return;
    if (btnConfirmar && btnConfirmar.disabled) return;

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value;

    const errorCredenciales = validarCredencialesReinicio(usuario, password);
    if (errorCredenciales) {
        mostrarMensajeModalReinicio(errorCredenciales, true);
        return;
    }

    if (btnConfirmar) {
        btnConfirmar.disabled = true;
    }

    mostrarMensajeModalReinicio('Validando credenciales...');

    try {
        const validarResponse = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/validar_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_adminstrador: usuario,
                password_adminstrador: password
            })
        });

        const validarData = await validarResponse.json();

        if (!validarResponse.ok || !validarData.success) {
            mostrarMensajeModalReinicio(validarData.error || 'Credenciales inválidas', true);
            passwordInput.value = '';
            return;
        }

        mostrarMensajeModalReinicio('Reiniciando votación...');

        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/reiniciar_votacion.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_adminstrador: usuario,
                password_adminstrador: password
            })
        });

        const data = await response.json();

        if (data.success) {
            cerrarModalReinicioVotacion();
            limpiarEstadoDespuesDeReinicio();
            alert('✓ Votación reiniciada correctamente');
            await cargarResultados();
        } else {
            mostrarMensajeModalReinicio('Error: ' + (data.error || data.message || 'No se pudo reiniciar'), true);
            passwordInput.value = '';
        }
    } catch (error) {
        mostrarMensajeModalReinicio('Error al reiniciar votación', true);
        passwordInput.value = '';
        console.error('Error:', error);
    } finally {
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
        }
    }
}

// ======================================
// VERIFICAR CÓDIGO DE VOTANTE
// ======================================
async function verificarCodigo() {
    const codigo = document.getElementById('codigoVotante').value.trim();

    if (!codigo) {
        alert('Por favor ingresa tu código de votante');
        return;
    }

    try {
        await cargarCandidatos();

        const apiUrl = window.location.origin + '/sistema_votacion/votaciones/api/validar_votante.php';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_votante: codigo })
        });

        const data = await response.json();

        if (data.success) {
            votanteActual = data.votante;
            document.getElementById('nombreVotante').textContent = votanteActual.nombre;
            document.getElementById('votanteInfo').classList.remove('hidden');
            
            // Cargar candidatos en la interfaz
            cargarCandidatosInterfaz();
            iniciarActualizacionCandidatosVotacion();
        } else {
            alert(data.message || 'Votante no encontrado o ya ha votado');
            document.getElementById('codigoVotante').value = '';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al verificar el código');
    }
}

// ======================================
// CARGAR CANDIDATOS EN LA INTERFAZ
// ======================================
function cargarCandidatosInterfaz() {
    const seleccionPersoneroActual = document.querySelector('input[name="personero"]:checked')?.value || null;
    const seleccionContralorActual = document.querySelector('input[name="contralor"]:checked')?.value || null;

    // Personeros
    const personeroContainer = document.getElementById('candidatosPersonero');
    personeroContainer.innerHTML = '';
    
    candidatos.personeros.forEach(candidato => {
        const label = document.createElement('label');
        label.className = 'candidato-option';

        const fotoHtml = candidato.foto
            ? `<img src="${candidato.foto}" alt="${candidato.nombre}" class="candidato-option-foto">`
            : '<span class="candidato-option-foto candidato-option-foto-placeholder"><i class="fas fa-user"></i></span>';

        label.innerHTML = `
            <input type="radio" name="personero" value="${candidato.id_candidato}" data-nombre="${candidato.nombre}">
            <span class="candidato-option-contenido">
                ${fotoHtml}
                <span class="candidato-option-texto">
                    <strong>${candidato.numero} - ${candidato.nombre}</strong>
                    <small>${candidato.cargo || 'Personero'}</small>
                </span>
            </span>
        `;
        personeroContainer.appendChild(label);
    });

    if (seleccionPersoneroActual) {
        const radioPersonero = document.querySelector(`input[name="personero"][value="${seleccionPersoneroActual}"]`);
        if (radioPersonero) {
            radioPersonero.checked = true;
        } else if (seleccionPersoneroActual === 'blanco') {
            const votoBlancoPersonero = document.querySelector('input[name="personero"][value="blanco"]');
            if (votoBlancoPersonero) votoBlancoPersonero.checked = true;
        }
    }

    // Contralores
    const contralorContainer = document.getElementById('candidatosContralor');
    contralorContainer.innerHTML = '';
    
    candidatos.contralores.forEach(candidato => {
        const label = document.createElement('label');
        label.className = 'candidato-option';

        const fotoHtml = candidato.foto
            ? `<img src="${candidato.foto}" alt="${candidato.nombre}" class="candidato-option-foto">`
            : '<span class="candidato-option-foto candidato-option-foto-placeholder"><i class="fas fa-user"></i></span>';

        label.innerHTML = `
            <input type="radio" name="contralor" value="${candidato.id_candidato}" data-nombre="${candidato.nombre}">
            <span class="candidato-option-contenido">
                ${fotoHtml}
                <span class="candidato-option-texto">
                    <strong>${candidato.numero} - ${candidato.nombre}</strong>
                    <small>${candidato.cargo || 'Contralor'}</small>
                </span>
            </span>
        `;
        contralorContainer.appendChild(label);
    });

    if (seleccionContralorActual) {
        const radioContralor = document.querySelector(`input[name="contralor"][value="${seleccionContralorActual}"]`);
        if (radioContralor) {
            radioContralor.checked = true;
        } else if (seleccionContralorActual === 'blanco') {
            const votoBlancoContralor = document.querySelector('input[name="contralor"][value="blanco"]');
            if (votoBlancoContralor) votoBlancoContralor.checked = true;
        }
    }
}

function detenerActualizacionCandidatosVotacion() {
    if (window.__intervaloCandidatosVotacion) {
        clearInterval(window.__intervaloCandidatosVotacion);
        window.__intervaloCandidatosVotacion = null;
    }
}

async function refrescarCandidatosVotacionManteniendoSeleccion() {
    return;
}

function iniciarActualizacionCandidatosVotacion() {
    detenerActualizacionCandidatosVotacion();
    // Sin verificación periódica para evitar carga al servidor.
}

// ======================================
// ENVIAR VOTO
// ======================================
async function enviarVoto() {
    if (!votanteActual) {
        alert('Debes verificar tu código primero');
        return;
    }

    const personeroRadios = document.querySelectorAll('input[name="personero"]:checked');
    const contralorRadios = document.querySelectorAll('input[name="contralor"]:checked');

    if (personeroRadios.length === 0 || contralorRadios.length === 0) {
        alert('Debes seleccionar candidatos para ambos cargos');
        return;
    }

    const idPersonero = personeroRadios[0].value === 'blanco' ? 0 : parseInt(personeroRadios[0].value);
    const idContralor = contralorRadios[0].value === 'blanco' ? 0 : parseInt(contralorRadios[0].value);

    try {
        // Registrar ambos votos en una transacción
        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/registrar_votos_completo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_votante: votanteActual.id_votante,
                id_personero: idPersonero,
                id_contralor: idContralor
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || 'Error al registrar el voto');
            return;
        }

        alert('¡Voto registrado exitosamente!');
        
        // Limpiar interfaz
        document.getElementById('codigoVotante').value = '';
        document.getElementById('votanteInfo').classList.add('hidden');
        document.getElementById('nombreVotante').textContent = '';
        votanteActual = null;
        detenerActualizacionCandidatosVotacion();

        // Mostrar resultados preliminares
        setTimeout(() => {
            mostrarResultadosPreliminares();
        }, 1000);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar voto');
    }
}

// ======================================
// RESULTADOS ADMIN DESDE TABLA VOTOS (TIEMPO REAL)
// ======================================
window.__intervaloResultadosAdmin = null;

function obtenerFechaHoraLocalSistema() {
    return new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

function detenerActualizacionResultadosAdmin() {
    if (window.__intervaloResultadosAdmin) {
        clearInterval(window.__intervaloResultadosAdmin);
        window.__intervaloResultadosAdmin = null;
    }
}

function detenerActualizacionCandidatosAdmin() {
    if (window.__intervaloCandidatosAdmin) {
        clearInterval(window.__intervaloCandidatosAdmin);
        window.__intervaloCandidatosAdmin = null;
    }
}

async function cargarTabCandidatos() {
    const listaPersoneros = document.getElementById('listaPersoneros');
    const listaContralores = document.getElementById('listaContralores');

    if (!listaPersoneros || !listaContralores) return;

    if (listaPersoneros.innerHTML.trim() === '' && listaContralores.innerHTML.trim() === '') {
        const mensajeCarga = '<p style="text-align: center; color: #666; padding: 20px;">Cargando candidatos desde base de datos...</p>';
        listaPersoneros.innerHTML = mensajeCarga;
        listaContralores.innerHTML = mensajeCarga;
    }

    const data = await cargarCandidatosAdmin();
    if (!data || !data.success) {
        const mensajeError = '<p style="text-align: center; color: #dc3545; padding: 20px;">Error al cargar candidatos</p>';
        listaPersoneros.innerHTML = mensajeError;
        listaContralores.innerHTML = mensajeError;
    }
}

function iniciarActualizacionCandidatosAdmin() {
    detenerActualizacionCandidatosAdmin();
    cargarTabCandidatos();
}

function abrirTabResultados() {
    document.getElementById('votingArea')?.classList.add('hidden');
    document.getElementById('preliminaresArea')?.classList.add('hidden');
    document.getElementById('configArea')?.classList.remove('hidden');
    mostrarTab('resultados');
}

function mostrarTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    const idTab = {
        votantes: 'tabVotantes',
        candidatos: 'tabCandidatos',
        sistema: 'tabSistema',
        resultados: 'tabResultados'
    }[tab];

    if (idTab) document.getElementById(idTab)?.classList.remove('hidden');

    const btn = Array.from(document.querySelectorAll('.tab-btn'))
        .find(b => (b.getAttribute('onclick') || '').includes(`'${tab}'`));
    if (btn) btn.classList.add('active');

    if (tab === 'resultados') {
        detenerActualizacionCandidatosAdmin();
        cargarTabResultados();
        detenerActualizacionResultadosAdmin();
    } else if (tab === 'candidatos') {
        detenerActualizacionResultadosAdmin();
        iniciarActualizacionCandidatosAdmin();
    } else if (tab === 'votantes') {
        detenerActualizacionCandidatosAdmin();
        detenerActualizacionResultadosAdmin();
        const listaDiv = document.getElementById('listaVotantesDiv');
        if (listaDiv) {
            listaDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Cargando votantes desde base de datos...</p>';
        }
        cargarTodosVotantes();
    } else if (tab === 'sistema') {
        detenerActualizacionCandidatosAdmin();
        detenerActualizacionResultadosAdmin();
        cargarFechaVotacionEnSistema();
    } else {
        detenerActualizacionCandidatosAdmin();
        detenerActualizacionResultadosAdmin();
    }
}

async function cargarTabResultados() {
    const cont = document.getElementById('resumenResultados');
    if (!cont) return;

    try {
        const [resResultados, resConsolidado] = await Promise.all([
            fetch(`${window.location.origin}/sistema_votacion/votaciones/api/obtener_resultados_votos.php?t=${Date.now()}`, { cache: 'no-store' }),
            fetch(`${window.location.origin}/sistema_votacion/votaciones/api/obtener_consolidado.php?t=${Date.now()}`, { cache: 'no-store' })
        ]);

        const data = await resResultados.json();
        const consolidado = await resConsolidado.json();

        if (!data.success || !consolidado.success) {
            cont.innerHTML = '<p>Error al cargar resultados.</p>';
            return;
        }

        if (!data.resultados || data.resultados.length === 0) {
            cont.innerHTML = '<p>No hay votos registrados todavía.</p>';
            return;
        }

        const obtenerResultadoFinalCargo = (candidatosCargo, votosBlanco) => {
            const lista = Array.isArray(candidatosCargo)
                ? candidatosCargo.map(item => ({
                    nombre: String(item.nombre || '').trim() || 'Sin nombre',
                    votos: Number(item.total_votos || 0)
                }))
                : [];

            lista.push({ nombre: 'Voto en Blanco', votos: Number(votosBlanco || 0) });

            const votosMaximos = lista.reduce((maximo, actual) => Math.max(maximo, actual.votos), 0);
            if (votosMaximos <= 0) return 'Sin votos registrados';

            const ganadores = lista.filter(item => item.votos === votosMaximos);
            if (ganadores.length > 1) {
                return `Empate: ${ganadores.map(item => `${item.nombre} (${item.votos})`).join(' / ')}`;
            }

            return `${ganadores[0].nombre} (${ganadores[0].votos} votos)`;
        };

        const resultadoFinalPersonero = obtenerResultadoFinalCargo(
            consolidado.personeros,
            consolidado.votos_blanco_personero
        );

        const resultadoFinalContralor = obtenerResultadoFinalCargo(
            consolidado.contralores,
            consolidado.votos_blanco_contralor
        );

        let html = `
            <div class="resultado-cargo-admin">
                <h4>🏁 Resultado final de la votación en tiempo real</h4>
                <div class="resultado-item-admin">
                    <span><strong>Personero:</strong> ${resultadoFinalPersonero}</span>
                </div>
                <div class="resultado-item-admin">
                    <span><strong>Contralor:</strong> ${resultadoFinalContralor}</span>
                </div>
            </div>

            <div class="resultado-cargo-admin">
                <h4>📊 Consolidado de la tabla votos</h4>
                <div class="resultado-item-admin" style="font-weight: 600; background: #f7f7f7;">
                    <span>ID</span>
                    <span>Nombre</span>
                    <span>Total Votos</span>
                </div>
        `;

        data.resultados.forEach(item => {
            html += `
                <div class="resultado-item-admin" style="display: grid; grid-template-columns: 80px 1fr 140px; gap: 10px;">
                    <span>${item.id === null ? '-' : item.id}</span>
                    <span>${item.nombre}</span>
                    <span class="votos-count" style="justify-self: end;">${item.total_votos}</span>
                </div>
            `;
        });

        html += `<p style="margin-top: 12px; color: #666; font-size: 12px;">Actualizado: ${obtenerFechaHoraLocalSistema()}</p>`;
        html += '</div>';
        cont.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar resultados de votos:', error);
        cont.innerHTML = '<p>Error de conexión al obtener resultados.</p>';
    }
}

function volverVotacion() {
    detenerActualizacionResultadosAdmin();
    detenerActualizacionCandidatosAdmin();
    document.getElementById('configArea').classList.add('hidden');
    document.getElementById('votingArea').classList.remove('hidden');
}

// ======================================
// MOSTRAR RESULTADOS PRELIMINARES
// ======================================
async function mostrarResultadosPreliminares() {
    document.getElementById('votingArea').classList.add('hidden');
    document.getElementById('preliminaresArea').classList.remove('hidden');
    await actualizarResultadosPreliminares();
}

// ======================================
// ACTUALIZAR RESULTADOS PRELIMINARES
// ======================================
async function actualizarResultadosPreliminares() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/votaciones/api/obtener_consolidado.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            mostrarResultados(data);
        } else {
            alert('Error al obtener resultados: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar resultados');
    }
}

// ======================================
// MOSTRAR RESULTADOS EN LA INTERFAZ
// ======================================
function mostrarResultados(data) {
    // Personeros
    let htmlPersoneros = '<div class="resultado-lista">';
    data.personeros.forEach(personero => {
        htmlPersoneros += `
            <div class="resultado-item">
                <span class="candidato-nombre">${personero.nombre} (#${personero.numero})</span>
                <span class="votos-badge">${personero.total_votos} votos</span>
            </div>
        `;
    });
    if (data.votos_blanco_personero > 0) {
        htmlPersoneros += `
            <div class="resultado-item">
                <span class="candidato-nombre">Voto en Blanco</span>
                <span class="votos-badge">${data.votos_blanco_personero} votos</span>
            </div>
        `;
    }
    htmlPersoneros += '</div>';
    document.getElementById('resultadosPersoneroPreliminares').innerHTML = htmlPersoneros;

    // Contralores
    let htmlContralores = '<div class="resultado-lista">';
    data.contralores.forEach(contralor => {
        htmlContralores += `
            <div class="resultado-item">
                <span class="candidato-nombre">${contralor.nombre} (#${contralor.numero})</span>
                <span class="votos-badge">${contralor.total_votos} votos</span>
            </div>
        `;
    });
    if (data.votos_blanco_contralor > 0) {
        htmlContralores += `
            <div class="resultado-item">
                <span class="candidato-nombre">Voto en Blanco</span>
                <span class="votos-badge">${data.votos_blanco_contralor} votos</span>
            </div>
        `;
    }
    htmlContralores += '</div>';
    document.getElementById('resultadosContralorPreliminares').innerHTML = htmlContralores;

    // Resumen General
    const htmlResumen = `
        <div class="resumen-stats">
            <div class="stat-item">
                <span class="stat-label">Total de Votantes Registrados</span>
                <span class="stat-value">${data.total_registrados}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total que Votaron</span>
                <span class="stat-value">${data.total_votaron}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Participación</span>
                <span class="stat-value">${data.total_registrados > 0 ? Math.round((data.total_votaron / data.total_registrados) * 100) : 0}%</span>
            </div>
        </div>
    `;
    document.getElementById('resumenGeneralPreliminares').innerHTML = htmlResumen;
}

// ======================================
// VOLVER A VOTACIÓN
// ======================================
function volverDesdePreliminares() {
    detenerActualizacionCandidatosVotacion();
    document.getElementById('preliminaresArea').classList.add('hidden');
    document.getElementById('votingArea').classList.remove('hidden');
}

// ======================================
// VOLVER A VOTACIÓN DESDE CONFIGURACIÓN
// ======================================
function volverVotacion() {
    detenerActualizacionResultadosAdmin();
    detenerActualizacionCandidatosAdmin();
    detenerActualizacionCandidatosVotacion();
    document.getElementById('configArea').classList.add('hidden');
    document.getElementById('votingArea').classList.remove('hidden');
}

// ======================================
// MOSTRAR MODAL DE CONFIGURACIÓN
// ======================================
function mostrarModalKey() {
    document.getElementById('modalKey').classList.remove('hidden');
}

function cerrarModalKey() {
    document.getElementById('modalKey').classList.add('hidden');
    document.getElementById('usuarioInput').value = '';
    document.getElementById('passwordInput').value = '';
}

async function verificarKey() {
    const usuario = document.getElementById('usuarioInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    
    if (!usuario || !password) {
        alert('Por favor ingrese usuario y contraseña');
        return;
    }
    
    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/votaciones/api/validar_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('modalKey').classList.add('hidden');
            document.getElementById('usuarioInput').value = '';
            document.getElementById('passwordInput').value = '';
            document.getElementById('votingArea').classList.add('hidden');
            document.getElementById('configArea').classList.remove('hidden');
            // Cargar automáticamente la lista de votantes al entrar
            await cargarTodosVotantes();
        } else {
            alert('Error: ' + (data.error || 'Credenciales inválidas'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al validar credenciales');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape') return;

    const modalCargaExcel = document.getElementById('modalCargaVotantesExcel');
    if (modalCargaExcel && !modalCargaExcel.classList.contains('hidden')) {
        cancelarCargaVotantesExcel();
        return;
    }

    const modalReinicio = document.getElementById('modalReinicioVotacion');
    if (modalReinicio && !modalReinicio.classList.contains('hidden')) {
        cerrarModalReinicioVotacion();
        return;
    }

    const modalKey = document.getElementById('modalKey');
    if (modalKey && !modalKey.classList.contains('hidden')) {
        cerrarModalKey();
    }
});

document.addEventListener('click', function(event) {
    const modalCargaExcel = document.getElementById('modalCargaVotantesExcel');
    if (modalCargaExcel && !modalCargaExcel.classList.contains('hidden') && event.target === modalCargaExcel) {
        cancelarCargaVotantesExcel();
        return;
    }

    const modalReinicio = document.getElementById('modalReinicioVotacion');
    if (modalReinicio && !modalReinicio.classList.contains('hidden') && event.target === modalReinicio) {
        cerrarModalReinicioVotacion();
        return;
    }

    const modalKey = document.getElementById('modalKey');
    if (modalKey && !modalKey.classList.contains('hidden') && event.target === modalKey) {
        cerrarModalKey();
    }
});

window.addEventListener('beforeunload', function() {
    detenerActualizacionCandidatosVotacion();
    detenerActualizacionCandidatosAdmin();
    detenerActualizacionResultadosAdmin();
});

