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

        sitiosDisponiblesBuscador.push({
            nombre: nombre,
            nombreNormalizado:
                normalizarTextoBuscador(
                    nombre
                ),
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