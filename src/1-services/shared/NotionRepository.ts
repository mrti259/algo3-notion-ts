import type { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";

import { Schema } from "./Schema";

export type Identificable<T> = { id: string } & Partial<T>;

export type AttributesOnFilter<Model> = {
  [k in keyof Model]?: Model[k][];
};

export type Page = PageObjectResponse | PartialPageObjectResponse;

export type Filter = QueryDatabaseParameters["filter"];

export type Properties = PageObjectResponse["properties"];

export class NotionRepository<T> {
  constructor(
    protected client: Client,
    protected database_id: string,
    protected schema: Schema<T>,
  ) {}

  protected mapPages(pages: Page[]) {
    return pages.map((page) => this.schema.mapPage(page));
  }

  async query(attributes: AttributesOnFilter<T>) {
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

  async create(models: Partial<T>[]) {
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
