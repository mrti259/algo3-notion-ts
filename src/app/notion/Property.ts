import { Filter } from "./Database";

type PageProperty = any;

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

export class RelationWithOneProperty extends Property<string> {
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

export class RelationWithManyProperty extends Property<Array<string>> {
  protected _filter(values: Array<string>): Filter {
    return {
      and: values.map((value) => ({
        property: this.name,
        relation: value ? { contains: value } : { is_empty: true },
      })),
    };
  }

  mapValue(values: Array<string>): PageProperty {
    return { relation: values.map((value) => ({ id: value })) };
  }

  mapPageProperty(pageProperty: PageProperty): Array<string> | undefined {
    return pageProperty.relation.map((relation: { id: string }) => relation.id);
  }
}
