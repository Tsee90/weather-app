import './style.css';
const reqSvgs = require.context('./icons', true, /\.svg$/);
const WEATHER_API_KEY = 'D2PL24MEHB59BCMFSWF5ZMPBS';

function createDivID(id) {
  const div = document.createElement('div');
  div.id = id;
  return div;
}

function createDivClass(cls) {
  const div = document.createElement('div');
  div.classList.add(cls);
  return div;
}

function getMainContainer() {
  return document.querySelector('#main-container');
}

function getWeatherDisplay() {
  return document.querySelector('#weather-display');
}

function getIcon(icon) {
  const img = document.createElement('img');
  img.classList.add('icon');
  reqSvgs.keys().forEach((fileName) => {
    const testName = fileName.replace('./', '').replace('.svg', '');
    if (testName === icon) {
      img.src = reqSvgs(fileName);
    }
  });
  return img;
}

async function getWeather(city) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${WEATHER_API_KEY}&iconSet=icons2`;

  try {
    const spinner = createDivID('spinner');
    getWeatherDisplay().innerHTML = '';
    getWeatherDisplay().appendChild(spinner);
    const data = await fetch(url);
    const dataJSON = await data.json();
    return dataJSON;
  } catch (error) {
    return error;
  } finally {
    getWeatherDisplay().removeChild(document.querySelector('#spinner'));
  }
}

class Weather {
  constructor(data) {
    this.address = data.resolvedAddress;
    this.conditions = data.currentConditions.conditions;
    this.temp = data.currentConditions.temp;
    this.icon = data.currentConditions.icon;
  }

  getAddress() {
    return this.address;
  }

  getConditions() {
    return this.conditions;
  }

  getTempF() {
    return `${this.temp} F`;
  }

  getTempC() {
    const celcius = ((this.temp - 32) * (5 / 9)).toFixed(1);
    return `${celcius} C`;
  }

  getIcon() {
    return this.icon;
  }
}

function clickSwapTempF(event) {
  event.preventDefault();
  document.querySelector('#temp-div').textContent =
    event.target.weather.getTempF();
  event.target.removeEventListener('click', clickSwapTempF);
  event.target.addEventListener('click', clickSwapTempC);
}

function clickSwapTempC(event) {
  event.preventDefault();
  document.querySelector('#temp-div').textContent =
    event.target.weather.getTempC();
  event.target.removeEventListener('click', clickSwapTempC);
  event.target.addEventListener('click', clickSwapTempF);
}

function createWeatherDisplay(weather) {
  const weatherContainer = createDivID('weather-container');
  const address = createDivID('address-div');
  address.textContent = weather.getAddress();
  const tempWrapper = createDivID('temp-wrapper');
  const tempDiv = createDivID('temp-div');
  tempDiv.textContent = weather.getTempF();
  const swapTemp = getIcon('swap');
  swapTemp.weather = weather;
  swapTemp.addEventListener('click', clickSwapTempC);
  tempWrapper.appendChild(tempDiv);
  tempWrapper.appendChild(swapTemp);
  const conditionsDiv = createDivID('conditions-div');
  conditionsDiv.textContent = weather.getConditions();
  const iconImage = getIcon(weather.getIcon());
  weatherContainer.appendChild(iconImage);
  weatherContainer.appendChild(conditionsDiv);
  weatherContainer.appendChild(tempWrapper);
  weatherContainer.appendChild(address);

  return weatherContainer;
}

function displayWeather(data) {
  const weather = new Weather(data);
  const display = createWeatherDisplay(weather);
  const weatherDisplay = getWeatherDisplay();
  weatherDisplay.innerHTML = '';
  weatherDisplay.appendChild(display);
}

function search(input) {
  getWeather(input)
    .then((data) => {
      displayWeather(data);
    })
    .catch((error) => {
      getWeatherDisplay().textContent = 'Error';
    });
}

function clickSearch(event) {
  event.preventDefault();
  const input = document.querySelector('#search').value;
  search(input);
}

(function init() {
  const searchButton = document.querySelector('#search-btn');
  searchButton.addEventListener('click', clickSearch);

  getWeather('france')
    .then((data) => {
      displayWeather(data);
    })
    .catch((error) => {
      alert(error);
    });
})();
