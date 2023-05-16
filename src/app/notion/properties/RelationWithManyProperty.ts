import { Filter } from "../Database";
import { PageProperty, Property } from "./Property";

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
