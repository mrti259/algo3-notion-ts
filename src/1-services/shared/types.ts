import {
  PageObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";

export type Identificable<T> = { id: string } & Partial<T>;

export type AttributesOnFilter<Model> = {
  [k in keyof Model]?: Model[k][];
};

export type Page = PageObjectResponse | PartialPageObjectResponse;

export type Filter = QueryDatabaseParameters["filter"];

export type Properties = PageObjectResponse["properties"];
