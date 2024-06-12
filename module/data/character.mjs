import qinActorBase from "./actor-base.mjs";

export default class qinCharacter extends qinActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();


    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10 }),//Derived
      steps: new fields.SchemaField({
        normal: new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus:new fields.NumberField({ ...requiredInteger, initial: 0 })
        }),
        bruised: new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus:new fields.NumberField({ ...requiredInteger, initial: 0 })
        }),
        lightWound: new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus:new fields.NumberField({ ...requiredInteger, initial: -1 })
        }),
        heavyWound: new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus:new fields.NumberField({ ...requiredInteger, initial: -3 })
        }),
        fatalWound: new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus:new fields.NumberField({ ...requiredInteger, initial: -5 })
        })
      })
    });

    schema.chi = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 5 })
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.aspects = new fields.SchemaField(Object.keys(CONFIG.QIN.aspects).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
        label: new fields.StringField({ required: true, blank: true })
      });
      return obj;
    }, {}));

    return schema;
  }

  prepareDerivedData() {
    for (const key in this.aspects) {
      // Handle ability label localization.
      this.aspects[key].label = game.i18n.localize(CONFIG.QIN.aspects[key]) ?? key;
      this.aspects[key].rollableModifier = this.aspects[key].value + "[" + this.aspects[key].abbr + "]";
    }
    this.health.max = Object.keys(this.health.steps).reduce((obj, step) => {
      obj+= this.health.steps[step].health;
      return obj;
    }, 0);
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.value + 4`.
    if (this.aspects) {
      for (let [k, v] of Object.entries(this.aspects)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    return data
  }
}