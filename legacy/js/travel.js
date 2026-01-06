class Travel {
    constructor(travelType) {
        this.travelType = travelType.toLowerCase();
        this.config = this.getTravelConfig();
    }

    getTravelConfig() {
        const travelConfigs = {
            walking: {
                speed: 1,
                energyCostPerDistance: 1,
                xpStat: "walking",
            },
            // Add more travel types here as needed
        };

        return travelConfigs[this.travelType];
    }

    getTravelSpeed() {
        return this.config.speed;
    }

    getTravelCost(distance) {
        console.log(this);
        return this.config.energyCostPerDistance * distance;
    }

    getRewards(distance) {
        return [
            {
                type: "xp",
                stat: this.config.xpStat,
                amount: Math.floor(distance / 10),
            },
        ];
    }
}

module.exports = Travel;
