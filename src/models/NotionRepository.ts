import type { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";

export type Model<T> = {
  [k in keyof T]?: T[k];
};

export type Identificable<T> = { id: string } & Model<T>;

export type AttributesOnFilter<Model> = {
  [k in keyof Model]?: (Model[k] | null)[];
};

export type Page = PageObjectResponse | PartialPageObjectResponse;

export type Filter = QueryDatabaseParameters["filter"];

export type Properties = PageObjectResponse["properties"];

export abstract class Schema<T> {
  abstract mapFilter(attributes: AttributesOnFilter<T>): Filter | null;
  abstract mapProperties(model: Model<T>): Properties;
  abstract mapPage(page: Page): Identificable<T>;
}

export class NotionRepository<T> {
  constructor(
    protected client: Client,
    protected database_id: string,
    protected schema: Schema<T>
  ) {}

  protected mapPages(pages: Page[]) {
    return pages.map(this.schema.mapPage);
  }

  async query(attributes: AttributesOnFilter<T>) {
    const queryParameters: QueryDatabaseParameters = {
      database_id: this.database_id,
    };

    const filter = this.schema.mapFilter(attributes);

    if (filter) {
      queryParameters["filter"] = filter;
    }

    const pages = await this.client.databases.query(queryParameters);

    return this.mapPages(pages.results);
  }

  async create(models: Model<T>[]) {
    const pages = await Promise.all(
      models.map((model) => {
        return this.client.pages.create({
          parent: { database_id: this.database_id },
          properties: this.schema.mapProperties(model),
        });
      })
    );

    return this.mapPages(pages);
  }

  async update(models: Identificable<T>[]) {
    const pages = await Promise.all(
      models.map((model) => {
        return this.client.pages.update({
          page_id: model.id,
          properties: this.schema.mapProperties(model),
        });
      })
    );

    return this.mapPages(pages);
  }

  async delete(models: Identificable<T>[]) {
    const pages = await Promise.all(
      models.map((model) => this.client.blocks.delete({ block_id: model.id }))
    );

    return pages.map(({ id }) => {
      id;
    });
  }
}
