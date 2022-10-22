import { Client } from "@notionhq/client";
import { NotionRepository } from "./NotionRepository";
import { Schema } from "./Schema";

export abstract class NotionService<T> {
  protected abstract schema: Schema<T>;

  constructor(private client: Client, private database_id: string) {}

  protected get repository() {
    return new NotionRepository(this.client, this.database_id, this.schema);
  }
}
