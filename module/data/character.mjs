import qinActorBase from "./actor-base.mjs";

export default class qinCharacter extends qinActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();


    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10 }),//Derived
      steps: new fields.SchemaField([
        new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          label: new fields.StringField({ required: true, initial: "Etat normal" })
        }),
        new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
          label: new fields.StringField({ required: true, initial: "Contusions" })
        }),
        new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus: new fields.NumberField({ ...requiredInteger, initial: -1 }),
          label: new fields.StringField({ required: true, initial: "Blessue légère" })
        }),
        new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus: new fields.NumberField({ ...requiredInteger, initial: -3 }),
          label: new fields.StringField({ required: true, initial: "Blessure grave" })
        }),
        new fields.SchemaField({
          health: new fields.NumberField({ ...requiredInteger, initial: 10 }),
          malus: new fields.NumberField({ ...requiredInteger, initial: -5 }),
          label: new fields.StringField({ required: true, initial: "Blessure fatale" })
        })
      ]),
      healthMalus: new fields.NumberField({ ...requiredInteger, initial: 0 }),//Derived
      healthMalusLabel: new fields.StringField({ required:true, initial: "" })//Derived
    });

    schema.chi = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 5 })
    });

    schema.resistance = new fields.NumberField({...requiredInteger, initial:-1}),//Derived

    schema.passiveDefense = new fields.NumberField({...requiredInteger, initial:-1}),//Derived

    schema.actions = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 3, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 3 })
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.aspects = new fields.SchemaField(Object.keys(CONFIG.QIN.aspects).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 2, min: 1 }),
        label: new fields.StringField({ required: true, blank: true }),
        rollableModifier: new fields.StringField({ required: true, blank: true })
      });
      return obj;
    }, {}));

    return schema;
  }

  prepareDerivedData() {
    for (const key in this.aspects) {
      // Handle ability label localization.
      this.aspects[key].label = game.i18n.localize(CONFIG.QIN.aspects[key]) ?? key;
      this.aspects[key].rollableModifier = this.aspects[key].value + "[" + this.aspects[key].label + "]";
    }

    //Max health
    this.health.max = Object.keys(this.health.steps).reduce((obj, step) => {
      obj += this.health.steps[step].health;
      return obj;
    }, 0);


    //Health malus
    let healthToAssign = this.health.value;
    const numSteps=Object.keys(this.health.steps).length;
    for (var i = 0; i < numSteps; i++) {
      const step = this.health.steps[numSteps-1-i];
      healthToAssign -= step.health;
      if (healthToAssign <= 0) {
        this.health.healthMalus = step.malus;
        this.health.healthMalusLabel = step.label;
        break;
      }
    }

    //Resistance & Passive defense

    this.resistance = this.aspects.metal.value + this.aspects.earth.value;
    this.passiveDefense = 2 + this.aspects.water.value + this.aspects.wood.value;

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