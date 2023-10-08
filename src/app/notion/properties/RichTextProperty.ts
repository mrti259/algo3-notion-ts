import { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

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
      .map((item: RichTextItemResponse) => {
        let text = item.plain_text;
        if (item.annotations.bold) text = `**${text}**`;
        if (item.annotations.code) text = `\`${text}\``;
        if (item.annotations.italic) text = `*${text}*`;
        if (item.annotations.strikethrough) text = `~~${text}~~`;
        if (item.annotations.underline) text = `<u>${text}</u>`;
        return text;
      })
      .join("");
  }
}
