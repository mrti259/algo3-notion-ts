import { obtenerContenido } from "../../src/app/controllers/obtenerContenido";
import { NOTION_TOKEN, PAGE_ID } from "../constants";
import { assert, createTests } from "../helpers";

const [test, xtest] = createTests("obtener contenido");

test("Obtener contenido", async () => {
  const contenido = await obtenerContenido({
    notion_token: NOTION_TOKEN,
    page_id: PAGE_ID,
  });
  assert(contenido.length > 0);
});
