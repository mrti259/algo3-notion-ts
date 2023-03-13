import type { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";

import { Schema } from "./Schema";

export type Identificable<T> = { id: string } & T;

export type SearchParams<T> = {
  [k in keyof T]?: Array<T[k]>;
};

export type Page = PageObjectResponse | PartialPageObjectResponse;

export type Filter = QueryDatabaseParameters["filter"];

export type Properties = PageObjectResponse["properties"];

export class Database<T> {
  constructor(
    protected client: Client,
    protected database_id: string,
    protected schema: Schema<T>,
  ) {}

  protected mapPages(pages: Page[]) {
    return pages.map((page) => this.schema.mapPage(page));
  }

  async query(attributes: SearchParams<T>) {
    const queryParameters: QueryDatabaseParameters = {
      database_id: this.database_id,
    };

    const filter = this.schema.getFilters(attributes);

    if (filter) {
      queryParameters["filter"] = filter;
    }

    const pages = await this.client.databases.query(queryParameters);

    return this.mapPages(pages.results);
  }

  async create(models: T[]) {
    const pages = await Promise.all(
      models.map((model) => {
        return this.client.pages.create({
          parent: { database_id: this.database_id },
          properties: this.schema.getProperties(model),
        });
      }),
    );

    return this.mapPages(pages);
  }

  async update(models: Identificable<T>[]) {
    const pages = await Promise.all(
      models.map((model) => {
        return this.client.pages.update({
          page_id: model.id,
          properties: this.schema.getProperties(model),
        });
      }),
    );

    return this.mapPages(pages);
  }

  async delete(models: Identificable<T>[]) {
    const pages = await Promise.all(
      models.map((model) => this.client.blocks.delete({ block_id: model.id })),
    );

    return pages.map(({ id }) => {
      id;
    });
  }
}
