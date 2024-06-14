import qinItemBase from "./item-base.mjs";

export default class qinSkill extends qinItemBase {

    static defineSchema() {

        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
        
        schema.value = new fields.NumberField({ ...requiredInteger, initial: 1 });
        schema.relatedAspect = new fields.StringField({ initial: "wood" });

        return schema;
    }

}