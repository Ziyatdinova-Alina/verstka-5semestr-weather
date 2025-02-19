import axios from 'axios';
import { apiKey } from '../constants';

const forecastEndpoint = (params: { cityName: any; days: any; })=> `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`
const locationsEndpoint = (params: { cityName: any; })=> `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apiCall = async (endpoint: any)=>{
    const options = {
        method: 'GET',
        url: endpoint
    }
    try{
        const response = await axios.request(options);
        return response.data;
    }catch(err){
        console.log('error: ', err)
        return null; 
    }
}

export const fetchWeatherForecast = (params: { cityName: any; days: any; })=>{
    let forecastUrl = forecastEndpoint(params);
    return apiCall(forecastUrl);
}

export const fetchLocations = (params: { cityName: any; days: any; })=>{
    let locationsUrl = locationsEndpoint(params);
    return apiCall(locationsUrl);
}