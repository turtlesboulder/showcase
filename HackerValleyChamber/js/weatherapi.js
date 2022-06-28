// URL: https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
// My weatherAPI key is in here... I'm not too concerned. 
const getWeather = async ()=>{
    apiURL = "https://api.openweathermap.org/data/2.5/weather?lat=38.64&lon=-80.38&appid=b4e1effa695f6d0f82a9ecbc8b7f13b8"
    const response = await fetch(apiURL);
    let jsObject = await response.json();

    let celciusTemp = Math.round((jsObject.main.temp - 273.15))
    document.querySelector('#temperature span').textContent = celciusTemp;
    const iconsrc= `https://openweathermap.org/img/w/${jsObject.weather[0].icon}.png`;
    const desc = jsObject.weather[0].description;

    // document.querySelector('#icon-src').textContent = iconsrc;

    const weather_icon = document.querySelector('#weathericon')
    weather_icon.setAttribute('src', iconsrc);
    weather_icon.setAttribute('alt', desc);
    let weather_description = desc[0].toLocaleUpperCase() + desc.substring(1)
    document.querySelector('#weather_description').textContent = weather_description
    let wind_speed = jsObject.wind.speed
    document.querySelector("#wind_speed_num").textContent = wind_speed
    let feels_like = Math.round(jsObject.main.feels_like - 273.15)
    document.querySelector("#wind_chill_num").textContent = feels_like
}

getWeather();