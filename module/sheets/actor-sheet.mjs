import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class qinActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['qin-the-warring-states', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/qin-the-warring-states/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {

  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const skills = {};
    const combatFeatures = [];
    const taos = [];
    const magics = {};

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      } else if (i.type === "skill") {
        const aspect = i.system.relatedAspect;
        skills[aspect] = skills[aspect] || [];
        skills[aspect].push(i);
      } else if (i.type === "combatFeature") {
        combatFeatures.push(i);
      } else if (i.type === "tao") {
        taos.push(i);
      } else if (i.type === "magicFeature") {
        const type = i.system.type;
        magics[type] = magics[type] || [];
        magics[type].push(i);
      } else {
        console.log("Unsupported type: " + i.type);
      }
    }

    // Assign and return
    context.gear = gear;
    context.skills = skills;
    context.combatFeatures = combatFeatures;
    context.taos = taos;
    context.magics = magics;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable aspects.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Dialog opener aspects.
    html.on('click', '.dialogOpener', this._onDialogOpen.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {

    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      } else if (dataset.rollType == 'roll') {
        return this.roll(dataset.roll, dataset.label);
      } else if (dataset.rollType == 'yy-roll') {
        return this.yyRoll(dataset.rollModifier, dataset.label);
      } else if (dataset.rollType == 'yy-roll-damage') {
        return this.yyRollDamage(dataset.rollModifier, dataset.label, dataset.damage);
      } else {
        console.log("Unknown roll type.");
      }
    } else if (dataset.roll) {// Fallback.
      this.roll(dataset.roll, dataset.label)
    } else {
      console.log("Unknown roll type.");
    }
  }

  yyRoll(modifier, label) {
    this.roll(qinActorSheet.prepareYyDice(modifier), label);
  }

  static prepareYyDice(modifier) {
    const exDice = game.settings.get('qin-the-warring-states', 'exploding-dice');
    const wndModifier = " + @health.healthMalus[Wnd]"
    if (exDice) {
      return "1dYx +" + modifier + wndModifier;
    } else {
      return "1dY +" + modifier + wndModifier;
    }
  }

  roll(formula, label) {
    console.log("Rolling formula: " + formula);
    label = label ? label : 'Roll: ';
    let roll = new Roll(formula, this.actor.getRollData());
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;
  }


  yyRollDamage(modifier, label, damage) {

    const formula = qinActorSheet.prepareYyDice(modifier);

    console.log("Rolling formula with damage: " + formula);
    label = label ? `${label}` : '';
    let roll = new Roll(formula, this.actor.getRollData());
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label + " attack",
      rollMode: game.settings.get('core', 'rollMode'),
    }).then(() => {
      let yyResults = roll.dice[0].results;
      let dmgBonus = this.computeYYDamageBonus(yyResults);
      let dmgFormula = "@aspects.metal.rollableModifier + " + damage + "[W.Dam] + " + dmgBonus + "[YY]";
      let dmgRoll = new Roll(dmgFormula, this.actor.getRollData());
      dmgRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label + " damage",
        rollMode: game.settings.get('core', 'rollMode'),
      });
    });
    return roll;
  }

  computeYYDamageBonus(yyResults) {
    return yyResults.map(v => this.computeYYSingleDamageBonus(v)).reduce((acc, v) => acc + v, 0);
  }
  computeYYSingleDamageBonus(yyResult) {
    if (yyResult.yin < yyResult.yang) {
      return yyResult.yang - yyResult.yin;
    } else if (yyResult.yin === yyResult.yang) {
      return yyResult.yang;
    } else {
      return 0;
    }
  }


  async _onDialogOpen(event) {

    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const template_data = { object: this.object };

    const dialogContent = await renderTemplate(dataset.dialogTemplate, template_data);

    Dialog.prompt({
      title: "Title",
      content: dialogContent,
      callback: (html) => this.handleSubmit(html, this.object)
    });
  }

  async handleSubmit(html, targetActor) {
    const formElement = html[0].querySelector('form');
    const formData = new FormDataExtended(formElement);
    const formDataObject = formData.entries();

    formDataObject.forEach(
      async f => await targetActor.update({ ["system."+f[0]]: f[1] })
    );

  }
}
