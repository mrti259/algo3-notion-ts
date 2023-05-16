/**
 * Autor: Borja Garibotti
 * Descripcion:
 * - Crea en Notion las páginas para las devoluciones segun grupo/estudiante - corrector(es) según el ejercicio/examen seleccionado.
 * Repo: https://github.com/mrti259/algo3-notion-ts
 */

const spreadsheet_id = SpreadsheetApp.getActiveSpreadsheet().getId();
const notion_script_config = {
  app_url: "",
  examenes: {
    endpoint: "api/asignarExamen",
    celdas: "Correctores!B85:F169", // actualizar cada cuatri
  },
  recu_1: {
    endpoint: "api/asignarExamen",
    celdas: "Correctores!B202:E242", // actualizar cada cuatri
  },
  ejercicios: {
    endpoint: "api/asignarEjercicio",
    celdas: "Correctores!A2:H44", // actualizar cada cuatri
  },
  slack: {
    token: "",
    default_channel: "",
  },
  notion: {
    token: "", // actualizar cada cuatri
    db_docente: "", // actualizar cada cuatri
    config_examen: {
      db_ejercicio: "", // actualizar cada cuatri
      db_devolucion: "", // actualizar cada cuatri
    },
    config_ejercicio: {
      db_ejercicio: "", // actualizar cada cuatrr
      db_devolucion: "", // actualizar cada cuatri
    },
  },
};

function completarNombresDeSlack() {
  const mensaje = `Se van a cargar los correctores de ${ejercicio}. Continuar?`;
  const url = notion_script_config.app_url + "api/completarNombresDeSlack";
  const datos = _generarDatosParaCompletarNombresDeSlack();
  _confirmarYEnviar(datos, url, mensaje);
}

function asignarEjercicio(nombre, columna) {
  const { celdas, endpoint } = notion_script_config.ejercicios;
  const datos = _generarDatosParaAsignarEjercicio(celdas, nombre, columna);
  return _asignar(datos, nombre, endpoint);
}

function asignarExamen(nombre, columna) {
  const { celdas, endpoint } = notion_script_config.examenes;
  const datos = _generarDatosParaAsignarExamen(celdas, nombre, columna);
  return _asignar(datos, nombre, endpoint);
}

function asignarRecu1() {
  const { celdas, endpoint } = notion_script_config.recu_1;
  const nombre = "Recuperatorio 1";
  const datos = _generarDatosParaAsignarExamen(celdas, nombre, 3);
  return _asignar(datos, nombre, endpoint);
}

function _asignar(datos, ejercicio, endpoint) {
  const mensaje = `Se van a cargar los correctores de ${ejercicio}. Continuar?`;
  const url = notion_script_config.app_url + endpoint;
  _confirmarYEnviar(datos, url, mensaje);
}

function _confirmarYEnviar(datos, url, mensaje) {
  if (!datos) {
    Logger.log("No data found");
    return;
  }

  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(mensaje, ui.ButtonSet.YES_NO);

  if (response == ui.Button.YES) {
    _postData(url, datos);
  } else {
    Logger.log(
      'The user clicked "No" or the close button in the dialog\'s title bar.',
    );
  }
}

function _generarDatosParaCompletarNombresDeSlack() {
  try {
    const celdas = notion_script_config.ejercicios.celdas;
    const valores = Sheets.Spreadsheets.Values.get(
      spreadsheet_id,
      celdas,
    ).values;
    if (!valores) {
      return null;
    }

    const docentes = new Set();
    valores.forEach((filas) =>
      filas.forEach((celda) =>
        _separarNombres(celda).forEach((nombre) => docentes.add(nombre)),
      ),
    );

    const { notion, slack } = notion_script_config;
    const { config_ejercicio, config_examen, ...config_notion } = notion;
    const config = {
      notion: {
        ...config_notion,
        ...config_ejercicio,
      },
      slack,
    };

    return { config, docentes: [...docentes] };
  } catch (err) {
    return null;
  }
}

function _generarDatosParaAsignarEjercicio(
  celdas,
  nombreEjercicio,
  columnaDocente,
) {
  try {
    const valores = Sheets.Spreadsheets.Values.get(
      spreadsheet_id,
      celdas,
    ).values;
    if (!valores) {
      return null;
    }

    const asignaciones = valores.map((filas) => ({
      nombre: `Grupo ${filas[0]}`,
      docentes: _separarNombres(filas[columnaDocente]),
      ejercicio: nombreEjercicio,
    }));
    const { notion, slack } = notion_script_config;
    const { config_ejercicio, config_examen, ...config_notion } = notion;
    const config = {
      notion: {
        ...config_notion,
        ...config_ejercicio,
      },
      slack,
    };

    return { config, asignaciones };
  } catch (err) {
    return null;
  }
}

function _generarDatosParaAsignarExamen(
  range_name,
  exam_name,
  teachers_column,
) {
  try {
    const valores = Sheets.Spreadsheets.Values.get(
      spreadsheet_id,
      range_name,
    ).values;
    if (!valores) {
      return null;
    }

    const asignaciones = valores.map((filas) => ({
      nombre: `${filas[0]} - ${filas[1]}`,
      docentes: _separarNombres(filas[teachers_column]),
      ejercicio: exam_name,
    }));
    const { notion, slack } = notion_script_config;
    const { config_ejercicio, config_examen, ...config_notion } = notion;
    const config = {
      notion: {
        ...config_notion,
        ...config_examen,
      },
      slack,
    };

    return { config, asignaciones };
  } catch (err) {
    return null;
  }
}

function _postData(url, data) {
  const opciones = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data),
  };
  const response = UrlFetchApp.fetch(url, opciones);
  const content = response.getContentText();
  Logger.log(
    JSON.stringify(
      {
        status_code: response.getResponseCode(),
        response: content,
      },
      null,
      2,
    ),
  );
}

function _separarNombres(nombres) {
  return nombres.split(",").map((nombre) => nombre.trim());
}
