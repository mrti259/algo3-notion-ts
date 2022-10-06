import type { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";

interface Identificable {
  id: string;
}

type AllowUndefined<T> = {
  [k in keyof T]?: T[k];
};

export type Model<T> = Identificable & AllowUndefined<T>;

export type AttributesOnFilter<Model> = {
  [k in keyof Model]?: (Model[k] | null)[];
};

export type Page = PageObjectResponse | PartialPageObjectResponse;
export type Filter = QueryDatabaseParameters["filter"];
export type Properties = PageObjectResponse["properties"];

export abstract class NotionService<T> {
  constructor(protected client: Client, protected database_id: string) {}

  protected abstract mapFilter(
    attributes: AttributesOnFilter<T>
  ): Filter | null;

  protected abstract mapProperties(model: AllowUndefined<T>): Properties;

  protected abstract mapPage(page: Page): Model<T>;

  protected mapPages(pages: Page[]) {
    return pages.map(this.mapPage);
  }

  async query(attributes: AttributesOnFilter<T>) {
    const queryParameters: QueryDatabaseParameters = {
      database_id: this.database_id,
    };

    const filter = this.mapFilter(attributes);

    if (filter) {
      queryParameters["filter"] = filter;
    }

    const pages = await this.client.databases.query(queryParameters);

    return this.mapPages(pages.results);
  }

  async create(models: AllowUndefined<T>[]) {
    const pages = await Promise.all(
      models.map((model) => {
        return this.client.pages.create({
          parent: { database_id: this.database_id },
          properties: this.mapProperties(model),
        });
      })
    );

    return this.mapPages(pages);
  }

  async update(models: Model<T>[]) {
    const pages = await Promise.all(
      models.map((model) => {
        return this.client.pages.update({
          page_id: model.id,
          properties: this.mapProperties(model),
        });
      })
    );

    return this.mapPages(pages);
  }

  async delete(models: Model<T>[]) {
    const pages = await Promise.all(
      models.map((model) => this.client.blocks.delete({ block_id: model.id }))
    );

    return pages.map(({ id }) => {
      id;
    });
  }
}
