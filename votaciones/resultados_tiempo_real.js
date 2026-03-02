// ======================================
// TAB RESULTADOS (CONSOLIDADO DE VOTOS EN TIEMPO REAL)
// ======================================
window.__intervaloResultadosAdmin = null;

function detenerActualizacionResultadosAdmin() {
    if (window.__intervaloResultadosAdmin) {
        clearInterval(window.__intervaloResultadosAdmin);
        window.__intervaloResultadosAdmin = null;
    }
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

    if (idTab) {
        document.getElementById(idTab)?.classList.remove('hidden');
    }

    const btn = Array.from(document.querySelectorAll('.tab-btn'))
        .find(b => (b.getAttribute('onclick') || '').includes(`'${tab}'`));
    if (btn) {
        btn.classList.add('active');
    }

    if (tab === 'resultados') {
        cargarTabResultados();
        detenerActualizacionResultadosAdmin();
        window.__intervaloResultadosAdmin = setInterval(cargarTabResultados, 3000);
    } else {
        detenerActualizacionResultadosAdmin();
    }
}

async function cargarTabResultados() {
    const cont = document.getElementById('resumenResultados');
    if (!cont) return;

    try {
        const apiUrl = `${window.location.origin}/sistema_votacion/votaciones/api/obtener_resultados_votos.php`;
        const response = await fetch(apiUrl, { cache: 'no-store' });
        const data = await response.json();

        if (!data.success) {
            cont.innerHTML = '<p>Error al cargar resultados.</p>';
            return;
        }

        if (!data.resultados || data.resultados.length === 0) {
            cont.innerHTML = '<p>No hay votos registrados todavía.</p>';
            return;
        }

        let html = `
            <div class="resultado-cargo-admin">
                <h4>📊 Consolidado de la tabla votos</h4>
                <div class="resultado-item-admin">
                    <strong>ID</strong>
                    <strong>Nombre</strong>
                    <strong>Total Votos</strong>
                </div>
        `;

        data.resultados.forEach(item => {
            html += `
                <div class="resultado-item-admin">
                    <span>${item.id === null ? '-' : item.id}</span>
                    <span>${item.nombre}</span>
                    <span class="votos-count">${item.total_votos}</span>
                </div>
            `;
        });

        html += `<p class="info-text">Actualizado: ${data.actualizado_en}</p>`;
        html += '</div>';

        cont.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar resultados en tiempo real:', error);
        cont.innerHTML = '<p>Error de conexión.</p>';
    }
}

async function exportarResultadosExcel() {
    try {
        const apiUrl = `${window.location.origin}/sistema_votacion/votaciones/api/obtener_resultados_votos.php`;
        const response = await fetch(apiUrl, { cache: 'no-store' });
        const data = await response.json();

        if (!data.success) {
            alert('Error al obtener resultados para exportar');
            return;
        }

        if (!data.resultados || data.resultados.length === 0) {
            alert('No hay resultados para exportar');
            return;
        }

        const datosExcel = [['ID', 'Nombre', 'Total Votos']];

        data.resultados.forEach(item => {
            datosExcel.push([
                item.id === null ? 'N/A' : item.id,
                item.nombre,
                item.total_votos
            ]);
        });

        datosExcel.push([]);
        datosExcel.push(['Actualizado', data.actualizado_en, '']);

        const ws = XLSX.utils.aoa_to_sheet(datosExcel);

        const anchoID = Math.max(
            2,
            ...data.resultados.map(item => String(item.id === null ? 'N/A' : item.id).length)
        );
        const anchoNombre = Math.max(
            6,
            ...data.resultados.map(item => String(item.nombre || '').length)
        );
        const anchoTotal = Math.max(
            11,
            ...data.resultados.map(item => String(item.total_votos).length)
        );

        ws['!cols'] = [
            { wch: anchoID + 2 },
            { wch: Math.min(anchoNombre + 4, 50) },
            { wch: anchoTotal + 2 }
        ];

        ws['!autofilter'] = { ref: 'A1:C1' };

        ['A1', 'B1', 'C1'].forEach(celda => {
            if (ws[celda]) {
                ws[celda].s = {
                    font: { bold: true }
                };
            }
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Consolidado Votos');
        XLSX.writeFile(wb, 'Consolidado_Votos.xlsx');
    } catch (error) {
        console.error('Error al exportar consolidado:', error);
        alert('Error al exportar resultados');
    }
}

function volverVotacion() {
    detenerActualizacionResultadosAdmin();
    document.getElementById('configArea').classList.add('hidden');
    document.getElementById('votingArea').classList.remove('hidden');
}

window.addEventListener('beforeunload', detenerActualizacionResultadosAdmin);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        detenerActualizacionResultadosAdmin();
    }
});
