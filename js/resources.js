let counters = {
    time: 0
}

const locations = {
  home : {
    locationName: "Your House",
    locationDescription: "You wake up in a fairly simple room, it has a straw stuffed mattress and pillow on the floor.  There's a door to leave",
    activities : [
      {
        id: "rest",
        displayName: "Sleep on the Bed",
      },
      {
        id: "stop",
        displayName: "Stop All Activities"
      },
      {
        id: "travel",
        displayName: "Leave for Clearing",
        failText: "You do not have enough energy for that, try resting",
        variableValues: {
            travelTarget: 'meadow',
            travelDistance: '25'
        }
      }
    ],
    modifiers: {
        //TODO: Implement a rest buff
    }
  },
  meadow : {
    locationName: "A Meadow",
    locationDescription: "After leaving the house you find yourself in a wide open meadow of grass and bright colored flowers.  In the center stands a small stone cottage.  Woods lie in each direction and miles to the south, snow peaked mountains rise above the treeline.  ",
    activities: []
  }, 
}
