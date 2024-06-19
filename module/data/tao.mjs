import qinItemBase from "./item-base.mjs";

export default class qinTao extends qinItemBase {

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.level = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });

        return schema;
    }
}