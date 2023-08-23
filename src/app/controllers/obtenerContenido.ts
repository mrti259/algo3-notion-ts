import { Client } from "@notionhq/client";
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export async function obtenerContenido(
  query: Partial<{
    notion_token: string;
    page_id: string;
  }>,
) {
  const { notion_token, page_id } = query || {};
  if (!notion_token || !page_id) return false;
  const client = new Client({ auth: notion_token });
  const response = await client.blocks.children.list({ block_id: page_id });
  const blocks = response.results as Array<BlockObjectResponse>;
  for (const block of blocks) {
    if (!block.type) continue;
    switch (block.type) {
      case "paragraph": {
        break;
      }
      case "heading_1": {
        break;
      }
      case "heading_2": {
        break;
      }
      case "heading_3": {
        break;
      }
      case "bulleted_list_item": {
        break;
      }
      case "numbered_list_item": {
        break;
      }
      case "quote": {
        break;
      }
      case "to_do": {
        break;
      }
      case "toggle": {
        break;
      }
      case "template": {
        break;
      }
      case "synced_block": {
        break;
      }
      case "child_page": {
        break;
      }
      case "child_database": {
        break;
      }
      case "equation": {
        break;
      }
      case "code": {
        break;
      }
      case "callout": {
        break;
      }
      case "divider": {
        break;
      }
      case "breadcrumb": {
        break;
      }
      case "table_of_contents": {
        break;
      }
      case "column_list": {
        break;
      }
      case "column": {
        break;
      }
      case "link_to_page": {
        break;
      }
      case "table": {
        break;
      }
      case "table_row": {
        break;
      }
      case "embed": {
        break;
      }
      case "bookmark": {
        break;
      }
      case "image": {
        break;
      }
      case "video": {
        break;
      }
      case "pdf": {
        break;
      }
      case "file": {
        break;
      }
      case "audio": {
        break;
      }
      case "link_preview": {
        break;
      }
      case "unsupported": {
        break;
      }
    }
  }
}
