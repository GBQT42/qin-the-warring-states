import qinItemBase from "./item-base.mjs";

export default class qinSkill extends qinItemBase {

    static defineSchema() {

        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.rollModifier = new fields.StringField({ initial: "@aspects.dex.rollableModifier + @aspects.dis.rollableModifier" });
        schema.nativeDifficulty = new fields.NumberField({ ...requiredInteger, initial: 0 });

        return schema;
    }

}