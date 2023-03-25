const defaultTravel = {
  travelType: 'walking',
  travelDistance: '25'
};

const defaultActivities = {
  resting: {
    displayName: "Rest",
    activityMessage: "You begin resting",
  },
  stop: {
    displayName: "Stop All Activities",
    activityMessage: "You stop your current activity",
  },
  travel: {
    displayName: "Travel",
    activityMessage: "You begin traveling",
  },
};

const locations = {
  home: {
    locationName: "Your House",
    locationDescription: "You wake up in a fairly simple room, it has a straw stuffed mattress and pillow on the floor.  There's a door to leave",
    activities: {
      resting: {
        displayName: "Sleep on the Bed",
      },
      travel: {
        displayName: "Leave for Clearing",
        failText: "You do not have enough energy for that, try resting",
        variableValues: {
          travelTarget: 'meadow',
          travelDistance: '25',
        },
      },
    },
    modifiers: {
      restingEnergyBoost: {
        multiplier: 1.1,
      },
    },
  },
  meadow: {
    locationName: "A Meadow",
    locationDescription: "After leaving the house you find yourself in a wide open meadow of grass and bright colored flowers.  In the center stands a small stone cottage.  Woods lie in each direction and miles to the south, snow peaked mountains rise above the treeline.",
    activities: {
      resting: {
        displayName: "Rest in the Grass",
      },
      travel: {
        displayName: "Return Home",
        failText: "You do not have enough energy for that, try resting",
        variableValues: {
          travelTarget: 'home',
          travelDistance: '25',
        },
      },
    },
  },
};
