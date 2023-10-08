import { Client } from "@notionhq/client";
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import { RichTextProperty } from "../notion/properties/RichTextProperty";

export async function obtenerContenido(
  query: Partial<{
    notion_token: string;
    page_id: string;
  }>,
) {
  const { notion_token, page_id } = query || {};
  if (!notion_token || !page_id) {
    return "";
  }

  const client = new Client({ auth: notion_token });
  return await obtenerContenidoDeBloque(client, page_id);
}

async function obtenerContenidoDeBloque(client: Client, block_id: string) {
  const response = await client.blocks.children.list({ block_id: block_id });
  const blocks = response.results as Array<BlockObjectResponse>;
  const content = await Promise.all(
    blocks.map(async (block) =>
      (await convertirAMarkdown(client, block)).trim(),
    ),
  );
  return content.join("\n\n");
}

async function convertirAMarkdown(
  client: Client,
  block: BlockObjectResponse,
): Promise<string> {
  const textProperty = new RichTextProperty(block.type);
  const textoBloque = obtenerTextoDeBloque(textProperty, block);
  const contenidoBloque = block.has_children
    ? await obtenerContenidoDeBloque(client, block.id)
    : "";
  const content = [textoBloque, contenidoBloque];

  return content.join("");
}
function obtenerTextoDeBloque(
  textProperty: RichTextProperty,
  block: BlockObjectResponse,
): string {
  switch (block.type) {
    case "paragraph": {
      const texto = textProperty.mapPageProperty(block[block.type]);
      return texto;
    }
    case "heading_1": {
      const texto = textProperty.mapPageProperty(block[block.type]);
      return `# ${texto}`;
    }
    case "heading_2": {
      const texto = textProperty.mapPageProperty(block[block.type]);
      return `## ${texto}`;
    }
    case "heading_3": {
      const texto = textProperty.mapPageProperty(block[block.type]);
      return `### ${texto}`;
    }
    case "bulleted_list_item": {
      const texto = textProperty.mapPageProperty(block[block.type]);
      return `- ${texto}`;
    }
    case "numbered_list_item": {
      const texto = textProperty.mapPageProperty(block[block.type]);
      return `1. ${texto}`;
    }
    case "quote": {
      const texto = textProperty.mapPageProperty(block[block.type]);
      return `> ${texto}`;
    }
    case "code": {
      const texto = textProperty.mapPageProperty(block[block.type]);
      return `> ${texto}`;
    }
    case "divider": {
      return "---";
    }
    default: {
      throw new Error(`Unsupported block: ${block.type}`);
    }
  }
}
