const activities = {
	resting : {
		displayName: "Resting",
		activityMessage: "You begin resting",
		canRun: function(){return character.energy.current < character.energy.max},
		failText: "You are fully rested",
		requiresResource: false,
		resourceGenerated: "energy",
		rewards: [
			{
				type: "stat",
				stat: "energy",
				amount: function(){return 1 + (1 * getSkillModifier("resting"))}
			},
			{
				type: "xp",
				stat: "resting",
				amount: function(){return 1}
			}],
		timeTarget: "timeToRest",
		timeTargetMultiplier: "restSpeedTargetMultiplier",
		workPer: 1, //How many units of work per tick
		workMultiplier: "restSpeedMultiplier", //The stat that affects completion speed
	},
	travel: {
		displayName: "Travel",
		activityMessage: "You begin traveling",
		canRun: function () {
			const travel = new Travel(character.travelType);
			console.log("tt");
			console.log(travel);
			const travelCost = travel.getTravelCost(this.variableValues.travelDistance);
			console.log('Travel cost:', travelCost, 'Character energy:', character.energy.current);
			return character.energy.current >= travelCost;
		},
		failText: "You do not have enough energy for that, try resting",
		requiresResource: true,
		resourceGenerated: "energy",
		resourceCost: function () {
			const travel = new Travel(character.travelType);
			return -travel.getTravelCost(this.variableValues.travelDistance);
		},
		rewards: function () {
			const travel = new Travel(character.travelType);
			return travel.getRewards(this.variableValues.travelDistance);
		},
		onCompletion: function () {
			character.currentLocation = this.variableValues.travelTarget;
		},
		timeTarget: function () {
			return this.variableValues.travelDistance;
		},
		timeTargetMultiplier: function () {
			const travel = new Travel(character.travelType);
			return 1 / travel.getTravelSpeed();
		},
		workPer: 1,
		workMultiplier: function () {
			return 1; // Since timeTargetMultiplier accounts for travel speed, this can be set to 1
		},
	},
}