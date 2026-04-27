let clientes = JSON.parse(localStorage.getItem("clientes")) || []
let citas = JSON.parse(localStorage.getItem("citas")) || []
let pagos = JSON.parse(localStorage.getItem("pagos")) || []
let inventario = JSON.parse(localStorage.getItem("inventario")) || []

function mostrar(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("activo"))
  document.getElementById(id).classList.add("activo")
}

// Sub-navegación dentro del panel manicurista
function mostrarPanel(id) {
  document.getElementById("inventarioPanel").style.display = "none"
  document.getElementById("pagosPanel").style.display = "none"
  document.getElementById(id).style.display = "block"
}

function guardar() {
  localStorage.setItem("clientes", JSON.stringify(clientes))
  localStorage.setItem("citas", JSON.stringify(citas))
  localStorage.setItem("pagos", JSON.stringify(pagos))
  localStorage.setItem("inventario", JSON.stringify(inventario))
}

// ── CLIENTES ──────────────────────────────────────────────
function agregarCliente() {
  let nombre = document.getElementById("nombreCliente").value.trim()
  let telefono = document.getElementById("telefonoCliente").value.trim()
  let lugar = document.getElementById("lugarCliente").value

  if (!nombre || !telefono || !lugar) {
    alert("Por favor completa todos los campos del cliente.")
    return
  }
  clientes.push({ nombre, telefono, lugar })
  document.getElementById("nombreCliente").value = ""
  document.getElementById("telefonoCliente").value = ""
  document.getElementById("lugarCliente").value = ""
  guardar()
  render()
}

// ── CITAS ─────────────────────────────────────────────────
function agregarCita() {
  let cliente = document.getElementById("clienteCita").value.trim()
  let servicio = document.getElementById("servicioCita").value
  let fecha = document.getElementById("fechaCita").value
  let hora = document.getElementById("horaCita").value
  let lugar = document.getElementById("lugarCita").value

  if (!cliente || !fecha || !hora) {
    alert("Por favor completa todos los campos de la cita.")
    return
  }
  citas.push({ cliente, servicio, fecha, hora, lugar })
  document.getElementById("clienteCita").value = ""
  document.getElementById("fechaCita").value = ""
  document.getElementById("horaCita").value = ""
  guardar()
  render()
}

// ── PAGOS (desde panel manicurista) ───────────────────────
function agregarPago2() {
  let cliente = document.getElementById("clientePago2").value.trim()
  let monto = parseFloat(document.getElementById("montoPago2").value)
  let tipo = document.getElementById("tipoIngreso2").value

  if (!cliente || isNaN(monto)) {
    alert("Por favor completa todos los campos del pago.")
    return
  }
  pagos.push({ cliente, monto, tipo })
  document.getElementById("clientePago2").value = ""
  document.getElementById("montoPago2").value = ""
  guardar()
  render()
}

// ── INVENTARIO ────────────────────────────────────────────
function agregarInventario() {
  let producto = document.getElementById("productoInventario").value.trim()
  let cantidad = document.getElementById("cantidadInventario").value.trim()
  let propietario = document.getElementById("propietarioInventario").value.trim()
  let estado = document.getElementById("estadoInventario").value

  if (!producto || !cantidad || !propietario || !estado) {
    alert("Por favor completa todos los campos del inventario.")
    return
  }
  inventario.push({ producto, cantidad, propietario, estado })
  document.getElementById("productoInventario").value = ""
  document.getElementById("cantidadInventario").value = ""
  document.getElementById("propietarioInventario").value = ""
  document.getElementById("estadoInventario").value = ""
  guardar()
  render()
}

// ── ELIMINAR ──────────────────────────────────────────────
function eliminar(tipo, index) {
  if (tipo === "cliente") clientes.splice(index, 1)
  if (tipo === "cita") citas.splice(index, 1)
  if (tipo === "pago") pagos.splice(index, 1)
  if (tipo === "inventario") inventario.splice(index, 1)
  guardar()
  render()
}

// ── RENDER ────────────────────────────────────────────────
function render() {

  // Clientes — ahora con columna "Lugar del Servicio"
  let tc = document.getElementById("tablaClientes")
  tc.innerHTML = ""
  clientes.forEach((c, i) => {
    tc.innerHTML += `<tr>
      <td>${c.nombre}</td>
      <td>${c.telefono}</td>
      <td>${c.lugar || "—"}</td>
      <td><button onclick="eliminar('cliente',${i})">Eliminar</button></td>
    </tr>`
  })

  // Citas
  let tci = document.getElementById("tablaCitas")
  tci.innerHTML = ""
  citas.forEach((c, i) => {
    tci.innerHTML += `<tr>
      <td>${c.cliente}</td>
      <td>${c.servicio}</td>
      <td>${c.fecha}</td>
      <td>${c.hora}</td>
      <td>${c.lugar}</td>
      <td><button onclick="eliminar('cita',${i})">Eliminar</button></td>
    </tr>`
  })

  // Pagos (panel manicurista) — con columna "Realizado por"
  let tp2 = document.getElementById("tablaPagos2")
  if (tp2) {
    tp2.innerHTML = ""
    pagos.forEach((p, i) => {
      tp2.innerHTML += `<tr>
        <td>${p.cliente}</td>
        <td>$${p.monto.toLocaleString()}</td>
        <td>${p.tipo}</td>
        <td><button onclick="eliminar('pago',${i})">Eliminar</button></td>
      </tr>`
    })
  }

  // Inventario
  let ti = document.getElementById("tablaInventario")
  ti.innerHTML = ""
  inventario.forEach((item, i) => {
    ti.innerHTML += `<tr>
      <td>${item.producto}</td>
      <td>${item.cantidad}</td>
      <td>${item.propietario || "—"}</td>
      <td>${item.estado || "—"}</td>
      <td><button onclick="eliminar('inventario',${i})">Eliminar</button></td>
    </tr>`
  })

  // Reportes
  document.getElementById("totalClientes").innerText = clientes.length
  document.getElementById("totalCitas").innerText = citas.length
}

// ── LOGIN ─────────────────────────────────────────────────
function login() {
  let usuario = document.getElementById("usuario").value
  let clave = document.getElementById("clave").value

  if (usuario === "manicurista" && clave === "1234") {
    alert("¡Bienvenida Manicurista! 💅")
    mostrar("panelManicurista")
    mostrarPanel("inventarioPanel")
  } else {
    alert("Datos incorrectos")
  }
}

render()