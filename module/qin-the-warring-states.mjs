// Import document classes.
import { qinActor } from './documents/actor.mjs';
import { qinItem } from './documents/item.mjs';
// Import sheet classes.
import { qinActorSheet } from './sheets/actor-sheet.mjs';
import { qinItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { QIN } from './helpers/config.mjs';
import { default as YinYangDice } from './dice/yin-yang-dice.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.qin = {
    qinActor,
    qinItem
  };



  // Add custom constants for configuration.
  CONFIG.QIN = QIN;


  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = qinActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.qinCharacter
  }
  CONFIG.Item.documentClass = qinItem;
  CONFIG.Item.dataModels = {
    item: models.qinItem,
    skill: models.qinSkill,
    combatFeature: models.qinCombatFeature,
    magicFeature: models.qinMagicFeature,
    tao: models.qinTao
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('qin-the-warring-states', qinActorSheet, {
    makeDefault: true,
    label: 'QIN.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('qin-the-warring-states', qinItemSheet, {
    makeDefault: true,
    label: 'QIN.SheetLabels.Item',
  });

  // Register YY die.
  CONFIG.Dice.types.unshift(YinYangDice);
  CONFIG.Dice.terms.y = YinYangDice;

  

  // Register settings

  game.settings.register('qin-the-warring-states', 'exploding-dice', {
    name: 'QIN.settings.exploding-dice.name',
    hint: 'QIN.settings.exploding-dice.hint',
    scope: 'world',     
    config: true,       
    type: Boolean,       // You want the primitive class, e.g. Number, not the name of the class as a string
    default: false,
    onChange: value => { // value is the new value of the setting
      console.log(value)
    },
    requiresReload: true, // true if you want to prompt the user to reload
  });



  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});


//Auto expand rolls
Hooks.on("renderChatMessage", function (message, html) {
  html.find(`div.dice-tooltip`).css("display", "block")
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: qinActorSheet.prepareYyDice('@aspects.water.rollableModifier*1.01'),
    decimals: 2,
  };
});
