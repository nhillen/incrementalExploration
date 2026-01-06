const Travel = require('../js/travel');

test('walking cost', () => {
  const travel = new Travel('walking');
  expect(travel.getTravelCost(5)).toBe(5);
});
