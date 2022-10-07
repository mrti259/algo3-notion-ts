import { Client } from "@notionhq/client";
import { NotionRepository } from "../Models/NotionRepository";
import type { Schema } from "../Models/NotionRepository";

export abstract class NotionService<T> {
  protected repository: NotionRepository<T>;

  constructor(client: Client, database_id: string, schema: Schema<T>) {
    this.repository = new NotionRepository(client, database_id, schema);
  }
}
