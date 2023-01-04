import { Client } from "@notionhq/client";

import { Repository } from "./Repository";
import { Schema } from "./Schema";

export abstract class Service<T> {
  protected abstract schema: Schema<T>;

  constructor(private client: Client, private database_id: string) {}

  protected get repository() {
    return new Repository(this.client, this.database_id, this.schema);
  }
}
