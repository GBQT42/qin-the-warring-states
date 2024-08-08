export default class YinYangDice extends foundry.dice.terms.DiceTerm {
    constructor(termData) {
        super(termData);
        this.faces = 10;
    }

    /** @inheritdoc */
    static DENOMINATION = "Y";

    /** @inheritdoc */
    static MODIFIERS = {
        "r": foundry.dice.terms.Die.prototype.reroll,
        "rr": foundry.dice.terms.Die.prototype.rerollRecursive,
        "k": foundry.dice.terms.Die.prototype.keep,
        "kh": foundry.dice.terms.Die.prototype.keep,
        "kl": foundry.dice.terms.Die.prototype.keep,
        "d": foundry.dice.terms.Die.prototype.drop,
        "dh": foundry.dice.terms.Die.prototype.drop,
        "dl": foundry.dice.terms.Die.prototype.drop,
        "x": YinYangDice.prototype.explode
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    roll({ minimize = false, maximize = false } = {}) {
        const roll = { result: undefined, active: true };
        roll.yin = Math.floor((CONFIG.Dice.randomUniform() * this.faces));
        roll.yang = Math.floor((CONFIG.Dice.randomUniform() * this.faces));
        roll.result = roll.yin === roll.yang ? roll.yin : Math.abs(roll.yin - roll.yang);
        roll.failure = (roll.yin === 0 && roll.yang === 0);
        roll.success = (roll.yin === roll.yang && roll.yang !== 0);
        this.results.push(roll);
        return roll;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    getResultLabel(result) {
        return result.result + "    (" + result.yin + "/" + result.yang + ")"; //TODO template
    }


    /** @inheritdoc */
    explode(modifier, { recursive = true } = {}) {

        // Match the "explode" or "explode once" modifier
        const rgx = /xo?([0-9]+)?([<>=]+)?([0-9]+)?/i;
        const match = modifier.match(rgx);
        if (!match) return false;
        if (modifier == "x") return this.customExplode(modifier, recursive = recursive);
        let [max, comparison, target] = match.slice(1);

        // If no comparison or target are provided, treat the max as the target value
        if (max && !(target || comparison)) {
            target = max;
            max = null;
        }

        // Determine target values
        target = Number.isNumeric(target) ? parseInt(target) : this.faces;
        comparison = comparison || "=";

        // Determine the number of allowed explosions
        max = Number.isNumeric(max) ? parseInt(max) : null;

        // Recursively explode until there are no remaining results to explode
        let checked = 0;
        const initial = this.results.length;
        while (checked < this.results.length) {
            let r = this.results[checked];
            checked++;
            if (!r.active) continue;

            // Maybe we have run out of explosions
            if ((max !== null) && (max <= 0)) break;

            // Determine whether to explode the result and roll again!
            if (DiceTerm.compareResult(r.result, comparison, target)) {
                r.exploded = true;
                this.roll();
                if (max !== null) max -= 1;
            }

            // Limit recursion
            if (!recursive && (checked === initial)) break;
            if (checked > 1000) throw new Error("Maximum recursion depth for exploding dice roll exceeded");
        }
    }


    customExplode(modifier, { recursive = true } = {}) {

        if (modifier != "x") return false;

        // Unlimited explosions
        const max = null;

        // Recursively explode until there are no remaining results to explode
        let checked = 0;
        const initial = this.results.length;
        while (checked < this.results.length) {
            let r = this.results[checked];
            checked++;
            if (!r.active) continue;

            // Maybe we have run out of explosions
            if ((max !== null) && (max <= 0)) break;

            // Determine whether to explode the result and roll again!
            if (r.success) {
                r.exploded = true;
                this.roll();
                if (max !== null) max -= 1;
            }

            // Limit recursion
            if (!recursive && (checked === initial)) break;
            if (checked > 1000) throw new Error("Maximum recursion depth for exploding dice roll exceeded");
        }
    }

}
