class Lilim {
    constructor(genes) {
        this.brain = null;

        var geneFromArray = array => array.reduce((a, b) => a + b, 0);
        this.genes = [
            geneFromArray(genes.slice(0, 15)), // health

            geneFromArray(genes.slice(16, 31)), // wings amount
            geneFromArray(genes.slice(32, 47)), // wings health
            geneFromArray(genes.slice(48, 63)), // wings orientation
            geneFromArray(genes.slice(64, 79)), // wings length

            geneFromArray(genes.slice(80, 95)), // bullet radius
            geneFromArray(genes.slice(96, 111)), // bullet speed
            geneFromArray(genes.slice(112, 127)), // bullet power
            geneFromArray(genes.slice(128, 143)), // bullet frequency

            geneFromArray(genes.slice(144, 159)), // red color modifier
            geneFromArray(genes.slice(160, 175)), // green color modifier
            geneFromArray(genes.slice(176, 191)), // blue color modifier
        ];
        this.maxGeneValue = 4096;

        this.dir = {
            x: 0,
            y: 1
        }

        this.pos = {
            x: 256,
            y: 256
        }

        this.radius = 32;
        this.coreRadius = 32 / 2;

        this.maxHealth = Math.floor(this.genes[0] * 100 / this.maxGeneValue);
        this.health = this.maxHealth;

        this.wings = new Array(Math.floor(this.genes[1] * 16 / this.maxGeneValue));
        this.wingsMaxHealth = Math.floor(this.genes[2] * 100 / this.maxGeneValue);
        for (let i = 0; i < this.wings.length; i++) {
            this.wings[i] = {
                maxHealth: this.wingsMaxHealth,
                health: this.wingsMaxHealth,
                angle: Math.floor(this.genes[3] * 360 / this.maxGeneValue),
                length: Math.floor(this.genes[4] * 32 / this.maxGeneValue),
                posA: {
                    x: null,
                    y: null
                },
                posB: {
                    x: null,
                    y: null
                }
            };
        }

        this.bullets = [];
        this.bulletFrequency = Math.floor(this.genes[8] * 16 / this.maxGeneValue);
        this.shoot = frame => {
            if (frame % this.bulletFrequency === 0) {
                this.bullets.push({
                    active:true,
                    radius: Math.floor(this.genes[5] * 16 / this.maxGeneValue),
                    speed: Math.floor(this.genes[6] * 8 / this.maxGeneValue),
                    power: Math.floor(this.genes[7] * 100 / this.maxGeneValue),
                    dir: {
                        x: this.dir.x,
                        y: this.dir.y
                    },
                    pos: {
                        x: this.pos.x,
                        y: this.pos.y
                    }
                });
            }
        }

        this.color = 'rgb(' +
            Math.floor(this.genes[9] * 256 / this.maxGeneValue) + ', ' +
            Math.floor(this.genes[10] * 256 / this.maxGeneValue) + ', ' +
            Math.floor(this.genes[11] * 256 / this.maxGeneValue) + ')';
    }
}