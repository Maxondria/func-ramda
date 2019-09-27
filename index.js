const cities = require("./cities.json");
const R = require("rambda");

const KtoF = k => k - 273.15;

const updateTemperature = R.curry((convertFn, city) => {
  const temp = Math.round(convertFn(city.temp));
  return R.merge(city, { temp });
});

const updatedCities = R.map(updateTemperature(KtoF), cities);

//console.log(updatedCities);
const totalCostReducer = (acc, city) => {
  const { cost = 0 } = city; //incase it doesn't exist, define it with zero
  return acc + cost;
};
const totalCost = R.reduce(totalCostReducer, 0, updatedCities);
const cityCount = R.length(updatedCities);
//console.log(totalCost / cityCount);

const groupByPropReducer = (acc, city) => {
  const { cost = [], internetSpeed = [] } = acc; //if not found, set them on object
  return R.merge(acc, {
    cost: R.append(city.cost, cost), //add city.cost to current cost
    internetSpeed: R.append(city.internetSpeed, internetSpeed)
  });
};

const groupedByProp = R.reduce(groupByPropReducer, {}, updatedCities);
console.log(groupedByProp);
