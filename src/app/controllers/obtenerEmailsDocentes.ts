import axios from "axios";

const source =
  "https://raw.githubusercontent.com/Ingenieria-de-software-I/ingenieria-de-software-i.github.io/main/_data/docentes.json";

export async function obtenerEmailsDocentes() {
  const results: Array<{ email?: string }> = await axios
    .get(source, {})
    .then((res) => res.data);
  const emails = results.map((d) => d.email).filter(Boolean);
  return emails.join(", ");
}
