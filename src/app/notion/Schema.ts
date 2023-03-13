import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import {
  Filter,
  Identificable,
  Page,
  Properties,
  SearchParams,
} from "./Database";

type SchemaProperties<T> = {
  [key in keyof T]: Property<T[key]>;
};

type PageProperty = any;

export class Schema<T> {
  constructor(public properties: SchemaProperties<T>) {}

  getFilters(attributes: SearchParams<T>): Filter | null {
    const filters: Filter[] = [];

    for (const attribute in attributes) {
      const property = this.properties[attribute];
      const values = attributes[attribute];
      if (!property || !values) continue;
      const filter = property.filter(values);
      if (!filter) continue;
      filters.push(filter);
    }

    if (filters.length === 0) return null;

    return { and: filters } as Filter;
  }

  getProperties(model: Partial<T>): Properties {
    const properties: Properties = {};

    for (const propertyName in model) {
      const property = this.properties[propertyName];
      const value = model[propertyName];
      if (!property || !value) continue;
      properties[property.name] = property.mapValue(value);
    }

    return properties;
  }

  mapPage(page: Page): Identificable<T> {
    const model = { id: page.id } as Identificable<T>;
    const { properties } = page as PageObjectResponse;

    if (!properties) return model;

    for (const propertyName in this.properties) {
      const property = this.properties[propertyName];
      const pageProperty = properties[property.name];
      model[propertyName] = property.mapPageProperty(pageProperty) as any;
    }

    return model;
  }
}

export abstract class Property<TValue> {
  constructor(public name: string) {}

  filter(values: TValue[]): Filter {
    const filters = { or: values.map((value) => this._filter(value)) };
    return filters as Filter;
  }

  protected abstract _filter(value: TValue): Filter;

  abstract mapValue(value: TValue): PageProperty;

  abstract mapPageProperty(pageProperty: PageProperty): TValue | undefined;
}

export class TitleProperty extends Property<string> {
  protected _filter(value: string): Filter {
    return {
      property: this.name,
      title: value ? { equals: value } : { is_empty: true },
    };
  }

  mapValue(value: string): PageProperty {
    return { title: [{ text: { content: value } }] };
  }

  mapPageProperty(pageProperty: PageProperty): string {
    return pageProperty.title
      .map((text: { plain_text: string }) => text.plain_text)
      .join("");
  }
}

export class RelationProperty extends Property<string> {
  protected _filter(value: string): Filter {
    return {
      property: this.name,
      relation: value ? { contains: value } : { is_empty: true },
    };
  }

  mapValue(value: string): PageProperty {
    return { relation: [{ id: value }] };
  }

  mapPageProperty(pageProperty: PageProperty): string | undefined {
    return pageProperty.relation[0]?.id;
  }
}
