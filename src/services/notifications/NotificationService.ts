import type { UserNotification } from "./UserNotification";
import { SlackService } from "./SlackService";

export class NotificationService {
  private slackService: SlackService;

  constructor(slack_token: string, private default_channel: string) {
    this.slackService = new SlackService(slack_token);
    this.slackService.onMissingChannel = this.onMissingUser;
  }

  private onMissingUser = async (failedNotification: UserNotification) => {
    return await this.slackService.sendMessageToChannel(
      this.default_channel,
      failedNotification.message
    );
  };

  async sendMultipleMessages(notifications: UserNotification[]) {
    return this.slackService.sendMultipleMessages(notifications);
  }
}
