import { SlackService } from "./SlackService";
import { UserNotification } from "./UserNotification";

export class NotificationService {
  private service: SlackService;

  constructor(slack_token: string, private default_channel: string) {
    this.service = new SlackService(slack_token);
    this.service.onMissingChannel = this.onMissingUser;
  }

  private onMissingUser = async (failedNotification: UserNotification) => {
    return await this.service.sendMessageToChannel(
      this.default_channel,
      failedNotification.message,
    );
  };

  async sendMultipleMessages(notifications: UserNotification[]) {
    return this.service.sendMultipleMessages(notifications);
  }
}
