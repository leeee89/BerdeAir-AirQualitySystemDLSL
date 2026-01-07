import fetch from "node-fetch";

const reading = {
  co_raw: 65,
  co_conv_linear_ppm: 0,
  no2_raw: 900,
  no2_mv: 900,
  pm25_raw: 40,
  pm10_raw: 50,
  temperature: 29.5,
  humidity: 75,
  timestamp: "2025-11-13T12:00:00"
};

const response = await fetch('https://berdeair-airqualitysystemdlsl.onrender.com/predict', {

  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(reading)
});

const result = await response.json();
console.log(result);
