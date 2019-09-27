/**
 * PROBLEM STATEMENT
 * - You have 100 cities to choose where to work from, you have the necessary stats
 * E.g - Internet Speeds, Cost of Living, Temperature among others
 * Use your programming skills to choose 10 cities from the given 100.
 */

const cities = require("./cities.json");
const R = require("ramda");
const table = require("text-table");

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
//console.log(groupedByProp);

//percentile
const percentile = (array, value) => {
  const length = R.length(array);
  const eqVal = R.equals(value);
  const alen = !R.any(eqVal, array)
    ? R.range(0, length + 1)
    : R.range(0, length);
  const sortedArray = R.sort((a, b) => a - b, array);
  const idx = R.map(eqVal, sortedArray);
  const alenTrue = R.filter((v, i) => {
    return idx[alen.indexOf(v)] === true;
  }, alen);
  const mean = R.mean(alenTrue);
  return mean / length;
};

//score cities
const calcScore = city => {
  const { cost = 0, internetSpeed = 0 } = city;
  const costPercentile = percentile(groupedByProp.cost, cost);
  const internetSpeedPercentile = percentile(
    groupedByProp.internetSpeed,
    internetSpeed
  );
  const score = 100 * (1.0 - costPercentile) + 20 * internetSpeedPercentile;
  return R.merge(city, { score });
};

// const scoredCities = R.map(calcScore, updatedCities);

// console.log(scoredCities);

const filterByWeather = city => {
  const { temp = 0, humidity = 0 } = city;
  return temp > 68 && temp < 85 && humidity > 30 && humidity < 70;
};

// const filteredCities = R.filter(filterByWeather, scoredCities);

// console.log(R.length(filteredCities));

// const sortedCities = R.sortWith(
//   [R.descend(city => city.score)],
//   filteredCities,
// );

// console.log(sortedCities);

// const top10 = R.take(10, sortedCities);

// console.log(top10);
// console.log(R.length(top10));

const cityToArray = city => {
  const { name, country, score, cost, temp, internetSpeed } = city;
  return [name, country, score, cost, temp, internetSpeed];
};
const interestingProps = [
  "Name",
  "Country",
  "Score",
  "Cost",
  "Temp",
  "Internet"
];
const ByScore = R.descend(R.prop("score"));

const topCities = R.pipe(
  R.map(updateTemperature(KtoF)),
  R.filter(filterByWeather),
  R.map(calcScore),
  R.sort(ByScore),
  R.take(10),
  R.map(cityToArray),
  R.prepend(interestingProps),
  table
);

console.log(topCities(cities));
