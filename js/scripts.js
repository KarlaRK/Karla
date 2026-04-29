// ============================================================
//  SK Glamour Nails — js/scripts.js  (conectado a PHP/MySQL)
// ============================================================

const API = 'api';          // relativo: misma carpeta del servidor
let usuarioId = null;       // se llena al hacer login

// ── Navegación ────────────────────────────────────────────────
function mostrar(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('activo'));
    document.getElementById(id).classList.add('activo');
    if (id === 'reportes') cargarReportes();
}

function mostrarPanel(id) {
    document.getElementById('inventarioPanel').style.display = 'none';
    document.getElementById('pagosPanel').style.display      = 'none';
    document.getElementById(id).style.display = 'block';
}

// ── Fetch helper ──────────────────────────────────────────────
async function api(path, method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    try {
        const res  = await fetch(`${API}/${path}`, opts);
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'Error desconocido');
        return json.data;
    } catch (e) {
        alert('Error: ' + e.message);
        throw e;
    }
}

// ──────────────────────────────────────────────────────────────
//  CLIENTES
// ──────────────────────────────────────────────────────────────
async function cargarClientes() {
    const clientes = await api('clientes');
    const tb = document.getElementById('tablaClientes');
    tb.innerHTML = clientes.map(c => `
        <tr>
            <td>${c.nombre}</td>
            <td>${c.telefono}</td>
            <td>${c.lugar}</td>
            <td><button onclick="eliminarCliente(${c.id})">Eliminar</button></td>
        </tr>`).join('');
    document.getElementById('totalClientes').innerText = clientes.length;
}

async function agregarCliente() {
    const nombre   = document.getElementById('nombreCliente').value.trim();
    const telefono = document.getElementById('telefonoCliente').value.trim();
    const lugar_id = document.getElementById('lugarCliente').value;
    if (!nombre || !telefono || !lugar_id) return alert('Completa todos los campos.');
    await api('clientes', 'POST', { nombre, telefono, lugar_id: +lugar_id });
    document.getElementById('nombreCliente').value   = '';
    document.getElementById('telefonoCliente').value = '';
    document.getElementById('lugarCliente').value    = '';
    cargarClientes();
}

async function eliminarCliente(id) {
    if (!confirm('¿Eliminar cliente?')) return;
    await api(`clientes/${id}`, 'DELETE');
    cargarClientes();
}

// ──────────────────────────────────────────────────────────────
//  CITAS
// ──────────────────────────────────────────────────────────────
async function cargarCitas() {
    const citas = await api('citas');
    const tb = document.getElementById('tablaCitas');
    const estados = ['pendiente','confirmada','completada','cancelada'];
    tb.innerHTML = citas.map(c => `
        <tr>
            <td>${c.cliente}</td>
            <td>${c.servicio}</td>
            <td>${c.fecha}</td>
            <td>${c.hora}</td>
            <td>${c.lugar}</td>
            <td>
                <select onchange="cambiarEstadoCita(${c.id}, this.value)">
                    ${estados.map(e =>
                        `<option ${e === c.estado ? 'selected' : ''}>${e}</option>`
                    ).join('')}
                </select>
            </td>
            <td><button onclick="eliminarCita(${c.id})">Eliminar</button></td>
        </tr>`).join('');
    document.getElementById('totalCitas').innerText = citas.length;
}

async function agregarCita() {
    const cliente_id  = document.getElementById('clienteCita').value;
    const servicio_id = document.getElementById('servicioCita').value;
    const fecha       = document.getElementById('fechaCita').value;
    const hora        = document.getElementById('horaCita').value;
    const lugar_id    = document.getElementById('lugarCita').value;
    if (!cliente_id || !fecha || !hora) return alert('Completa todos los campos.');
    await api('citas', 'POST', {
        cliente_id: +cliente_id, servicio_id: +servicio_id,
        lugar_id: +lugar_id, fecha, hora
    });
    document.getElementById('fechaCita').value = '';
    document.getElementById('horaCita').value  = '';
    cargarCitas();
}

async function cambiarEstadoCita(id, estado) {
    await api(`citas/${id}/estado`, 'PATCH', { estado });
}

async function eliminarCita(id) {
    if (!confirm('¿Eliminar cita?')) return;
    await api(`citas/${id}`, 'DELETE');
    cargarCitas();
}

// ──────────────────────────────────────────────────────────────
//  PAGOS
// ──────────────────────────────────────────────────────────────
async function cargarPagos() {
    const pagos = await api('pagos');
    const tb = document.getElementById('tablaPagos2');
    if (!tb) return;
    tb.innerHTML = pagos.map(p => `
        <tr>
            <td>${p.cliente}</td>
            <td>$${Number(p.monto).toLocaleString()}</td>
            <td>${p.metodo_pago}</td>
            <td>${p.lugar}</td>
            <td>${p.registrado_por}</td>
            <td><button onclick="eliminarPago(${p.id})">Eliminar</button></td>
        </tr>`).join('');
}

async function agregarPago2() {
    const cliente_id  = document.getElementById('clientePago2').value;
    const monto       = parseFloat(document.getElementById('montoPago2').value);
    const lugar_id    = document.getElementById('tipoIngreso2').value;
    const metodo_pago = document.getElementById('metodoPago2')?.value || 'efectivo';
    if (!cliente_id || isNaN(monto) || monto <= 0) return alert('Completa todos los campos.');
    await api('pagos', 'POST', {
        cliente_id: +cliente_id, lugar_id: +lugar_id,
        monto, metodo_pago, registrado_por: usuarioId
    });
    document.getElementById('montoPago2').value = '';
    cargarPagos();
}

async function eliminarPago(id) {
    if (!confirm('¿Eliminar pago?')) return;
    await api(`pagos/${id}`, 'DELETE');
    cargarPagos();
}

// ──────────────────────────────────────────────────────────────
//  INVENTARIO
// ──────────────────────────────────────────────────────────────
async function cargarInventario() {
    const items = await api('inventario');
    const tb = document.getElementById('tablaInventario');
    tb.innerHTML = items.map(i => `
        <tr>
            <td>${i.producto}</td>
            <td>${i.cantidad}</td>
            <td>${i.propietario}</td>
            <td>${i.estado}</td>
            <td><button onclick="eliminarInventario(${i.id})">Eliminar</button></td>
        </tr>`).join('');
}

async function agregarInventario() {
    const producto    = document.getElementById('productoInventario').value.trim();
    const cantidad    = +document.getElementById('cantidadInventario').value;
    const propietario = document.getElementById('propietarioInventario').value.trim();
    const estado      = document.getElementById('estadoInventario').value;
    if (!producto || !propietario || !estado) return alert('Completa todos los campos.');
    await api('inventario', 'POST', { producto, cantidad, propietario, estado });
    document.getElementById('productoInventario').value   = '';
    document.getElementById('cantidadInventario').value   = '';
    document.getElementById('propietarioInventario').value = '';
    document.getElementById('estadoInventario').value     = '';
    cargarInventario();
}

async function eliminarInventario(id) {
    if (!confirm('¿Eliminar item?')) return;
    await api(`inventario/${id}`, 'DELETE');
    cargarInventario();
}

// ──────────────────────────────────────────────────────────────
//  REPORTES
// ──────────────────────────────────────────────────────────────
async function cargarReportes() {
    const { summary, porLugar, porServicio } = await api('reportes');

    document.getElementById('totalClientes').innerText   = summary.total_clientes;
    document.getElementById('totalCitas').innerText      = summary.total_citas;

    // Campos extra (agrega los spans en index.html si los quieres mostrar)
    const elPend = document.getElementById('citasPendientes');
    if (elPend) elPend.innerText = summary.citas_pendientes;
    const elIng = document.getElementById('ingresosTotal');
    if (elIng) elIng.innerText = '$' + Number(summary.ingresos_totales).toLocaleString();
    const elAgo = document.getElementById('itemsAgotados');
    if (elAgo) elAgo.innerText = summary.items_agotados;

    const tl = document.getElementById('tablaLugares');
    if (tl) tl.innerHTML = porLugar.map(r =>
        `<tr><td>${r.lugar}</td><td>$${Number(r.total).toLocaleString()}</td></tr>`
    ).join('');

    const ts = document.getElementById('tablaServicios');
    if (ts) ts.innerHTML = porServicio.map(r =>
        `<tr><td>${r.servicio}</td><td>${r.total}</td></tr>`
    ).join('');
}

// ──────────────────────────────────────────────────────────────
//  SELECTS DINÁMICOS (cargados desde la BD)
// ──────────────────────────────────────────────────────────────
async function cargarSelects() {
    const [lugares, servicios, clientes] = await Promise.all([
        api('lugares'), api('servicios'), api('clientes')
    ]);

    // Lugar del cliente
    document.getElementById('lugarCliente').innerHTML =
        '<option value="">-- Lugar del servicio --</option>' +
        lugares.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('');

    // Servicio de la cita
    document.getElementById('servicioCita').innerHTML =
        servicios.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');

    // Lugar de la cita
    document.getElementById('lugarCita').innerHTML =
        lugares.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('');

    // Cliente de la cita
    const selCita = document.getElementById('clienteCita');
    selCita.outerHTML = selCita.outerHTML.replace('<input', '<select').replace('>', '>');
    // Si es select (ya cambiado en HTML):
    if (document.getElementById('clienteCita').tagName === 'SELECT') {
        document.getElementById('clienteCita').innerHTML =
            '<option value="">-- Cliente --</option>' +
            clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }

    // Lugar de pagos
    document.getElementById('tipoIngreso2').innerHTML =
        lugares.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('');

    // Cliente de pagos
    const selPago = document.getElementById('clientePago2');
    if (selPago && selPago.tagName === 'SELECT') {
        selPago.innerHTML =
            '<option value="">-- Cliente --</option>' +
            clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
}

// ──────────────────────────────────────────────────────────────
//  LOGIN
// ──────────────────────────────────────────────────────────────
async function login() {
    const usuario = document.getElementById('usuario').value.trim();
    const clave   = document.getElementById('clave').value;
    if (!usuario || !clave) return alert('Ingresa usuario y contraseña.');
    const data = await api('login', 'POST', { usuario, clave });
    usuarioId = data.id;
    alert(`¡Bienvenida ${data.nombre}! 💅`);
    mostrar('panelManicurista');
    mostrarPanel('inventarioPanel');
    cargarInventario();
    cargarPagos();
}

// ── Init ──────────────────────────────────────────────────────
(async () => {
    await cargarSelects();
    cargarClientes();
    cargarCitas();
})();