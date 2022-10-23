import {
  AttributesOnFilter,
  Filter,
  Properties,
  Page,
  Identificable,
} from "./NotionRepository";

export abstract class Schema<T> {
  abstract mapFilter(attributes: AttributesOnFilter<T>): Filter | null;
  abstract mapProperties(model: Partial<T>): Properties;
  abstract mapPage(page: Page): Identificable<T>;
}
