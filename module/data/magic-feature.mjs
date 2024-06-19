import qinItemBase from "./item-base.mjs";

export default class qinMagicFeature extends qinItemBase {

    validTypes = {
        exorcism: "QIN.magic.types.exorcism",
        divination: "QIN.magic.types.divination",
        internalAlchemy: "QIN.magic.types.internalAlchemy",
        externalAlchemy: "QIN.magic.types.externalAlchemy"
    }

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.level = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
        schema.type = new fields.StringField({ required: true, nullable: false, initial: "exorcism"});

        return schema;
    }
}