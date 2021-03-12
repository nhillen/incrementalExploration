var counters = {
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
      }
    ],
    modifiers: {
        //TODO: Implement a rest buff
    }
  }
}
