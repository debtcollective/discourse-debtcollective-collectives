require './spec/rails_helper'

SiteSetting.discourse_debtcollective_collectives_enabled = true

path = "./plugins/discourse-debtcollective-collectives/plugin.rb"
source = File.read(path)
plugin = Plugin::Instance.new(Plugin::Metadata.parse(source), path)
plugin.activate!
plugin.initializers.first.call

RSpec.configure do |config|
  config.before :each, type: :helper do
    helper.extend ::DiscourseDebtcollectiveCollectives::Engine.routes.url_helpers
  end
end
