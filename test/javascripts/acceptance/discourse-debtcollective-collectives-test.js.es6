import { acceptance } from "helpers/qunit-helpers";

acceptance("DiscourseDebtcollectiveCollectives", { loggedIn: true });

test("DiscourseDebtcollectiveCollectives works", async assert => {
  await visit("/admin/plugins/discourse-debtcollective-collectives");

  assert.ok(false, "it shows the DiscourseDebtcollectiveCollectives button");
});
