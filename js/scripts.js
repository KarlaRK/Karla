let clientes = JSON.parse(localStorage.getItem("clientes")) || []
let citas = JSON.parse(localStorage.getItem("citas")) || []
let pagos = JSON.parse(localStorage.getItem("pagos")) || []
let inventario = JSON.parse(localStorage.getItem("inventario")) || []
let manicuristaLogueada = false

function mostrar(id) {
  document.querySelectorAll("section").forEach(s => {
    s.classList.remove("activo")
  })
  document.getElementById(id).classList.add("activo")
}

function guardar() {
  localStorage.setItem("clientes", JSON.stringify(clientes))
  localStorage.setItem("citas", JSON.stringify(citas))
  localStorage.setItem("pagos", JSON.stringify(pagos))
  localStorage.setItem("inventario", JSON.stringify(inventario))
}

function agregarCliente() {
  let nombre = document.getElementById("nombreCliente").value
  let telefono = document.getElementById("telefonoCliente").value
  if (!nombre || !telefono) return
  clientes.push({ nombre, telefono })
  document.getElementById("nombreCliente").value = ""
  document.getElementById("telefonoCliente").value = ""
  guardar()
  render()
}

function agregarCita() {
  let cliente = document.getElementById("clienteCita").value
  let servicio = document.getElementById("servicioCita").value
  let fecha = document.getElementById("fechaCita").value
  let hora = document.getElementById("horaCita").value
  let lugar = document.getElementById("lugarCita").value
  if (!cliente || !fecha || !hora) return
  citas.push({ cliente, servicio, fecha, hora, lugar })
  document.getElementById("clienteCita").value = ""
  document.getElementById("fechaCita").value = ""
  document.getElementById("horaCita").value = ""
  guardar()
  render()
}

function agregarPago() {
  let cliente = document.getElementById("clientePago").value
  let monto = document.getElementById("montoPago").value
  let tipo = document.getElementById("tipoIngreso").value
  if (!cliente || !monto) return
  pagos.push({ cliente, monto: parseInt(monto), tipo })
  document.getElementById("clientePago").value = ""
  document.getElementById("montoPago").value = ""
  guardar()
  render()
}

function agregarInventario() {
  let producto = document.getElementById("productoInventario").value
  let cantidad = document.getElementById("cantidadInventario").value
  if (!producto || !cantidad) return
  inventario.push({ producto, cantidad })
  document.getElementById("productoInventario").value = ""
  document.getElementById("cantidadInventario").value = ""
  guardar()
  render()
}

function eliminar(tipo, index) {
  if (!manicuristaLogueada) return
  if (tipo == "cliente") clientes.splice(index, 1)
  if (tipo == "cita") citas.splice(index, 1)
  if (tipo == "pago") pagos.splice(index, 1)
  if (tipo == "inventario") inventario.splice(index, 1)
  guardar()
  render()
}

function render() {
  // Clientes
  let tc = document.getElementById("tablaClientes")
  tc.innerHTML = ""
  clientes.forEach((c, i) => {
    tc.innerHTML += `<tr>
      <td>${c.nombre}</td>
      <td>${c.telefono}</td>
      ${manicuristaLogueada ? `<td><button onclick="eliminar('cliente',${i})">Eliminar</button></td>` : '<td>—</td>'}
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
      ${manicuristaLogueada ? `<td><button onclick="eliminar('cita',${i})">Eliminar</button></td>` : '<td>—</td>'}
    </tr>`
  })

  // Pagos
  let tp = document.getElementById("tablaPagos")
  tp.innerHTML = ""
  pagos.forEach((p, i) => {
    tp.innerHTML += `<tr>
      <td>${p.cliente}</td>
      <td>$${p.monto}</td>
      <td>${p.tipo}</td>
      <td><button onclick="eliminar('pago',${i})">Eliminar</button></td>
    </tr>`
  })

  // Inventario
  let ti = document.getElementById("tablaInventario")
  ti.innerHTML = ""
  inventario.forEach((item, i) => {
    ti.innerHTML += `<tr>
      <td>${item.producto}</td>
      <td>${item.cantidad}</td>
      <td><button onclick="eliminar('inventario',${i})">Eliminar</button></td>
    </tr>`
  })

  // Reportes
  document.getElementById("totalClientes").innerText = clientes.length
  document.getElementById("totalCitas").innerText = citas.length
}

function actualizarBotonesNav() {
  document.getElementById("btnPagos").style.display = manicuristaLogueada ? "inline-block" : "none"
  document.getElementById("btnReportes").style.display = manicuristaLogueada ? "inline-block" : "none"
}

function login() {
  let usuario = document.getElementById("usuario").value
  let clave = document.getElementById("clave").value

  if (usuario == "manicurista" && clave == "1234") {
    manicuristaLogueada = true
    alert("Bienvenida Manicurista")
    actualizarBotonesNav()
    render()
    mostrar("inventario")
  } else {
    alert("Datos incorrectos")
  }
}

actualizarBotonesNav()
render()