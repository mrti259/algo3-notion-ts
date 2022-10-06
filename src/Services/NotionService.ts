import { Client } from "@notionhq/client";
import {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export class NotionService {
  constructor(protected client: Client, protected database_id: string) {}

  protected transform({ id }: PageObjectResponse | PartialPageObjectResponse) {
    return {
      id: id.replace(/-/g, ""),
    };
  }
}
