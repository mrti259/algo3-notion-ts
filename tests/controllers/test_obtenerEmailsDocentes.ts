import { obtenerEmailsDocentes } from "../../src/app/controllers/obtenerEmailsDocentes";
import { assert, createTests } from "../helpers";

const [test, xtest] = createTests("obtener emails docentes");

test("Obtener emails docentes", async () => {
  const emails = await obtenerEmailsDocentes();
  assert(emails !== null);
});
