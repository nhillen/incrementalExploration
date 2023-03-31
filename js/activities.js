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
			setLocation(this.variableValues.travelTarget);
			stop();
		},
		timeTarget: function () {
			return this.variableValues.travelDistance;
		},
		timeTargetMultiplier: function () {
			return 1
		},
		workPer: 1,
		workMultiplier: function () {
			const travel = new Travel(character.travelType);
			console.log(travel);
			const travelSpeed = travel.getTravelSpeed();
			console.log(travelSpeed);
			return travelSpeed; // Move the travel speed logic to workMultiplier
		},
	},
	herbalism: {
		displayName: "Pick Flowers",
		activityMessage: "You start picking flowers",
		canRun: function() { return true; },
		failText: "You cannot pick flowers at the moment",
		requiresResource: false,
		currentHerb: null,
		rewards: function() {
			const pickedHerb = getRandomHerb();
			const success = checkHerbalismSuccess(pickedHerb);

			if (success) {
				inventory.addItem(pickedHerb, 1);
				return [
					{
						type: "xp",
						stat: "herbalism",
						amount: function() { return 1; }
					}
				];
			} else {
				return [];
			}
		},
		timeTarget: function() {
			this.currentHerb = getRandomHerb(this.variableValues.herbs);
			this.timeTarget = herbs[this.currentHerb].difficulty;
		},
		timeTargetMultiplier: "pickFlowersSpeedTargetMultiplier",
		workPer: 1,
		workMultiplier: "pickFlowersSpeedMultiplier",
	}
}