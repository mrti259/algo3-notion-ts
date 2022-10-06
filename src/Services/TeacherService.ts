import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionService } from "./NotionService";

export class TeacherService extends NotionService {
  async getTeacher(teacher_name: string) {
    const { results } = await this.client.databases.query({
      database_id: this.database_id,
      filter: {
        property: "Nombre",
        title: {
          equals: teacher_name,
        },
      },
    });

    return results.length
      ? this.transform(results[0] as PageObjectResponse)
      : null;
  }

  async getTeachers(teachers_name: string[]) {
    const { results } = await this.client.databases.query({
      database_id: this.database_id,
      filter: {
        or: teachers_name.map((name) => ({
          property: "Nombre",
          title: {
            equals: name,
          },
        })),
      },
    });

    return results.map(this.transform);
  }

  protected transform({ id, properties }: any) {
    id = id.replace(/-/g, "");
    const name = (properties["Nombre"] as any).title.reduce(
      (str: string, text: any) => str + text.plain_text,
      ""
    );
    const user_id = (properties["Usuario"] as any).people[0]?.id?.replace(
      /-/g,
      ""
    );
    return { id, name, user_id };
  }
}
