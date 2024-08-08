/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/qin-the-warring-states/templates/actor/parts/actor-items.hbs',
    'systems/qin-the-warring-states/templates/actor/parts/actor-skills.hbs',
    "systems/qin-the-warring-states/templates/actor/parts/actor-combat.hbs",
    "systems/qin-the-warring-states/templates/actor/parts/actor-taos.hbs",
    "systems/qin-the-warring-states/templates/actor/parts/actor-magic.hbs",
    "systems/qin-the-warring-states/templates/actor/parts/dialog/health-details.hbs",
  ]);
};
