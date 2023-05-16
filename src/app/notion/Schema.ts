import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import {
  Filter,
  Identificable,
  Page,
  Properties,
  SearchParams,
} from "./Database";
import { Property } from "./properties/Property";

type SchemaProperties<T> = {
  [key in keyof T]: Property<T[key]>;
};

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
