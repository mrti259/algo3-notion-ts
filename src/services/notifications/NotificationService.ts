import type { Notification } from "./Notification";
import { SlackService } from "./SlackService";

export class NotificationService {
  slackService: SlackService;

  constructor(slack_token: string, private default_channel: string) {
    this.slackService = new SlackService(slack_token);
    this.slackService.onMissingChannel = this.onMissingUser;
  }

  async sendMultipleMessages(
    notifications: {
      user_name: string;
      message: string;
    }[]
  ) {
    return this.slackService.sendMultipleMessages(notifications);
  }

  private onMissingUser = async (failedNotification: Notification) => {
    return await this.slackService.sendMessageToChannel(
      this.default_channel,
      failedNotification.message
    );
  };
}
