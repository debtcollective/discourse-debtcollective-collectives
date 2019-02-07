import { withPluginApi } from "discourse/lib/plugin-api";

function initializeDiscourseDebtcollectiveCollectives() {}

export default {
  name: "discourse-debtcollective-collectives",

  initialize() {
    withPluginApi("0.8.24", initializeDiscourseDebtcollectiveCollectives);
  }
};
