// Sistema de Votación - JavaScript (Modificado para PHP/MySQL)

//--> URL de nuestra API en PHP
const API_URL = 'votaciones/api/';

//--> Estas variables se llenarán con los datos del servidor al cargar la página.
let votantes = {};
let candidatos = { personero: [], contralor: [] };
let votos = { personero: {}, contralor: {} }; // Se usará para mostrar resultados
let votantesQueVotaron = new Set();

// Clave de acceso para configuración (se mantiene igual)
const CLAVE_CONFIG = "admin123";

//--> MODIFICADO: Ahora carga todo desde la base de datos al iniciar.
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch(API_URL + 'get_data.php');
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue correcta');
        }
        const data = await response.json();

        votantes = data.votantes || {};
        candidatos = data.candidatos || { personero: [], contralor: [] };
        votantesQueVotaron = new Set(data.votantesQueVotaron || []);
        votos = data.votos || { personero: {}, contralor: {} }; // Los resultados vienen del backend

        actualizarInterfaz(); // Dibuja la interfaz con los datos cargados
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        mostrarMensaje('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.', 'error');
    }
});

// Función para verificar código de votante
function verificarCodigo() {
    const codigo = document.getElementById('codigoVotante').value.trim();
    const votanteInfo = document.getElementById('votanteInfo');
    const nombreVotante = document.getElementById('nombreVotante');
    
    if (!codigo) {
        mostrarMensaje('Por favor ingrese un código', 'error');
        return;
    }
    
    if (!votantes[codigo]) {
        mostrarMensaje('Código no válido. El administrador debe registrarlo.', 'error');
        return;
    }
    
    if (votantesQueVotaron.has(codigo)) {
        mostrarMensaje('Este votante ya ejerció su derecho al voto', 'error');
        return;
    }
    
    const nombreCompleto = votantes[codigo].nombre;
    nombreVotante.textContent = nombreCompleto;
    votanteInfo.style.display = 'block';
    document.getElementById('codigoVotante').style.display = 'none';
    document.querySelector('.btn-verificar').style.display = 'none';
    
    mostrarCandidatos();
    mostrarMensaje('Bienvenido(a) ' + nombreCompleto + '. Ya puede proceder a votar.', 'success');
}

// Función para mostrar candidatos
function mostrarCandidatos() {
    mostrarCandidatosPorCargo('personero', 'candidatosPersonero');
    mostrarCandidatosPorCargo('contralor', 'candidatosContralor');
}

function mostrarCandidatosPorCargo(cargo, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    candidatos[cargo].forEach(candidato => {
        const candidatoDiv = document.createElement('div');
        candidatoDiv.className = 'candidato';
        candidatoDiv.innerHTML = `
            <input type="radio" name="${cargo}" value="${candidato.id}" id="${cargo}_${candidato.id}">
            <div class="candidato-content">
                <div class="candidato-foto">
                    ${candidato.foto ? `<img src="${candidato.foto}" alt="${candidato.nombre}">` : 'Sin foto'}
                </div>
                <div class="candidato-info">
                    <h4>${candidato.nombre}</h4>
                    <p># ${candidato.numero}</p>
                </div>
            </div>
        `;
        
        candidatoDiv.addEventListener('click', function() {
            document.getElementById(`${cargo}_${candidato.id}`).checked = true;
        });
        
        container.appendChild(candidatoDiv);
    });
}

//--> MODIFICADO: Llama al archivo PHP para enviar el voto.
async function enviarVoto() {
    const codigo = document.getElementById('codigoVotante').value.trim();
    const votoPersonero = document.querySelector('input[name="personero"]:checked');
    const votoContralor = document.querySelector('input[name="contralor"]:checked');
    
    if (!votoPersonero || !votoContralor) {
        mostrarMensaje('Debe seleccionar una opción para ambos cargos', 'error');
        return;
    }
    
    const personeroSeleccionado = votoPersonero.value; // Este es el ID del candidato
    const contralorSeleccionado = votoContralor.value; // Este es el ID del candidato

    // Incluimos el voto en blanco si es seleccionado
    const votoBlancoPersonero = document.querySelector('input[name="personero"][value="blanco"]:checked');
    const votoBlancoContralor = document.querySelector('input[name="contralor"][value="blanco"]:checked');

    const payload = {
        codigo: codigo,
        personero: votoBlancoPersonero ? 'blanco' : personeroSeleccionado,
        contralor: votoBlancoContralor ? 'blanco' : contralorSeleccionado
    };

    const response = await fetch(API_URL + 'enviar_voto.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const result = await response.json();

    if (result.success) {
        votantesQueVotaron.add(codigo); // Actualizamos el estado local para evitar doble voto inmediato
        mostrarMensaje('¡Su voto ha sido registrado exitosamente!', 'success');
        setTimeout(limpiarFormularioVotacion, 3000);
    } else {
        mostrarMensaje(`Error al registrar el voto: ${result.error || ''}`, 'error');
    }
}

function limpiarFormularioVotacion() {
    document.getElementById('codigoVotante').value = '';
    document.getElementById('codigoVotante').style.display = 'block';
    document.querySelector('.btn-verificar').style.display = 'inline-block';
    document.getElementById('votanteInfo').style.display = 'none';
    
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    
    limpiarMensajes();
}

// Funciones del modal de configuración
//function mostrarModalKey() {
    //mostrarConfigArea();
//}

// ELIMINA O COMENTA ESTAS FUNCIONES:
// function cerrarModalKey() {
//     document.getElementById('modalKey').classList.add('hidden');
// }

// function verificarKey() {
//     const key = document.getElementById('keyInput').value;
//     if (key === '123') {
//         document.getElementById('modalKey').classList.add('hidden');
//         mostrarConfigArea();
//     } else {
//         alert('Clave incorrecta');
//     }
// }

// Funciones de configuración
function mostrarConfiguracion() {
    document.getElementById('votingArea').style.display = 'none';
    document.getElementById('configArea').style.display = 'block';
    document.querySelector('.config-access').style.display = 'none';
    actualizarTabsConfiguracion();
}

function volverVotacion() {
    document.getElementById('votingArea').style.display = 'block';
    document.getElementById('configArea').style.display = 'none';
    document.querySelector('.config-access').style.display = 'block';
    limpiarMensajes();
}

function mostrarTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).style.display = 'block';
    
    event.target.classList.add('active');
    
    if (tabName === 'votantes') {
        actualizarListaVotantes();
    } else if (tabName === 'candidatos') {
        actualizarConfigCandidatos();
    } else if (tabName === 'sistema') {
        cargarConfiguracionSistema();
    } else if (tabName === 'resultados') {
        actualizarResultados();
    }
}


// Gestión de votantes
function cargarVotantes(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            votantes = {};
            
            jsonData.forEach((row, index) => {
                const codigo = row[0];
                const nombre = row[1];
                
                if (codigo && nombre) {
                    votantes[String(codigo)] = {
                        nombre: String(nombre),
                        grado: '',
                        puesto: '',
                        telefono: ''
                    };
                }
            });
            
            guardarDatosLocalStorage();
            actualizarListaVotantes();
            mostrarMensaje('Archivo de votantes cargado exitosamente', 'success');
            
        } catch (error) {
            mostrarMensaje('Error al procesar el archivo Excel', 'error');
            console.error('Error:', error);
        }
    };
    reader.readAsArrayBuffer(file);
}

//--> MODIFICADO: Llama al archivo PHP para agregar votante.
async function agregarVotante() {
    const nombre = document.getElementById('nuevoNombre').value.trim();
    const codigo = document.getElementById('nuevoCodigo').value.trim();

    if (!nombre || !codigo) {
        mostrarMensaje('Debe completar nombre y código', 'error');
        return;
    }
    if (votantes[codigo]) {
        mostrarMensaje('Ya existe un votante con ese código', 'error');
        return;
    }

    const response = await fetch(API_URL + 'add_votante.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, codigo: codigo })
    });

    const result = await response.json();

    if (result.success) {
        votantes[codigo] = { nombre: nombre }; // Actualizamos el objeto local
        actualizarListaVotantes();
        document.getElementById('nuevoNombre').value = '';
        document.getElementById('nuevoCodigo').value = '';
        mostrarMensaje('Votante agregado exitosamente', 'success');
    } else {
        mostrarMensaje(`Error al guardar: ${result.error}`, 'error');
    }
}

function actualizarListaVotantes() {
    const lista = document.getElementById('listaVotantes');
    if (!lista) return;
    lista.innerHTML = '';
    
    if (Object.keys(votantes).length === 0) {
        lista.innerHTML = '<p>No hay votantes registrados.</p>';
        return;
    }

    Object.entries(votantes).forEach(([codigo, votante]) => {
        const item = document.createElement('div');
        item.className = 'votante-item';
        
        const nombreVotante = (typeof votante === 'object' && votante.nombre) ? votante.nombre : votante;

        item.innerHTML = `
            <div class="votante-details">
                <span><strong>${nombreVotante}</strong></span>
                <span>Código: ${codigo}</span>
            </div>
            <button onclick="eliminarVotante('${codigo}')" class="btn-cancelar" style="padding: 5px 10px; font-size: 12px;">Eliminar</button>
        `;
        lista.appendChild(item);
    });
}

//--> MODIFICADO: Llama al archivo PHP para eliminar votante.
async function eliminarVotante(codigo) {
    if (confirm('¿Está seguro de eliminar este votante? Esto también eliminará su voto si ya fue emitido.')) {
        const response = await fetch(API_URL + 'delete_votante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo: codigo })
        });
        const result = await response.json();

        if (result.success) {
            delete votantes[codigo]; // Actualizamos el objeto local
            votantesQueVotaron.delete(codigo);
            actualizarListaVotantes();
            mostrarMensaje('Votante eliminado', 'success');
        } else {
            mostrarMensaje(`Error al eliminar: ${result.error}`, 'error');
        }
    }
}

// Gestión de candidatos
function actualizarConfigCandidatos() {
    actualizarCandidatosPorCargo('personero', 'personeroConfig');
    actualizarCandidatosPorCargo('contralor', 'contralorConfig');
}

function actualizarCandidatosPorCargo(cargo, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    candidatos[cargo].forEach(candidato => {
        const candidatoDiv = document.createElement('div');
        candidatoDiv.className = 'candidato-form';
        candidatoDiv.innerHTML = `
            <input type="text" value="${candidato.nombre || ''}" placeholder="Nombre del candidato" onchange="actualizarCandidato('${cargo}', ${candidato.id}, 'nombre', this.value)">
            <input type="text" value="${candidato.numero || ''}" placeholder="Número" onchange="actualizarCandidato('${cargo}', ${candidato.id}, 'numero', this.value)">
            <input type="file" accept="image/*" onchange="cargarFotoCandidato('${cargo}', ${candidato.id}, this)">
            <button onclick="eliminarCandidato('${cargo}', ${candidato.id})" class="btn-cancelar" style="width: 100%; margin-top: 10px;">Eliminar Candidato</button>
        `;
        container.appendChild(candidatoDiv);
    });
}

//--> MODIFICADO: Llama al archivo PHP para agregar candidato.
async function agregarCandidato(cargo) {
    const response = await fetch(API_URL + 'add_candidato.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargo: cargo, nombre: 'Nuevo Candidato', numero: '00' })
    });
    const result = await response.json();
    if(result.success) {
        candidatos[cargo].push(result.data); // El backend nos devuelve el nuevo candidato con su ID
        actualizarCandidatosPorCargo(cargo, cargo + 'Config');
        mostrarMensaje('Candidato agregado', 'success');
    } else {
        mostrarMensaje(`Error: ${result.error}`, 'error');
    }
}

//--> MODIFICADO: Llama al archivo PHP para actualizar candidato.
async function actualizarCandidato(cargo, id, campo, valor) {
    const response = await fetch(API_URL + 'update_candidato.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, campo, valor })
    });
    const result = await response.json();
    if (result.success) {
        // Actualizamos el objeto local
        const candidato = candidatos[cargo].find(c => c.id == id);
        if(candidato) candidato[campo] = valor;
        mostrarMensaje('Candidato actualizado', 'success');
    } else {
        mostrarMensaje(`Error: ${result.error}`, 'error');
    }
}

async function cargarFotoCandidato(cargo, id, input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const fotoBase64 = e.target.result;
        // Llamamos a la misma función de actualizar, pero con el campo 'foto'
        await actualizarCandidato(cargo, id, 'foto', fotoBase64);
        
        // Actualizamos la imagen en la interfaz de inmediato
        const candidato = candidatos[cargo].find(c => c.id == id);
        if(candidato) candidato.foto = fotoBase64;
    };
    reader.readAsDataURL(file);
}

//--> MODIFICADO: Llama al archivo PHP para eliminar candidato.
async function eliminarCandidato(cargo, id) {
    if (confirm('¿Está seguro de eliminar este candidato?')) {
        const response = await fetch(API_URL + 'delete_candidato.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();
        if(result.success) {
            candidatos[cargo] = candidatos[cargo].filter(c => c.id != id);
            actualizarCandidatosPorCargo(cargo, cargo + 'Config');
            mostrarMensaje('Candidato eliminado', 'success');
        } else {
             mostrarMensaje(`Error: ${result.error}`, 'error');
        }
    }
}

// Gestión de resultados
function actualizarResultados() {
    const container = document.getElementById('resumenResultados');
    if (!container) return;
    container.innerHTML = '';
    
    const personeroDiv = document.createElement('div');
    personeroDiv.className = 'resultado-cargo';
    personeroDiv.innerHTML = '<h4>Resultados Personero Estudiantil</h4>';
    
    candidatos.personero.forEach(candidato => {
        const votos_candidato = votos.personero[candidato.id] || 0;
        const resultadoItem = document.createElement('div');
        resultadoItem.className = 'resultado-item';
        resultadoItem.innerHTML = `<span>${candidato.nombre} (#${candidato.numero})</span><span class="votos-count">${votos_candidato} votos</span>`;
        personeroDiv.appendChild(resultadoItem);
    });
    
    const votosBlancoPersonero = votos.personero['blanco'] || 0;
    const blancoPersonero = document.createElement('div');
    blancoPersonero.className = 'resultado-item';
    blancoPersonero.innerHTML = `<span>Voto en Blanco</span><span class="votos-count">${votosBlancoPersonero} votos</span>`;
    personeroDiv.appendChild(blancoPersonero);
    
    const contralorDiv = document.createElement('div');
    contralorDiv.className = 'resultado-cargo';
    contralorDiv.innerHTML = '<h4>Resultados Contralor Estudiantil</h4>';
    
    candidatos.contralor.forEach(candidato => {
        const votos_candidato = votos.contralor[candidato.id] || 0;
        const resultadoItem = document.createElement('div');
        resultadoItem.className = 'resultado-item';
        resultadoItem.innerHTML = `<span>${candidato.nombre} (#${candidato.numero})</span><span class="votos-count">${votos_candidato} votos</span>`;
        contralorDiv.appendChild(resultadoItem);
    });
    
    const votosBlancoContralor = votos.contralor['blanco'] || 0;
    const blancoContralor = document.createElement('div');
    blancoContralor.className = 'resultado-item';
    blancoContralor.innerHTML = `<span>Voto en Blanco</span><span class="votos-count">${votosBlancoContralor} votos</span>`;
    contralorDiv.appendChild(blancoContralor);
    
    container.appendChild(personeroDiv);
    container.appendChild(contralorDiv);
    
    const totalVotantes = votantesQueVotaron.size;
    const totalDiv = document.createElement('div');
    totalDiv.className = 'resultado-cargo';
    totalDiv.innerHTML = `<h4>Resumen General</h4>
                          <div class="resultado-item"><span>Total de votantes registrados</span><span class="votos-count">${Object.keys(votantes).length}</span></div>
                          <div class="resultado-item"><span>Total de personas que votaron</span><span class="votos-count">${totalVotantes}</span></div>`;
    container.appendChild(totalDiv);
}

// === FUNCIÓN DE EXPORTAR RESULTADOS  ===
function exportarResultados() {
    const wb = XLSX.utils.book_new();
    const dataParaExportar = [];

    // Sección 1: Datos del Administrador y Jurado
    const datosAdminGuardados = sessionStorage.getItem('datosAdministrador');
    if (datosAdminGuardados) {
        const admin = JSON.parse(datosAdminGuardados);
        
        dataParaExportar.push(['DATOS DE LA MESA DE VOTACIÓN']);
        dataParaExportar.push([]);
        
        // Si tiene la nueva estructura (profesor + jurado)
        if (admin.profesor && admin.jurado) {
            dataParaExportar.push(['PROFESOR ADMINISTRADOR']);
            dataParaExportar.push(['Nombre', admin.profesor.nombre]);
            dataParaExportar.push(['Materia', admin.profesor.materia]);
            dataParaExportar.push(['Puesto a Cargo', admin.profesor.puesto]);
            dataParaExportar.push(['Teléfono', admin.profesor.telefono]);
            dataParaExportar.push([]);
            
            dataParaExportar.push(['ESTUDIANTE JURADO']);
            dataParaExportar.push(['Nombre', admin.jurado.nombre]);
            dataParaExportar.push(['Grado', admin.jurado.grado]);
            dataParaExportar.push([]);
        } else {
            // Estructura antigua (compatibilidad)
            dataParaExportar.push(['ADMINISTRADOR DE LA JORNADA']);
            dataParaExportar.push(['Nombre', admin.nombre]);
            dataParaExportar.push(['Grado/Cargo', admin.grado || admin.materia]);
            dataParaExportar.push(['Puesto a Cargo', admin.puesto]);
            dataParaExportar.push(['Teléfono', admin.telefono]);
            dataParaExportar.push([]);
        }
        
        dataParaExportar.push([]);
    }
    
    // Sección 2: Resultados de la Votación
    dataParaExportar.push(['REPORTE GENERAL DE VOTACIÓN']);
    dataParaExportar.push([]);
    
    dataParaExportar.push(['RESULTADOS PERSONERO ESTUDIANTIL']);
    dataParaExportar.push(['Candidato', 'Número', 'Votos']);
    candidatos.personero.forEach(candidato => {
        dataParaExportar.push([candidato.nombre, candidato.numero, votos.personero[candidato.id] || 0]);
    });
    dataParaExportar.push(['Voto en Blanco', '', votos.personero['blanco'] || 0]);
    
    dataParaExportar.push([]);
    dataParaExportar.push(['RESULTADOS CONTRALOR ESTUDIANTIL']);
    dataParaExportar.push(['Candidato', 'Número', 'Votos']);
    candidatos.contralor.forEach(candidato => {
        dataParaExportar.push([candidato.nombre, candidato.numero, votos.contralor[candidato.id] || 0]);
    });
    dataParaExportar.push(['Voto en Blanco', '', votos.contralor['blanco'] || 0]);
    
    dataParaExportar.push([]);
    dataParaExportar.push(['RESUMEN GENERAL']);
    dataParaExportar.push(['Total votantes registrados', Object.keys(votantes).length]);
    dataParaExportar.push(['Total personas que votaron', votantesQueVotaron.size]);
    
    const ws = XLSX.utils.aoa_to_sheet(dataParaExportar);
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte General');

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Reporte_Votacion_${fecha}.xlsx`);
    
    mostrarMensaje('Resultados exportados exitosamente', 'success');
}

//--> MODIFICADO: Llama al archivo PHP para reiniciar la votación.
async function reiniciarVotacion() {
    if (confirm('¿Está seguro de reiniciar completamente la votación? Esto eliminará todos los votos y la lista de quienes votaron, pero NO los votantes ni candidatos.')) {
        const response = await fetch(API_URL + 'reiniciar_votacion.php', { method: 'POST' });
        const result = await response.json();
        if(result.success) {
            votos = { personero: {}, contralor: {} };
            votantesQueVotaron.clear();
            actualizarResultados();
            mostrarMensaje('Votación reiniciada exitosamente', 'success');
        } else {
            mostrarMensaje('Error al reiniciar la votación.', 'error');
        }
    }
}

// Funciones de utilidad
function mostrarMensaje(mensaje, tipo) {
    limpiarMensajes();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = tipo === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = mensaje;
    
    const areaVisible = (document.getElementById('votingArea') && document.getElementById('votingArea').style.display !== 'none') ? 
                          document.getElementById('votingArea') : 
                          document.getElementById('configArea');
    
    if (areaVisible) {
        areaVisible.insertBefore(messageDiv, areaVisible.firstChild);
    }
    
    setTimeout(limpiarMensajes, 5000);
}

function limpiarMensajes() {
    document.querySelectorAll('.success-message, .error-message').forEach(msg => msg.remove());
}

function actualizarInterfaz() {
    if (document.getElementById('listaVotantes')) {
        actualizarListaVotantes();
        actualizarConfigCandidatos();
        actualizarResultados();
    }
}

function actualizarTabsConfiguracion() {
    if (document.querySelector('.tab-btn')) {
        mostrarTab('votantes');
    }
}

// Funciones de almacenamiento
function guardarDatosLocalStorage() {
    const datos = {
        votantes: votantes,
        candidatos: candidatos,
        votos: votos,
        votantesQueVotaron: Array.from(votantesQueVotaron)
    };
    localStorage.setItem('sistemaVotacion', JSON.stringify(datos));
}

function cargarDatosLocalStorage() {
    try {
        const datosGuardados = localStorage.getItem('sistemaVotacion');
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            votantes = datos.votantes || {};
            candidatos = datos.candidatos || { personero: [], contralor: [] };
            votos = datos.votos || { personero: {}, contralor: {} };
            votantesQueVotaron = new Set(datos.votantesQueVotaron || []);

            const firstVoterKey = Object.keys(votantes)[0];
            if (firstVoterKey && typeof votantes[firstVoterKey] === 'string') {
                const votantesMigrados = {};
                Object.keys(votantes).forEach(codigo => {
                    votantesMigrados[codigo] = {
                        nombre: votantes[codigo],
                        grado: '',
                        puesto: '',
                        telefono: ''
                    };
                });
                votantes = votantesMigrados;
                guardarDatosLocalStorage();
            }
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        votantes = {};
        candidatos = { personero: [], contralor: [] };
        votos = { personero: {}, contralor: {} };
        votantesQueVotaron = new Set();
    }
}

// === NUEVAS FUNCIONES PARA RESULTADOS PRELIMINARES Y CONFIGURACIÓN DE FECHA ===

// Mostrar resultados preliminares
function mostrarResultadosPreliminares() {
    document.getElementById('votingArea').style.display = 'none';
    document.getElementById('configArea').style.display = 'none';
    document.getElementById('preliminaresArea').style.display = 'block';
    document.querySelector('.config-access').style.display = 'none';
    
    actualizarResultadosPreliminares();
    mostrarMensaje('Mostrando resultados en tiempo real', 'success');
}

// Volver desde resultados preliminares
function volverDesdePreliminares() {
    document.getElementById('preliminaresArea').style.display = 'none';
    document.getElementById('votingArea').style.display = 'block';
    document.querySelector('.config-access').style.display = 'block';
    limpiarMensajes();
}

// Actualizar resultados preliminares
function actualizarResultadosPreliminares() {
    // Actualizar Personero
    const personeroContainer = document.getElementById('resultadosPersoneroPreliminares');
    if (personeroContainer) {
        personeroContainer.innerHTML = '';
        
        candidatos.personero.forEach((candidato) => {
            const votos_candidato = votos.personero[candidato.id] || 0;
            const resultadoItem = document.createElement('div');
            resultadoItem.className = 'resultado-item-preliminar';
            resultadoItem.innerHTML = `
                <div class="candidato-preliminar">
                    <span class="nombre-candidato">${candidato.nombre}</span>
                    <span class="numero-candidato">#${candidato.numero}</span>
                </div>
                <div class="votos-preliminar">${votos_candidato} votos</div>
            `;
            personeroContainer.appendChild(resultadoItem);
        });
        
        const votosBlancoPersonero = votos.personero['blanco'] || 0;
        const blancoItem = document.createElement('div');
        blancoItem.className = 'resultado-item-preliminar voto-blanco-item';
        blancoItem.innerHTML = `
            <div class="candidato-preliminar">
                <span class="nombre-candidato">Voto en Blanco</span>
                <span class="numero-candidato">⚪</span>
            </div>
            <div class="votos-preliminar">${votosBlancoPersonero} votos</div>
        `;
        personeroContainer.appendChild(blancoItem);
    }
    
    // Actualizar Contralor
    const contralorContainer = document.getElementById('resultadosContralorPreliminares');
    if (contralorContainer) {
        contralorContainer.innerHTML = '';
        
        candidatos.contralor.forEach((candidato) => {
            const votos_candidato = votos.contralor[candidato.id] || 0;
            const resultadoItem = document.createElement('div');
            resultadoItem.className = 'resultado-item-preliminar';
            resultadoItem.innerHTML = `
                <div class="candidato-preliminar">
                    <span class="nombre-candidato">${candidato.nombre}</span>
                    <span class="numero-candidato">#${candidato.numero}</span>
                </div>
                <div class="votos-preliminar">${votos_candidato} votos</div>
            `;
            contralorContainer.appendChild(resultadoItem);
        });
        
        const votosBlancoContralor = votos.contralor['blanco'] || 0;
        const blancoItem = document.createElement('div');
        blancoItem.className = 'resultado-item-preliminar voto-blanco-item';
        blancoItem.innerHTML = `
            <div class="candidato-preliminar">
                <span class="nombre-candidato">Voto en Blanco</span>
                <span class="numero-candidato">⚪</span>
            </div>
            <div class="votos-preliminar">${votosBlancoContralor} votos</div>
        `;
        contralorContainer.appendChild(blancoItem);
    }
    
    // Actualizar resumen general
    const resumenContainer = document.getElementById('resumenGeneralPreliminares');
    if (resumenContainer) {
        resumenContainer.innerHTML = `
            <div class="resumen-item">
                <span class="resumen-label">👥 Total votantes registrados:</span>
                <span class="resumen-valor">${Object.keys(votantes).length}</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-label">✅ Total de votos emitidos:</span>
                <span class="resumen-valor">${votantesQueVotaron.size}</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-label">⏳ Participación:</span>
                <span class="resumen-valor">${Object.keys(votantes).length > 0 ? ((votantesQueVotaron.size / Object.keys(votantes).length) * 100).toFixed(1) : 0}%</span>
            </div>
        `;
    }
    
    mostrarMensaje('Resultados actualizados correctamente', 'success');
}

// Cargar configuración del sistema
function cargarConfiguracionSistema() {
    const fechaInput = document.getElementById('fechaVotacion');
    if (fechaInput) {
        const fechaGuardada = localStorage.getItem('fechaVotacion');
        if (fechaGuardada) {
            fechaInput.value = fechaGuardada;
        } else {
            // Fecha por defecto: 15 de abril de 2025, 7:00 AM
            fechaInput.value = '2025-04-15T07:00';
        }
    }
}

// Actualizar fecha de votación
function actualizarFechaVotacion() {
    const fechaInput = document.getElementById('fechaVotacion');
    if (!fechaInput || !fechaInput.value) {
        mostrarMensaje('Por favor selecciona una fecha válida', 'error');
        return;
    }
    
    const fechaSeleccionada = fechaInput.value;
    
    // Guardar la fecha en localStorage
    localStorage.setItem('fechaVotacion', fechaSeleccionada);
    
    // Mostrar confirmación
    const fecha = new Date(fechaSeleccionada);
    const fechaFormateada = fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    mostrarMensaje(`Fecha actualizada correctamente: ${fechaFormateada}`, 'success');
    
    // Actualizar la página principal si está abierta en otra pestaña
    // (El countdown se actualizará automáticamente cuando se recargue index.html)
}