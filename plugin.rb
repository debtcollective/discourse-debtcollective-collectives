# name: discourse-debtcollective-collectives
# about: This plugins turns whitelisted categories into collectives
# version: 0.1
# authors: debtcollective
# url: https://github.com/debtcollective/discourse-debtcollective-collectives

register_asset "stylesheets/main.scss"
register_asset "stylesheets/mobile.scss", :mobile

enabled_site_setting :discourse_debtcollective_collectives_enabled

PLUGIN_NAME ||= "DiscourseDebtcollectiveCollectives".freeze

after_initialize do
  module ::DiscourseDebtcollectiveCollectives
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace DiscourseDebtcollectiveCollectives
    end
  end

  require_dependency "application_controller"
  class DiscourseDebtcollectiveCollectives::CollectivesController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    before_action :ensure_logged_in
    before_action :find_category

    def join
      # return error if category is not a collective
      if !is_collective?(@category)
        return render json: failed_json, status: 400
      end

      group = collective_group(@category)

      # return error if group not found
      if !group
        return render json: failed_json, status: 400
      end

      # add to group
      group.add(current_user)
      group.save!

      # set category notification level
      notification_level = CategoryUser.notification_levels[:watching_first_post]
      CategoryUser.set_notification_level_for_category(current_user, notification_level, @category.id)

      render json: success_json
    end

    protected

    def find_category
      @category = Category.find(params[:id])
    end

    def is_collective?(category)
      !!category.custom_fields["tdc_is_collective"]
    end

    def collective_group(collective)
      collective.groups.where.not(id: Group::AUTO_GROUPS.values).first
    end
  end

  DiscourseDebtcollectiveCollectives::Engine.routes.draw do
    put "/:id/join" => "collectives#join"
  end

  Discourse::Application.routes.append do
    mount ::DiscourseDebtcollectiveCollectives::Engine, at: "/collectives"
  end

  Category.register_custom_field_type("tdc_is_collective", :boolean)
  Site.preloaded_category_custom_fields << "tdc_is_collective" if Site.respond_to? :preloaded_category_custom_fields

  add_to_serializer(:basic_category, :is_collective) do
    !!object.custom_fields["tdc_is_collective"]
  end

  add_to_serializer(:basic_category, :collective_group) do
    object.groups.where.not(id: Group::AUTO_GROUPS.values).first&.name
  end
end
