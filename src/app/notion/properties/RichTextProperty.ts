import { Filter } from "../Database";
import { PageProperty, Property } from "./Property";

export class RichTextProperty extends Property<string> {
  protected _filter(value: string): Filter {
    return {
      property: this.name,
      rich_text: value ? { equals: value } : { is_empty: true },
    };
  }

  mapValue(value: string): PageProperty {
    return { rich_text: [{ text: { content: value } }] };
  }

  mapPageProperty(pageProperty: PageProperty): string {
    return pageProperty.rich_text
      .map((text: { plain_text: string }) => text.plain_text)
      .join("");
  }
}
