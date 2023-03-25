const character = {
  energy: {
    current: 0,
    max: 50,
    add(amount) {
      this.current += amount;
      if (this.current > this.max) {
        this.current = this.max;
      }
    },
  },
  energyPerRest: 1,
  timeToRest: 5,
  restSpeedMultiplier: 1,
  restSpeedTargetMultiplier: 1,
  restUnits: 1,
  walkingSpeed: 1,
  currentLocation: "home",
  travelType: "Walking",
  skills: {
    walking: {
      statDisplayName: "Walking",
      level: 0,
      xp: 0,
      growthMultiplier: 1.25,
      xpRequired: 10
    },
    stamina: {
      statDisplayName: "Stamina",
      level: 0,
      xp: 0,
      growthMultiplier: 1.25,
      xpRequired: 10
    },
    resting: {
      statDisplayName: "Resting",
      level: 0,
      xp: 0,
      growthMultiplier: 1.25,
      xpRequired: 10,
      boostPerLevel: 0.01
    }
  }
};

const defaultSkill = {
  level: 0,
  xp: 0,
  growthMultiplier: 1.25,
  xpRequired: 10
};

let modifiedCharacter = {
  walkSpeed: 0
};

let modifiers = {
  equipment: {},
  buffs: {},
  effects: {},
  location: {}
};

const statDisplayName = {
  energy: "Energy",
  maxEnergy: "Max Energy",
  energyPerRest: "Energy Restored Per Rest",
  timeToRest: "Rest Interval",
  restSpeedMultiplier: "Resting Speed Multiplier"
};

let derivedStats = {
  displayedEnergy: {
    name: "Energy",
    value: function() {
      return `<b>Energy: </b>${Math.floor(character.energy.current)}/${character.energy.max}</br>`;
    }
  }
};

const statsToDisplay = {
  displayedEnergy: "derived",
  resting: "skill"
};

function updateCharacterStat(statName, newValue) {
  if (typeof character[statName] !== "undefined") {
    character[statName] = newValue;
  } else if (typeof character.skills[statName] !== "undefined") {
    character.skills[statName] = newValue;
  } else {
    throw new Error(`Stat ${statName} not found in character.js`);
  }
}