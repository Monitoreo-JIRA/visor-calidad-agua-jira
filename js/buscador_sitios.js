// ==========================================
// BUSCADOR PERSONALIZADO DE SITIOS
// ==========================================

const campoBuscarSitio =
    document.getElementById(
        'buscar-sitio'
    );

const botonBuscarSitio =
    document.getElementById(
        'boton-buscar-sitio'
    );

const contenedorResultados =
    document.getElementById(
        'resultados-buscador-sitios'
    );

const mensajeBuscadorSitios =
    document.getElementById(
        'mensaje-buscador-sitios'
    );


let sitiosDisponiblesBuscador = [];
let resultadosVisibles = [];
let indiceResultadoActivo = -1;


// ------------------------------------------
// NORMALIZAR TEXTO
// ------------------------------------------

function normalizarTextoBuscador(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            ''
        )
        .toLowerCase()
        .trim();
}


// ------------------------------------------
// OBTENER NOMBRE DEL SITIO
// ------------------------------------------

function obtenerNombreSitioBuscador(layer) {
    const propiedades =
        layer.feature?.properties ?? {};

    return (
        propiedades.Sitio ??
        propiedades['Sitios de monitoreo'] ??
        propiedades.Nombre_Sitio ??
        propiedades.NOMBRE ??
        propiedades.Nombre ??
        propiedades.nombre ??
        propiedades.sitio ??
        propiedades.Name ??
        propiedades.description ??
        ''
    );
}


// ------------------------------------------
// OBTENER CAPA DE SITIOS
// ------------------------------------------

function obtenerCapaSitiosBuscador() {
    if (
        typeof window.capaSitios !==
            'undefined' &&
        window.capaSitios
    ) {
        return window.capaSitios;
    }

    if (
        typeof capaSitios !==
            'undefined' &&
        capaSitios
    ) {
        return capaSitios;
    }

    return null;
}


// ------------------------------------------
// MENSAJE
// ------------------------------------------

function mostrarMensajeBuscador(
    texto,
    esError = false
) {
    mensajeBuscadorSitios.textContent =
        texto;

    mensajeBuscadorSitios.classList.toggle(
        'error',
        esError
    );
}


// ------------------------------------------
// OCULTAR RESULTADOS
// ------------------------------------------

function ocultarResultadosBuscador() {
    contenedorResultados.classList.add(
        'oculto'
    );

    contenedorResultados.innerHTML = '';
    resultadosVisibles = [];
    indiceResultadoActivo = -1;
}


// ------------------------------------------
// MARCAR RESULTADO ACTIVO
// ------------------------------------------

function actualizarResultadoActivo() {
    const botones =
        contenedorResultados.querySelectorAll(
            '.resultado-sitio'
        );

    botones.forEach(
        function (boton, indice) {
            boton.classList.toggle(
                'activo',
                indice ===
                    indiceResultadoActivo
            );
        }
    );

    const botonActivo =
        botones[indiceResultadoActivo];

    if (botonActivo) {
        botonActivo.scrollIntoView({
            block: 'nearest'
        });
    }
}


// ------------------------------------------
// RESALTAR TEXTO ENCONTRADO
// ------------------------------------------

function crearNombreResaltado(
    nombre,
    textoBuscado
) {
    const textoOriginal =
        String(nombre);

    const contenedor =
        document.createElement(
            'span'
        );

    const textoNormalizado =
        normalizarTextoBuscador(
            textoOriginal
        );

    const busquedaNormalizada =
        normalizarTextoBuscador(
            textoBuscado
        );

    if (!busquedaNormalizada) {
        contenedor.textContent =
            textoOriginal;

        return contenedor;
    }

    const indice =
        textoNormalizado.indexOf(
            busquedaNormalizada
        );

    if (indice === -1) {
        contenedor.textContent =
            textoOriginal;

        return contenedor;
    }

    const antes =
        textoOriginal.slice(
            0,
            indice
        );

    const coincidencia =
        textoOriginal.slice(
            indice,
            indice +
                busquedaNormalizada.length
        );

    const despues =
        textoOriginal.slice(
            indice +
                busquedaNormalizada.length
        );

    contenedor.append(
        document.createTextNode(
            antes
        )
    );

    const resaltado =
        document.createElement(
            'span'
        );

    resaltado.className =
        'texto-encontrado';

    resaltado.textContent =
        coincidencia;

    contenedor.append(
        resaltado
    );

    contenedor.append(
        document.createTextNode(
            despues
        )
    );

    return contenedor;
}


// ------------------------------------------
// RENDERIZAR RESULTADOS
// ------------------------------------------

function mostrarResultadosBuscador(
    resultados
) {
    contenedorResultados.innerHTML = '';

    resultadosVisibles =
        resultados.slice(0, 8);

    indiceResultadoActivo = -1;

    if (
        resultadosVisibles.length === 0
    ) {
        ocultarResultadosBuscador();
        return;
    }

    resultadosVisibles.forEach(
        function (sitio, indice) {
            const boton =
                document.createElement(
                    'button'
                );

            boton.type = 'button';
            boton.className =
                'resultado-sitio';

            boton.setAttribute(
                'role',
                'option'
            );

            boton.appendChild(
                crearNombreResaltado(
                    sitio.nombre,
                    campoBuscarSitio.value
                )
            );

            boton.addEventListener(
                'click',
                function () {
                    seleccionarSitioBuscador(
                        sitio
                    );
                }
            );

            boton.addEventListener(
                'mouseenter',
                function () {
                    indiceResultadoActivo =
                        indice;

                    actualizarResultadoActivo();
                }
            );

            contenedorResultados.appendChild(
                boton
            );
        }
    );

    contenedorResultados.classList.remove(
        'oculto'
    );
}


// ------------------------------------------
// FILTRAR
// ------------------------------------------

function filtrarSitiosBuscador() {
    const texto =
        normalizarTextoBuscador(
            campoBuscarSitio.value
        );

    mostrarMensajeBuscador('');

    if (!texto) {
        ocultarResultadosBuscador();
        return;
    }

    const coincidencias =
        sitiosDisponiblesBuscador.filter(
            function (sitio) {
                return sitio
                    .nombreNormalizado
                    .includes(texto);
            }
        );

    mostrarResultadosBuscador(
        coincidencias
    );
}


// ------------------------------------------
// OBTENER MUNICIPIO Y LOCALIDAD
// ------------------------------------------

function obtenerMunicipioSitioBuscador(layer) {
    const propiedades =
        layer.feature?.properties ?? {};

    return String(
        propiedades.Municipio ??
        propiedades.municipio ??
        ''
    ).trim();
}


function obtenerLocalidadSitioBuscador(layer) {
    const propiedades =
        layer.feature?.properties ?? {};

    return String(
        propiedades.Localidad ??
        propiedades.localidad ??
        ''
    ).trim();
}


// ------------------------------------------
// ORDENAR TEXTO EN ESPAÑOL
// ------------------------------------------

function ordenarTextoEspanol(a, b) {
    return String(a).localeCompare(
        String(b),
        'es',
        {
            sensitivity: 'base'
        }
    );
}


// ------------------------------------------
// CARGAR SITIOS
// ------------------------------------------

function cargarSitiosEnBuscador() {
    const capa =
        obtenerCapaSitiosBuscador();

    if (!capa) {
        return false;
    }

    sitiosDisponiblesBuscador = [];

    capa.eachLayer(function (layer) {
        const nombre =
            String(
                obtenerNombreSitioBuscador(
                    layer
                )
            ).trim();

        if (!nombre) {
            return;
        }

        const municipio =
            obtenerMunicipioSitioBuscador(
                layer
            );

        const localidad =
            obtenerLocalidadSitioBuscador(
                layer
            );

        sitiosDisponiblesBuscador.push({
            nombre: nombre,
            nombreNormalizado:
                normalizarTextoBuscador(
                    nombre
                ),
            municipio: municipio,
            localidad: localidad,
            layer: layer
        });
    });

    sitiosDisponiblesBuscador.sort(
        function (a, b) {
            return a.nombre.localeCompare(
                b.nombre,
                'es'
            );
        }
    );

    return (
        sitiosDisponiblesBuscador.length >
        0
    );
}


// ------------------------------------------
// ENFOCAR SITIO
// ------------------------------------------

function enfocarSitioBuscador(sitio) {
    const layer = sitio.layer;

    if (
        !layer ||
        typeof layer.getLatLng !==
            'function'
    ) {
        mostrarMensajeBuscador(
            'No fue posible localizar el sitio.',
            true
        );

        return;
    }

    const capa =
        obtenerCapaSitiosBuscador();

    if (
        capa &&
        !map.hasLayer(capa)
    ) {
        capa.addTo(map);

        const checkSitios =
            document.getElementById(
                'capa-sitios-check'
            );

        if (checkSitios) {
            checkSitios.checked = true;
        }
    }

    const coordenadas =
        layer.getLatLng();

    map.flyTo(
        coordenadas,
        15,
        {
            duration: 0.8
        }
    );

    setTimeout(function () {
        layer.fire('click');

        if (
            typeof layer.openPopup ===
                'function'
        ) {
            layer.openPopup();
        }
    }, 850);
}


// ------------------------------------------
// SELECCIONAR SITIO
// ------------------------------------------

function seleccionarSitioBuscador(sitio) {
    campoBuscarSitio.value =
        sitio.nombre;

    mostrarMensajeBuscador(
        sitio.nombre
    );

    ocultarResultadosBuscador();

    enfocarSitioBuscador(
        sitio
    );
}


// ------------------------------------------
// BUSCAR DESDE BOTÓN O ENTER
// ------------------------------------------

function buscarSitio() {
    const texto =
        normalizarTextoBuscador(
            campoBuscarSitio.value
        );

    if (!texto) {
        mostrarMensajeBuscador(
            'Escribe el nombre de un sitio.',
            true
        );

        return;
    }

    let sitioEncontrado =
        sitiosDisponiblesBuscador.find(
            function (sitio) {
                return (
                    sitio.nombreNormalizado ===
                    texto
                );
            }
        );

    if (!sitioEncontrado) {
        sitioEncontrado =
            sitiosDisponiblesBuscador.find(
                function (sitio) {
                    return sitio
                        .nombreNormalizado
                        .includes(texto);
                }
            );
    }

    if (!sitioEncontrado) {
        mostrarMensajeBuscador(
            'No se encontró un sitio con ese nombre.',
            true
        );

        return;
    }

    seleccionarSitioBuscador(
        sitioEncontrado
    );
}


// ------------------------------------------
// EVENTOS
// ------------------------------------------

campoBuscarSitio.addEventListener(
    'input',
    filtrarSitiosBuscador
);


campoBuscarSitio.addEventListener(
    'focus',
    filtrarSitiosBuscador
);


campoBuscarSitio.addEventListener(
    'keydown',
    function (evento) {
        if (
            evento.key ===
            'ArrowDown'
        ) {
            evento.preventDefault();

            if (
                resultadosVisibles.length ===
                0
            ) {
                filtrarSitiosBuscador();
                return;
            }

            indiceResultadoActivo =
                Math.min(
                    indiceResultadoActivo + 1,
                    resultadosVisibles.length - 1
                );

            actualizarResultadoActivo();
        }

        if (
            evento.key ===
            'ArrowUp'
        ) {
            evento.preventDefault();

            indiceResultadoActivo =
                Math.max(
                    indiceResultadoActivo - 1,
                    0
                );

            actualizarResultadoActivo();
        }

        if (
            evento.key ===
            'Enter'
        ) {
            evento.preventDefault();

            if (
                indiceResultadoActivo >= 0
            ) {
                seleccionarSitioBuscador(
                    resultadosVisibles[
                        indiceResultadoActivo
                    ]
                );
            } else {
                buscarSitio();
            }
        }

        if (
            evento.key ===
            'Escape'
        ) {
            ocultarResultadosBuscador();
        }
    }
);


botonBuscarSitio.addEventListener(
    'click',
    buscarSitio
);


document.addEventListener(
    'click',
    function (evento) {
        const buscador =
            evento.target.closest(
                '.buscador-sitios'
            );

        if (!buscador) {
            ocultarResultadosBuscador();
        }
    }
);


// ------------------------------------------
// ESPERAR LA CAPA DE SITIOS
// ------------------------------------------

let intentosCargaBuscador = 0;

const intervaloCargaBuscador =
    setInterval(
        function () {
            const cargado =
                cargarSitiosEnBuscador();

            intentosCargaBuscador += 1;

            if (
                cargado ||
                intentosCargaBuscador >= 40
            ) {
                clearInterval(
                    intervaloCargaBuscador
                );

                if (!cargado) {
                    mostrarMensajeBuscador(
                        'No fue posible cargar la lista de sitios.',
                        true
                    );
                }
            }
        },
        250
    );


console.log(
    'Buscador personalizado cargado.'
);

// ==========================================
// BUSCADOR POR MUNICIPIO Y LOCALIDAD
// ==========================================

const botonMostrarUbicacion =
    document.getElementById(
        'boton-mostrar-ubicacion'
    );

const contenidoBuscadorUbicacion =
    document.getElementById(
        'contenido-buscador-ubicacion'
    );

const filtroMunicipioSitios =
    document.getElementById(
        'filtro-municipio-sitios'
    );

const filtroLocalidadSitios =
    document.getElementById(
        'filtro-localidad-sitios'
    );

const contadorSitiosUbicacion =
    document.getElementById(
        'contador-sitios-ubicacion'
    );

const listaSitiosUbicacion =
    document.getElementById(
        'lista-sitios-ubicacion'
    );


// ------------------------------------------
// LLENAR MUNICIPIOS
// ------------------------------------------

function cargarMunicipiosBuscador() {
    if (
        !filtroMunicipioSitios ||
        sitiosDisponiblesBuscador.length === 0
    ) {
        return;
    }

    const municipios =
        [
            ...new Set(
                sitiosDisponiblesBuscador
                    .map(function (sitio) {
                        return sitio.municipio;
                    })
                    .filter(Boolean)
            )
        ].sort(ordenarTextoEspanol);

    filtroMunicipioSitios.innerHTML = '';

    const opcionInicial =
        document.createElement(
            'option'
        );

    opcionInicial.value = '';
    opcionInicial.textContent =
        'Seleccionar municipio...';

    filtroMunicipioSitios.appendChild(
        opcionInicial
    );

    municipios.forEach(
        function (municipio) {
            const opcion =
                document.createElement(
                    'option'
                );

            opcion.value = municipio;
            opcion.textContent = municipio;

            filtroMunicipioSitios.appendChild(
                opcion
            );
        }
    );
}


// ------------------------------------------
// LLENAR LOCALIDADES
// ------------------------------------------

function cargarLocalidadesBuscador(
    municipio
) {
    if (!filtroLocalidadSitios) {
        return;
    }

    filtroLocalidadSitios.innerHTML = '';

    if (!municipio) {
        const opcion =
            document.createElement(
                'option'
            );

        opcion.value = '';
        opcion.textContent =
            'Selecciona primero un municipio';

        filtroLocalidadSitios.appendChild(
            opcion
        );

        filtroLocalidadSitios.disabled = true;

        return;
    }

    const localidades =
        [
            ...new Set(
                sitiosDisponiblesBuscador
                    .filter(function (sitio) {
                        return (
                            normalizarTextoBuscador(
                                sitio.municipio
                            ) ===
                            normalizarTextoBuscador(
                                municipio
                            )
                        );
                    })
                    .map(function (sitio) {
                        return sitio.localidad;
                    })
                    .filter(Boolean)
            )
        ].sort(ordenarTextoEspanol);

    const opcionTodas =
        document.createElement(
            'option'
        );

    opcionTodas.value = '';
    opcionTodas.textContent =
        'Todas las localidades';

    filtroLocalidadSitios.appendChild(
        opcionTodas
    );

    localidades.forEach(
        function (localidad) {
            const opcion =
                document.createElement(
                    'option'
                );

            opcion.value = localidad;
            opcion.textContent = localidad;

            filtroLocalidadSitios.appendChild(
                opcion
            );
        }
    );

    filtroLocalidadSitios.disabled = false;
}


// ------------------------------------------
// MOSTRAR SITIOS POR UBICACIÓN
// ------------------------------------------

function mostrarSitiosPorUbicacion() {
    if (
        !listaSitiosUbicacion ||
        !contadorSitiosUbicacion
    ) {
        return;
    }

    const municipio =
        filtroMunicipioSitios?.value ?? '';

    const localidad =
        filtroLocalidadSitios?.value ?? '';

    listaSitiosUbicacion.innerHTML = '';

    if (!municipio) {
        contadorSitiosUbicacion.textContent =
            '0';

        const mensaje =
            document.createElement(
                'p'
            );

        mensaje.className =
            'mensaje-sitios-ubicacion';

        mensaje.textContent =
            'Selecciona un municipio para mostrar sus sitios.';

        listaSitiosUbicacion.appendChild(
            mensaje
        );

        return;
    }

    const sitiosFiltrados =
        sitiosDisponiblesBuscador
            .filter(function (sitio) {
                const coincideMunicipio =
                    normalizarTextoBuscador(
                        sitio.municipio
                    ) ===
                    normalizarTextoBuscador(
                        municipio
                    );

                const coincideLocalidad =
                    !localidad ||
                    normalizarTextoBuscador(
                        sitio.localidad
                    ) ===
                    normalizarTextoBuscador(
                        localidad
                    );

                return (
                    coincideMunicipio &&
                    coincideLocalidad
                );
            })
            .sort(function (a, b) {
                return ordenarTextoEspanol(
                    a.nombre,
                    b.nombre
                );
            });

    contadorSitiosUbicacion.textContent =
        String(
            sitiosFiltrados.length
        );

    if (sitiosFiltrados.length === 0) {
        const mensaje =
            document.createElement(
                'p'
            );

        mensaje.className =
            'mensaje-sitios-ubicacion';

        mensaje.textContent =
            'No hay sitios disponibles para esta selección.';

        listaSitiosUbicacion.appendChild(
            mensaje
        );

        return;
    }

    sitiosFiltrados.forEach(
        function (sitio) {
            const boton =
                document.createElement(
                    'button'
                );

            boton.type = 'button';
            boton.className =
                'boton-sitio-ubicacion';

            const contenido =
                document.createElement(
                    'span'
                );

            contenido.className =
                'contenido-sitio-ubicacion';

            const nombre =
                document.createElement(
                    'strong'
                );

            nombre.textContent =
                sitio.nombre;

            contenido.appendChild(
                nombre
            );

            if (sitio.localidad) {
                const detalle =
                    document.createElement(
                        'small'
                    );

                detalle.textContent =
                    sitio.localidad;

                contenido.appendChild(
                    detalle
                );
            }

            boton.appendChild(
                contenido
            );

            boton.addEventListener(
                'click',
                function () {
                    campoBuscarSitio.value =
                        sitio.nombre;

                    seleccionarSitioBuscador(
                        sitio
                    );
                }
            );

            listaSitiosUbicacion.appendChild(
                boton
            );
        }
    );
}


// ------------------------------------------
// ABRIR Y CERRAR
// ------------------------------------------

if (
    botonMostrarUbicacion &&
    contenidoBuscadorUbicacion
) {
    botonMostrarUbicacion.addEventListener(
        'click',
        function () {
            const seAbrira =
                contenidoBuscadorUbicacion
                    .classList
                    .contains(
                        'oculto'
                    );

            contenidoBuscadorUbicacion
                .classList
                .toggle(
                    'oculto'
                );

            botonMostrarUbicacion.setAttribute(
                'aria-expanded',
                seAbrira
                    ? 'true'
                    : 'false'
            );
        }
    );
}


// ------------------------------------------
// EVENTOS
// ------------------------------------------

if (filtroMunicipioSitios) {
    filtroMunicipioSitios.addEventListener(
        'change',
        function () {
            cargarLocalidadesBuscador(
                this.value
            );

            mostrarSitiosPorUbicacion();
        }
    );
}


if (filtroLocalidadSitios) {
    filtroLocalidadSitios.addEventListener(
        'change',
        mostrarSitiosPorUbicacion
    );
}


// ------------------------------------------
// PREPARAR CUANDO CARGUEN LOS SITIOS
// ------------------------------------------

function prepararBuscadorUbicacion() {
    if (
        sitiosDisponiblesBuscador.length === 0
    ) {
        return false;
    }

    cargarMunicipiosBuscador();
    mostrarSitiosPorUbicacion();

    return true;
}


let intentosCargaUbicacion = 0;

const intervaloCargaUbicacion =
    setInterval(
        function () {
            const listo =
                prepararBuscadorUbicacion();

            intentosCargaUbicacion += 1;

            if (
                listo ||
                intentosCargaUbicacion >= 40
            ) {
                clearInterval(
                    intervaloCargaUbicacion
                );
            }
        },
        250
    );


console.log(
    'Buscador por municipio y localidad cargado.'
);
