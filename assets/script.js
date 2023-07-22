var inputEl = document.getElementById("city-input");
var searchEl = document.getElementById("search-button");
var searchInputEl = document.getElementById("search-input");
var searchHistory = document.getElementById("searchHistorySection");
var cityNameEL = document.getElementById("CityName");

//search button event listener
searchEl.addEventListener("click", searchEvent);

//search history event listener
searchHistory.addEventListener("click", searchHistoryClick);
//search history function
function searchHistoryClick(event) {
  event.preventDefault();
  var target = event.target;
  //test what is clicked
  console.log("click");
  console.log(target);

  if (target.matches("button")) {
    searchApi(target.textContent);
  }
}

//search and formating function
function searchEvent(event) {
  event.preventDefault();
  var userInput = inputEl.value.trim();
  var formatUserInput = userInput.charAt(0).toUpperCase() + userInput.slice(1);
  //error when no any input

  if (userInput === "") {
    alert("Please Input a City Name!");
    return;
  }

  updateLocalStorage(formatUserInput);
  updateSearchHistoryEl();
  searchApi(formatUserInput);
  //reset input to nothing
  inputEl.value = "";
}

function searchApi(destination) {
  var city = destination;

  var apiKey = "64364aff8f1f06d28b058755f3637866";
  // URL for current day only returns latitude and longitude

  var urlApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  fetch(urlApi).then(function (response) {
    if (response.ok) {
      cityNameEL.textContent = city;
      response.json().then(function (data) {
        console.log(data);
        var lat = data.coord.lat;
        var lon = data.coord.lon;

        // creating a new fetch from the intial fetch which returned only 1 day weather forecast

        var sevenDayForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`;
        fetch(sevenDayForecast).then(function (response2) {
          response2.json().then(function (data2) {
            populateData(data2);
            console.log(data2);
          });
        });
      });
    } else {
      //alert error if invalid city name input
      alert("Error, " + "can't find city: " + city);
    }
  });
}

function populateData(dataObject) {
  var dataSet = dataObject;

  //loop through all sub cards
  var tempSpanEls = document.querySelectorAll(".temp");
  var windSpanEls = document.querySelectorAll(".wind");
  var humiditySpanEls = document.querySelectorAll(".humidity");
  var dateHeaderEls = document.querySelectorAll(".date");
  var weatherIconEls = document.querySelectorAll(".weatherIcon");

  for (var i = 0; i < 6; i++) {
    var headerDate = dayjs.unix(dataSet.daily[i].dt).format("DD/MM/YY");
    //set each card with index
    dateHeaderEls[i].textContent = headerDate;
    tempSpanEls[i].textContent =
      dataSet.daily[i].temp.min +
      "°C" +
      " - " +
      dataSet.daily[i].temp.max +
      "°C";
    windSpanEls[i].textContent = dataSet.daily[i].wind_speed + "km/h";
    humiditySpanEls[i].textContent = dataSet.daily[i].humidity + "%";

    var icon = dataSet.daily[i].weather[0].icon;
    var iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIconEls[i].setAttribute("src", iconUrl);
  }
}

//saves events to local storage
function updateLocalStorage(userInput) {
  var city = {
    name: userInput,
  };

  var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if (searchHistory === null) {
    searchHistory = [];
  }
  searchHistory.unshift(city);

  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

//fills in the search history
function updateSearchHistoryEl() {
  var searchHistoryEl = document.querySelector("#searchHistory");
  while (searchHistoryEl.firstChild) {
    searchHistoryEl.removeChild(searchHistoryEl.firstChild);
  }
  var searchHistoryItems = JSON.parse(localStorage.getItem("searchHistory"));

  if (searchHistoryItems === null) {
    return;
  }

  for (i = 0; i < searchHistoryItems.length; i++) {
    var liEl = document.createElement("button");
    liEl.textContent = searchHistoryItems[i].name;
    liEl.setAttribute("class", "btn btn-light");
    searchHistoryEl.appendChild(liEl);
  }
}

updateSearchHistoryEl();
