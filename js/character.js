let defaultCharacter =
{
  energy: {
    current: 0,
    max: 50,
  },
  energyPerRest: 1,
  timeToRest: 5,
  restSpeedMultiplier : 1,
  restSpeedTargetMultiplier: 1,
  restUnits: 1,
  walkingSpeed: 1,
  currentLocation: "home",
  travelType: "Walking",
  skills: {
      walking: {
        level: 0,
        xp: 0,
        affectedStat: 'walkingSpeed',
        ratio: 1/10
      },
      stamina: {
        level: 0,
        xp: 0,
        affectedStat: 'energy',
        ratio: 1/10
      }
  }
}

let modifiedCharacter = 
{
  walkSpeed = 0
}

let modifiers = 
{
  equipment : {

  },
  buffs : {

  },
  effects : {

  },
  location : {

  }
}

const statDisplayName = {
  energy : "Energy",
  maxEnergy : "Max Energy",
  energyPerRest : "Energy Restored Per Rest",
  timeToRest : "Rest Interval",
  restSpeedMultiplier: "Resting Speed Multiplier",
}

let statsToDisplay = [
  "energy", "maxEnergy"
]
