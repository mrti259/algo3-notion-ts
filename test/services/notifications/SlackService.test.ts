import { SlackService } from "../../../src/services/notifications/SlackService";
import { assert, context, test } from "../../shared";

const service = new SlackService(context.config.slack_token);
const bad_channel_id = "";
const good_channel_id = "U02BYPB5B8V";
const bad_user_name = "Borja";
const good_user_name = "Borja Garibotti";
const message = "holas";

test("Fail send a slack message", async function () {
  const { ok } = await service.sendMessageToChannel(bad_channel_id, message);
  assert(!ok, "Should return false");
});

test("Get an user id", async function () {
  const { ok, channel_id } = await service.getUserIdFromRealName(
    good_user_name
  );
  assert(ok);
  assert(channel_id === good_channel_id, "Get good id");
});

test("Send a slack message", async function () {
  const { ok } = await service.sendMessageToChannel(good_channel_id, message);
  assert(ok, "Should return true");
});

test("Get channel id from names", async function () {
  const { channel_id } = await service.getUserIdsFromRealNames([
    good_user_name,
  ]);
  assert(channel_id, "channel id should be defined");
  assert(channel_id.length == 1, "channel_id length should be 1");
});

test("Fail send a message to Borja", async function () {
  const { ok } = await service.sendMessageToUserNamed(bad_user_name, message);
  assert(!ok, "Should be false");
});

test("Send a message to Borja", async function () {
  const { ok } = await service.sendMessageToUserNamed(good_user_name, message);
  assert(ok, "Should be true");
});

test("Fail send multiple messages", async function () {
  const { ok } = await service.sendMultipleMessages([
    { user_name: bad_user_name, message },
  ]);
  assert(!ok, "Should be false");
});

test("Send a message to Borja", async function () {
  const { ok } = await service.sendMultipleMessages([
    {
      user_name: good_user_name,
      message,
    },
  ]);
  assert(ok, "Should be true");
});
