/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/qin-the-warring-states/templates/actor/parts/actor-features.hbs',
    'systems/qin-the-warring-states/templates/actor/parts/actor-items.hbs',
    'systems/qin-the-warring-states/templates/actor/parts/actor-spells.hbs',
    'systems/qin-the-warring-states/templates/actor/parts/actor-effects.hbs',
    'systems/qin-the-warring-states/templates/actor/parts/actor-skills.hbs',
    'systems/qin-the-warring-states/templates/actor/parts/actor-semblance.hbs',
    'systems/qin-the-warring-states/templates/actor/parts/actor-aura.hbs',
    'systems/qin-the-warring-states/templates/actor/parts/actor-dust.hbs',
    "systems/qin-the-warring-states/templates/actor/parts/actor-combat.hbs",
    // Item partials
    'systems/qin-the-warring-states/templates/item/parts/item-effects.hbs',
    //Rolls
    'systems/qin-the-warring-states/templates/rolls/parts/roll-dialog-content.hbs',
    'systems/qin-the-warring-states/templates/rolls/parts/attribute-selector.hbs',
  ]);
};
