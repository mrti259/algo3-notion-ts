import { WebClient } from "@slack/web-api";

import { UserNotification } from "./UserNotification";

export class SlackService {
  private web: WebClient;

  constructor(token: string) {
    this.web = new WebClient(token);
  }

  async sendMultipleMessages(notifications: UserNotification[]) {
    let { ok, channel_id } = await this.getUserIdsFromRealNames(
      notifications.map((n) => n.user_name),
    );
    if (!channel_id) return { ok };

    const response = await Promise.all(
      channel_id.map((channel, i) =>
        channel
          ? this.sendMessageToChannel(channel, notifications[i].message)
          : this.onMissingChannel(notifications[i]),
      ),
    );

    return { ok: response.every((r) => r.ok) };
  }

  async onMissingChannel(failedNotification: UserNotification) {
    return await Promise.resolve({ ok: false });
  }

  async sendMessageToUserNamed(user_name: string, message: string) {
    let { ok, channel_id } = await this.getUserIdFromRealName(user_name);
    if (!channel_id) return { ok };

    ({ ok } = await this.sendMessageToChannel(channel_id, message));
    return { ok };
  }

  async sendMessageToChannel(channel_id: string, message: string) {
    const response = await this.web.chat
      .postMessage({
        channel: channel_id,
        text: message,
      })
      .catch((e) => e.data);

    const { ok, error } = response;

    return { ok };
  }

  async getUserIdFromRealName(real_name: string) {
    const { ok, users } = await this.getUsersFromRealNames([real_name]);

    if (!users) return { ok };

    const result = users.find((m) => m?.real_name == real_name);

    if (!result) return { ok: false };

    const channel_id = String(result.id);

    return { ok, channel_id };
  }

  async getUserIdsFromRealNames(names: string[]) {
    const { ok, users } = await this.getUsersFromRealNames(names);

    if (!users) return { ok };

    const channel_id = users.map((m) => m?.id);

    return { ok, channel_id };
  }

  async getUsersFromRealNames(names: string[]) {
    const response = await this.web.users.list();

    const { ok, members } = response;

    if (!members) return { ok };

    const users = names.map((name) => members.find((m) => m.real_name == name));

    return { ok, users };
  }
}
