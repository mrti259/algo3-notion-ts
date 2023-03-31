/**
 * Autor: Borja Garibotti
 * Descripcion:
 * - Crea en Notion las devoluciones segun grupo/estudiante - corrector para el ejercicio/examen seleccionado.
 */
const spreadsheet_id = SpreadsheetApp.getActiveSpreadsheet().getId();
const notion_script_config = {
  app_url: "",
  exams: {
    endpoint: "api/asignarExamen",
    range_name: "Correctores!B85:F169", // actualizar cada cuatri
  },
  recu_1: {
    endpoint: "api/asignarExamen",
    range_name: "Correctores!B202:E242", // actualizar cada cuatri
  },
  exercises: {
    endpoint: "api/asignarEjercicio",
    range_name: "Correctores!A2:H44", // actualizar cada cuatri
  },
  slack: {
    token: "",
    default_channel: "",
  },
  notion: {
    token: "", // actualizar cada cuatri
    db_docente: "", // actualizar cada cuatri
    exam_config: {
      db_ejercicio: "", // actualizar cada cuatri
      db_devolucion: "", // actualizar cada cuatri
    },
    exercise_config: {
      db_ejercicio: "", // actualizar cada cuatri
      db_devolucion: "", // actualizar cada cuatri
    },
  },
};

function asignExercise(exercise_name, exercise_column) {
  const { range_name, endpoint } = notion_script_config.exercises;
  const data = _getExerciseData(range_name, exercise_name, exercise_column);
  return _asign(data, exercise_name, endpoint);
}

function asignExam(exam_name, exam_column) {
  const { range_name, endpoint } = notion_script_config.exams;
  const data = _getExamData(range_name, exam_name, exam_column);
  return _asign(data, exam_name, endpoint);
}

function asignRecu1() {
  const { range_name, endpoint } = notion_script_config.recu_1;
  const exam_name = "Recuperatorio 1";
  const data = _getExamData(range_name, exam_name, 3);
  return _asign(data, exam_name, endpoint);
}

function _asign(data, name, endpoint) {
  if (!data) {
    Logger.log("No data found");
    return;
  }

  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    `Se van a cargar los correctores de ${name}. Continuar?`,
    ui.ButtonSet.YES_NO,
  );

  // Process the user's response.
  if (response == ui.Button.YES) {
    const url = notion_script_config.app_url + endpoint;
    _postData(url, data);
  } else {
    Logger.log(
      'The user clicked "No" or the close button in the dialog\'s title bar.',
    );
  }
}

function _getExerciseData(range_name, exercise_name, teachers_column) {
  try {
    const values = Sheets.Spreadsheets.Values.get(
      spreadsheet_id,
      range_name,
    ).values;
    if (!values) {
      return null;
    }

    const asignaciones = values.map((row) => ({
      nombre: `Grupo ${row[0]}`,
      docentes: row[teachers_column].split(",").map((name) => name.trim()),
      ejercicio: exercise_name,
    }));
    const { notion, slack } = notion_script_config;
    const { exercise_config, exam_config, ...notion_config } = notion;
    const config = {
      notion: {
        ...notion_config,
        ...exercise_config,
      },
      slack,
    };

    return { config, asignaciones };
  } catch (err) {
    // TODO (developer) - Handle Values.get() exception from Sheet API
    return null;
  }
}

function _getExamData(range_name, exam_name, teachers_column) {
  try {
    const values = Sheets.Spreadsheets.Values.get(
      spreadsheet_id,
      range_name,
    ).values;
    if (!values) {
      return null;
    }

    const asignaciones = values.map((row) => ({
      nombre: `${row[0]} - ${row[1]}`,
      docentes: row[teachers_column],
      ejercicio: exam_name,
    }));
    const { notion, slack } = notion_script_config;
    const { exercise_config, exam_config, ...notion_config } = notion;
    const config = {
      notion: {
        ...notion_config,
        ...exam_config,
      },
      slack,
    };

    return { config, asignaciones };
  } catch (err) {
    // TODO (developer) - Handle Values.get() exception from Sheet API
    return null;
  }
}

function _postData(url, data) {
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data),
  };
  const response = UrlFetchApp.fetch(url, options);
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
