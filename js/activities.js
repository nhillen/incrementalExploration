const activities = {
	rest : {
		requiresResource: false,
		resourceGenerated: "energy",
		rate: "energyPerRest",
		timeTarget: "timeToRest",
		timeTargetMultiplier: "restSpeedTargetMultiplier",
		workPer: 1,
		workMultiplier: "restSpeedMultiplier",
	},
	travel : {
		variableWork: true,
		variableWorkFunction: "getSpeedByTravelType",
		variableWorkStat: "travelType"
	}
}

const customActivities = ["stop", "travel"]