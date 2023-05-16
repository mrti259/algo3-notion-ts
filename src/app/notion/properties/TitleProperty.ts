import { Filter } from "../Database";
import { PageProperty, Property } from "./Property";

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
