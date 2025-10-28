const { ICON_RULES } = require("../rules");
const { buildProfile } = require("./repository-profile");

function resolveIcon(repository) {
  const profile = buildProfile(repository);
  const rule = ICON_RULES.find((candidate) => candidate.predicate(profile));
  return rule ? rule.icon : "🔧";
}

module.exports = {
  resolveIcon,
};
