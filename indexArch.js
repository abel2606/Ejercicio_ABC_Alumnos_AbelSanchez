
// Modulos clases que se necesitan
const fs = require('fs');
const readline = require('readline');
const Alumno = require('./alumnos');
const Carrera = require('./carreras');

const rl = readline.createInterface({
    input: process.stdin, //proceso de entrada (pregunta o instrucciones para leer entrada de datos)
    output: process.stdout //funcion que procesa el dato recibido en el input lo transforma y genera un output
});

const dataFolder = './data/';
const alumnosFile = dataFolder + 'alumnos.json';
const carrerasFile = dataFolder + 'carreras.json';

let alumnos = [];
let carreras = [];

function cargarDatos() {
    //instrucciones para leer datos del archivo .json y cargarlo en los arreglos
    if (fs.existsSync(alumnosFile)) {
        const datosAlu = fs.readFileSync(alumnosFile, "utf8");
        alumnos = JSON.parse(datosAlu);

    }
    if (fs.existsSync(carrerasFile)) {
        const datosAluCarrera = fs.readFileSync(carrerasFile, "utf8");
        carreras = JSON.parse(datosAluCarrera);

    }


}

function guardarDatos() {
    //instrucciones para guardar datos en el archivo .json

    fs.writeFileSync(alumnosFile, JSON.stringify(alumnos, null, 2));
    fs.writeFileSync(carrerasFile, JSON.stringify(carreras, null, 2));

}

function mostrarMenuPrincipal() {
    console.log('\n** Menú **');
    console.log('1. Alumnos');
    console.log('2. Carreras');
    console.log('3. Salir');
}

function mostrarSubMenuEntidad(entidad) {
    console.log(`\n** ${entidad} **`);
    console.log('1. Ver listado');
    console.log('2. Agregar');
    console.log('3. Borrar');
    console.log('4. Cambiar');
    console.log('5. Agregar alumno a carrera');
    console.log('6. Volver al menú principal');
}

function mostrarListado(entidad) {
    if (entidad === 'alumnos') {
        console.log(`Se identificaron: ${alumnos.length} alumnos`);
        alumnos.forEach(alumno => {
            const carreraNombre = alumno.carrera ? (carreras.find(c => c.id === alumno.carrera)?.nombre || "No asignada") : "No asignada";
            console.log(`ID: ${alumno.id} | Nombre: ${alumno.nombre} | Carrera: ${carreraNombre}`);
        });
    }

    else if (entidad === 'carreras') {
        console.log(`Se identificaron: ${carreras.length} carreras`);
        carreras.forEach(carrera => {
            console.log(`ID: ${carrera.id} | Nombre: ${carrera.nombre} | Alumnos inscritos: ${carrera.alumnos.length}`);
        });

    }
}

function agregar(entidad, clase) {
    rl.question(`Ingrese el nombre del nuevo ${entidad}: `, nombre => {
        //instrucciones para añadir el elemento a la lista (recuerda guardar los cambios en el json)
        let lista = entidad === "alumnos" ? alumnos : carreras;

        let id = null
        if (lista.length > 0) {
            id = lista[lista.length - 1].id + 1
        }
        else {
            id = 1
        }


        const nuevoObjeto = new clase(id, nombre);

        lista.push(nuevoObjeto);

        guardarDatos();

        seleccionarAccionEntidad(entidad);

    });
}


function borrar(entidad, clase) {
    mostrarListado(entidad);
    rl.question(`Ingrese el ID del ${entidad} que desea borrar: `, id => {
        //instrucciones para eliminar el elemento a la lista (recuerda guardar los cambios en el json)
        let lista = entidad === "alumnos" ? alumnos : carreras;
        const idNum = Number(id);
        const originalLength = lista.length;

        lista = lista.filter(a => a.id !== idNum);

        if (lista.length < originalLength) {
            if (entidad === "alumnos") {
                alumnos = lista
                carreras.forEach(carrera => {
                    const studentIndex = carrera.alumnos.indexOf(idNum);
                    if (studentIndex > -1) {
                        carrera.alumnos.splice(studentIndex, 1);
                    }
                });
            }
            else {
                carreras = lista;
            }
            guardarDatos();
            console.log(`${entidad.slice(0, -1)} eliminado correctamente.`)
        }
        else {
            console.log("No se encontró ese ID.")
        }
        seleccionarAccionEntidad(entidad);
    });

}

function cambiar(entidad, clase) {
    mostrarListado(entidad);
    rl.question(`Ingrese el ID del ${entidad} que desea cambiar: `, id => {
        //instrucciones para modificar el elemento a la lista (recuerda guardar los cambios en el json)

        const idNum = Number(id);

        const lista = entidad === "alumnos" ? alumnos : carreras;

        const item = lista.find(i => i.id === idNum)

        if (item) {
            rl.question(`Ingrese el nuevo nombre para ${item.nombre}: `, nuevoNombre => {
                item.nombre = nuevoNombre;
                guardarDatos();
                console.log(`${entidad.slice(0, -1)} modificado correctamente.`);
                seleccionarAccionEntidad(entidad);
            });
        }
        else {
            console.log("Error: No se encontró ningún elemento con ese ID.");
            seleccionarAccionEntidad(entidad);
        }
    });
}

function asignarAlumnoACarrera() {
    mostrarListado('alumnos');
    rl.question(`Ingrese el ID del alumno que desea asignar a una carrera: `, idAlumno => {
        //instrucciones para asignar un alumno a una clase
        const idAlumnoNum = Number(idAlumno);
        const alumno = alumnos.find(a => a.id === idAlumnoNum);

        if (!alumno) {
            console.log("Error: No se encontró un alumno con ese ID.");
            seleccionarAccionEntidad('alumnos');
            return;
        }
        mostrarListado("carreras");
        rl.question(`Ingrese el ID de la carrear a la que desea asignar a ${alumno.nombre}: `, idCarrera => {
            const idCarreraNum = Number(idCarrera);
            const carrera = carreras.find(c => c.id === idCarreraNum);

            if (!carrera) {
                console.log("Error: No se encontró una carrera con ese ID.");
                seleccionarAccionEntidad('alumnos');
                return;
            }

            alumno.carrera = idCarreraNum;

            if (!carrera.alumnos.includes(idAlumnoNum)) {
                carrera.alumnos.push(idAlumnoNum);
            }
            guardarDatos();

            console.log(`Alumno "${alumno.nombre}" asignado correctamente a la carrera "${carrera.nombre}".`);
            seleccionarAccionEntidad('alumnos');
        });

    });
}

function seleccionarAccionPrincipal() {
    cargarDatos();
    mostrarMenuPrincipal();
    rl.question('Seleccione una opción: ', opcion => {
        switch (opcion) {
            case '1':
                seleccionarAccionEntidad('alumnos');
                break;
            case '2':
                seleccionarAccionEntidad('carreras');
                break;
            case '3':
                console.log('¡Hasta luego!');
                guardarDatos();
                rl.close();
                break;
            default:
                console.log('Opción no válida.');
                seleccionarAccionPrincipal();
        }
    });
}

// Modifica la función para seleccionar acción en entidad (listado, agregar, borrar, cambiar)
function seleccionarAccionEntidad(entidad) {
    cargarDatos();
    mostrarSubMenuEntidad(entidad);
    rl.question(`Seleccione una opción en ${entidad}: `, opcion => {
        switch (opcion) {
            case '1':
                mostrarListado(entidad);
                seleccionarAccionEntidad(entidad);
                break;
            case '2':
                agregar(entidad, entidad === 'alumnos' ? Alumno : Carrera);
                break;
            case '3':
                borrar(entidad, entidad === 'alumnos' ? Alumno : Carrera);
                break;
            case '4':
                cambiar(entidad, entidad === 'alumnos' ? Alumno : Carrera);
                break;
            case '5':
                asignarAlumnoACarrera();
                break;
            case '6':
                seleccionarAccionPrincipal();
                break;
            default:
                console.log('Opción no válida.');
                seleccionarAccionEntidad(entidad);
        }
    });
}

// Iniciar el programa
seleccionarAccionPrincipal();
