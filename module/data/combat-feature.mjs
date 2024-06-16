import qinItemBase from "./item-base.mjs";

export default class qinCombatFeature extends qinItemBase {



    static defineSchema() {

        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.skillLevel = new fields.NumberField({...requiredInteger, initial: 0 });
        schema.damage = new fields.NumberField({...requiredInteger, initial: 0 });
        schema.resistance = new fields.NumberField({...requiredInteger, initial: 7 });
        schema.knownManeuvers = new fields.StringField({required: true, initial:""});

        return schema;
    }
}