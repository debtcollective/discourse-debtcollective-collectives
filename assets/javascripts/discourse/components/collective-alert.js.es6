import computed from "ember-addons/ember-computed-decorators";
import { ajax } from "discourse/lib/ajax";

export default Ember.Component.extend({
  disabled: false,
  hidden: false,
  joined: false,

  @computed("joined")
  message(joined) {
    let message = I18n.t("discourse_debtcollective_collectives.alert");

    if (joined) {
      message = I18n.t("discourse_debtcollective_collectives.joined");
    }

    return message;
  },

  isCollectiveMember(user, category) {
    if (!user) {
      return false;
    }

    const collectiveGroup = category.collective_group;

    return user.filteredGroups.map(item => item.name).includes(collectiveGroup);
  },

  isCategoryCollective(category) {
    return category && category.is_collective;
  },

  didReceiveAttrs() {
    this._super(...arguments);
    let { category, currentUser, topic } = this;

    if (topic) {
      category = topic.category;
    }

    if (
      !currentUser ||
      !this.isCategoryCollective(category) ||
      this.isCollectiveMember(currentUser, category)
    ) {
      return this.set("hidden", true);
    }

    return this.set("hidden", false);
  },

  actions: {
    join() {
      this.set("disabled", true);

      ajax(`/collectives/${this.category.id}/join`, {
        type: "PUT",
        contentType: "application/json",
      })
        .then(() => {
          this.set("joined", true);

          // reload to make the composer pick up permissions changes
          // improve this is we find a better way to do it
          window.location.href = window.location.href;
        })
        .catch(error => {
          throw error;
        });
    },
  },
});
