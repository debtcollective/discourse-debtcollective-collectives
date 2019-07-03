import computed from "ember-addons/ember-computed-decorators";
import { ajax } from "discourse/lib/ajax";

export default Ember.Component.extend({
  disabled: false,
  hidden: false,
  joined: false,
  sticky: true,

  classNameBindings: ["sticky:is-sticky"],

  @computed("joined")
  message(joined) {
    let message = I18n.t("discourse_debtcollective_collectives.alert");

    if (joined) {
      message = I18n.t("discourse_debtcollective_collectives.joined");
    }

    if (this.isTopic()) {
      message = I18n.t("discourse_debtcollective_collectives.topic");
    }

    return message;
  },

  safeCategory() {
    let { category, topic } = this;

    if (!category && topic) {
      category = topic.category;
    }

    return category;
  },

  isTopic() {
    return !!this.topic;
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

  // bind events for sticky scrolling
  didInsertElement() {
    this._super(...arguments);

    // set width of the container after render
    this.setAlertWidth();

    // bind resize to update width
    $(window).on(
      "resize.collectiveAlert",
      _.debounce(() => {
        this.setAlertWidth();
      }, 150)
    );
  },

  setAlertWidth() {
    const mainOutletWidth = $("#main-outlet").width();

    $(this.element)
      .find(".alert-collective-alert")
      .css("width", `${mainOutletWidth}px`);
  },

  // unbind events and clean up
  willDestroyElement() {
    this._super(...arguments);

    // off resize event
    $(window).off("resize.collectiveAlert");
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
      const categoryId = this.safeCategory().id;

      ajax(`/collectives/${categoryId}/join`, {
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
