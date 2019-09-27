const cities = require("./cities.json");
const R = require("rambda");

const KtoF = k => k - 273.15;

const updateTemperature = R.curry((convertFn, city) => {
  const temp = Math.round(convertFn(city.temp));
  return R.merge(city, { temp });
});

const updatedCities = R.map(updateTemperature(KtoF), cities);

console.log(updatedCities);
