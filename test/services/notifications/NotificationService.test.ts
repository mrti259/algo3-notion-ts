import { assert, context, test } from "../../shared";

const service = context.notifications;
const message = "holas";

test("Send multiple messages", async function () {
  const { ok } = await service.sendMultipleMessages([
    {
      user_name: "Borja Garibotti",
      message,
    },
    { user_name: "Borja", message },
  ]);
  assert(ok, "Should be true");
});

test.run();
