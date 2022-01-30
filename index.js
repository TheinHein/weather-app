const form = document.querySelector("#weather-form");
const unit = document.querySelector(".unit");
const toggle = document.querySelector(".toggle");

const cityName = document.querySelector("#city-name");
const curTemp = document.querySelector("#cur-temp");
const description = document.querySelector("#description");
const temp = document.querySelector("#temp");
const hours = document.querySelector(".hours");
const hourlyWeatherTr = document.querySelector(".hourly-weather-tr");
const hourlyTempTr = document.querySelector(".hourly-temp-tr");

const dailyForecast = document.querySelector(".daily-forecast");

const airQuality = document.querySelector(".air-quality");

const uvIndex = document.querySelector(".uv-index");
const uvRange = document.querySelector(".uv-range");

const sunrise = document.querySelector(".sunrise");

const wind = document.querySelector(".wind");

const feelsLike = document.querySelector(".feels-like");

const humidity = document.querySelector(".humidity");

const visibility = document.querySelector(".visibility");

const pressure = document.querySelector(".pressure");

getForecast("fremont", "imperial");

unit.addEventListener("click", function (e) {
  if (
    toggle.className === "toggle" ||
    toggle.className === "toggle fahrenheit"
  ) {
    toggle.className = "toggle celsius";
  } else if (toggle.className === "toggle celsius") {
    toggle.className = "toggle fahrenheit";
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (toggle.className === "toggle" || toggle.className === "toggle fahrenheit")
    getForecast(form.elements["city"].value, "imperial");
  else if (toggle.className === "toggle celsius")
    getForecast(form.elements["city"].value, "metric");

  form.reset();
});

function getForecast(location, unit) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=0942cc8d1aebbb5712f6a2e49eff6087&units=${unit}`,
    { mode: "cors" }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      cityName.textContent = response.name;
      curTemp.textContent = response.main.temp + "\u00B0";
      description.textContent = response.weather[0].description.toUpperCase();
      temp.textContent = `H:${response.main.temp_max}\u00B0 L:${response.main.temp_min}\u00B0`;
      getHourly(response.coord.lat, response.coord.lon, unit);
      getAirQuality(response.coord.lat, response.coord.lon);
    })
    .catch(function (e) {
      alert("Could not find the city");
      getForecast("fremont", "imperial");
    });
}

function getHourly(lat, lon, unit) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=0942cc8d1aebbb5712f6a2e49eff6087&units=${unit}`,
    { mode: "cors" }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      // hourly forecast

      removeAllChildNodes(hours);
      removeAllChildNodes(hourlyWeatherTr);
      removeAllChildNodes(hourlyTempTr);
      for (let i = 0; i < 24; i++) {
        const hourly = document.createElement("td");
        if (i === 0) hourly.textContent = "Now";
        else {
          let date = new Date(response.hourly[i].dt * 1000);
          let hour = date.getHours();
          if (hour < 13) {
            if (hour === 0) hourly.textContent = 12 + "AM";
            else hourly.textContent = hour + "AM";
          } else {
            if (hour % 12 === 0) hourly.textContent = 12 + "PM";
            else hourly.textContent = (hour % 12) + "PM";
          }
        }
        hours.appendChild(hourly);

        const hourlyWeather = document.createElement("img");
        hourlyWeather.src = `https://openweathermap.org/img/wn/${response.hourly[i].weather[0].icon}.png`;
        const hourlyWeatherTd = document.createElement("td");
        hourlyWeatherTd.appendChild(hourlyWeather);
        hourlyWeatherTr.appendChild(hourlyWeatherTd);

        const hourlyTemp = document.createElement("td");
        hourlyTemp.textContent = response.hourly[i].temp + "\u00B0";
        hourlyTempTr.appendChild(hourlyTemp);
      }

      // 8-day forecast

      removeAllChildNodes(dailyForecast);
      for (let i = 0; i < 8; i++) {
        const dailyForecastTr = document.createElement("tr");
        let day = "";
        if (i === 0) day = "Today";
        else {
          let date = new Date(response.daily[i].dt * 1000);
          day = date.toLocaleString("en-US", { weekday: "long" });
        }

        let minTemp = response.daily[i].temp.min;
        let maxTemp = response.daily[i].temp.max;
        dailyForecastTr.innerHTML = `<td>${day}</td><td><img src=https://openweathermap.org/img/wn/${response.daily[i].weather[0].icon}.png></td><td>${minTemp} \u00B0 - ${maxTemp} \u00B0</td>`;

        dailyForecast.appendChild(dailyForecastTr);
      }

      // uv index
      let uvRisk = "";
      if (response.current.uvi <= 3) uvRisk = "LOW";
      else if (response.current.uvi >= 3 && response.current.uvi <= 6)
        uvRisk = "MODERATE";
      else if (response.current.uvi >= 6 && response.current.uvi <= 8)
        uvRisk = "HIGH";
      else if (response.current.uvi >= 8 && response.current.uvi <= 10)
        uvRisk = "VERY HIGH";

      let avgUV = "";
      if (response.daily[0].uvi <= 3) avgUV = "LOW";
      else if (response.daily[0].uvi >= 3 && response.daily[0].uvi <= 6)
        avgUV = "MODERATE";
      else if (response.daily[0].uvi >= 6 && response.daily[0].uvi <= 8)
        avgUV = "HIGH";
      else if (response.daily[0].uvi >= 8 && response.daily[0].uvi <= 10)
        avgUV = "VERY HIGH";
      uvIndex.innerHTML = `<div>UV INDEX</div>
        </div><div>${response.current.uvi}</div>
        <div>${uvRisk}</div>
        <input type=range class=uv-range min=0 max=10 value=${response.current.uvi} disabled></input>
        <div>${avgUV} for the rest of the day.</div>`;

      // sunrise
      let sunriseTime = new Date(response.current.sunrise * 1000);
      let sunriseHours = sunriseTime.getHours();
      let sunriseMinutes = "0" + sunriseTime.getMinutes();
      let sunsetTime = new Date(response.current.sunset * 1000);
      let sunsetHours = sunsetTime.getHours();
      let sunsetMinutes = "0" + sunsetTime.getMinutes();
      sunrise.innerHTML = `
      <div>SUNRISE</div>
      <div>${sunriseHours} : ${sunriseMinutes.substr(-2)} AM</div>
      <div>Sunset: ${sunsetHours % 12} : ${sunsetMinutes.substr(-2)} PM</div>`;

      // wind
      wind.innerHTML = `
      <div>WIND</div>
      <div class=compass>
      <div class=news>N</div>
      <div class=news>E</div>
      <div class=news>W</div>
      <div class=news>S</div>
      <div class=speed>
        <div>
          ${response.current.wind_speed}
        </div> 
        <div>
          mph
        </div>
      </div>
        <div class=direction style=transform:translate(-50%,-50%)rotate(${
          response.current.wind_deg + 90
        }deg)>
          <div class=arrow-head style=transform:translate(-50%,-50%)></div>
          <div class=arrow-tail style=transform:translate(-50%,-50%)></div>
        </div>
      </div>`;

      // feels like

      feelsLike.innerHTML = `
      <div>FEELS LIKE</div>
      <div>${response.current.feels_like}\u00B0</div>`;

      // humidity

      humidity.innerHTML = `
      <div>HUMIDITY</div>
      <div>${response.current.humidity}%</div>
      <div>The dew point is ${response.current.dew_point}\u00B0 right now.</div>`;

      // visibility

      visibility.innerHTML = `
      <div>VISIBILITY</div>
      <div>${response.current.visibility / 1000} mi</div>`;

      // pressure

      pressure.innerHTML = `
      <div>PRESSURE</div>
      <div>\u2193</div>
      <div>${response.current.pressure}</div>
      <div>hPa</div>`;
    });
}

function getAirQuality(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=0942cc8d1aebbb5712f6a2e49eff6087`,
    { mode: "cors" }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      let name = [, "Good", "Fair", "Moderate", "Poor", "Very Poor"];
      airQuality.innerHTML = `
      <div>AIR QUALITY</div>
      <div>${response.list[0].main.aqi} - ${
        name[response.list[0].main.aqi]
      }</div>`;
    });
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
