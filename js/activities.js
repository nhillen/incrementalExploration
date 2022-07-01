const activities = {
	rest : {
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
	travel : {
		variableWork: true,
		variableWorkFunction: "getSpeedByTravelType",
		variableWorkStat: "travelType"
	}
}

const customActivities = ["stop", "travel"]