import {Dimensions, Image, ImageBackground, SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity,} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import backgroundImage from "@/assets/weatherapp/rainbow.jpg";
import profile from "@/assets/weatherapp/person.jpg";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import satelitemap from "@/assets/weatherapp/city satelite view.jpg";

import {CalendarDaysIcon, MagnifyingGlassIcon} from "react-native-heroicons/outline";
import {MapPinIcon} from "react-native-heroicons/solid";
import { fetchLocations, fetchWeatherForecast } from "@/api/weather";

import {debounce} from "lodash";
import { weatherImages } from "@/constants";
import { ScrollView } from "react-native-gesture-handler";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as Progress from 'react-native-progress';
import AsyncStorage from "@react-native-async-storage/async-storage";



const { height: screenHeight } = Dimensions.get("window");

// const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// const daynum = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1];

const index = () => {
  const [showSearch, toggleSearch] = useState(false);
const [locations, setLocations] = useState<Location[]>([]);
  interface Weather {
    current?: {
      temp_c?: number;
      feelslike_c?: number;
      wind_dir?: string;
      wind_kph?: number;
      uv?: number;
      condition?: {
        text?: string;
      };
    };
    location?: {
      name?: string;
    };
    forecast?: {
      forecastday?: Array<{
        date: string;
        day?: {
          avgtemp_c?: number;
          condition?: {
            text?: string;
          };
        };
      }>;
    };
  }
  const [weather, setWeather] = useState<Weather>({})

  const [loading, setLoading] = useState(true);
  
  interface Location {
    name: string;
    country: string;
  }
  const handleLocation = (loc: Location) =>{
      // console.log('location: ', loc);
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
      // console.log('got forecast: ', data);
    })
  }

  const handleSearch = (value: any)=>{
    //fetch locations
    if(value.length>2){
      fetchLocations({cityName: value, days: undefined}).then(data=>{
        setLocations(data);
      })
    }
    
  }

  useEffect(()=>{
    fetchMyWeatherData();
  }, []);


  const fetchMyWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'Moscow';
    if(myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false)
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const {current, location} = weather;
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <View className="flex-1">
        <ImageBackground
          style={styles.background}
          source={backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["transparent", "#111"]}
            style={styles.gradient}
          />
          {
            loading? (
              <View className="flex-1 flex-row justify-center items-center">
                <Progress.CircleSnail thickness={10} size={140} color="white" />
              </View>
            ):(
              <SafeAreaView>
                <View className="mx-4 my-20"> 

                  {/* degrees and location*/}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-end">
                      <Text className="text-white text-[70px] font-bold">
                        {current?.temp_c}&#176;
                      </Text>
                      <Text className="text-white text-[36px] font-semibold">
                        c, {location?.name}
                      </Text>
                    </View>
                  </View>

                  {/* info */}
                  <View className="mt-4">
                    <View className="my-1 flex-row items-center gap-3">
                      {/* <Ionicons name="cloudy-night" size={20} color={"white"} /> */}
                      <Image source={weatherImages[current?.condition?.text as keyof typeof weatherImages || 'Partly cloudy']} className="w-6 h-6 mt-0.3" />
                      <Text className="text-white text-xl font-semibold">
                        {current?.condition?.text}
                      </Text>
                    </View>
                    <View className="my-1 flex-row items-center gap-3">
                      <Ionicons name="thermometer" size={20} color={"white"} />
                      <Text className="text-white text-xl font-semibold">
                        Real feel: {current?.feelslike_c}&#176;
                      </Text>
                    </View>
                    <View className="my-1 flex-row items-center gap-3">
                      <Ionicons name="swap-horizontal" size={20} color={"white"} />
                      <Text className="text-white text-xl font-semibold">
                        Wind: {current?.wind_dir} {current?.wind_kph} kph
                      </Text>
                    </View>
                    <View className="my-1 flex-row items-center gap-3">
                      <Ionicons name="trending-down" size={20} color={"white"} />
                      <Text className="text-white text-xl font-semibold">UV: {current?.uv}</Text>
                    </View>
                  </View>

                  {/* search */}
                  <View className="mt-4 flex-row justify-end items-center rounded-full"
                    style={{backgroundColor: "rgba(0, 0, 0, 0.2)", borderRadius: 40,}}>
                      {
                        showSearch ? (
                          <TextInput
                          onChangeText={handleTextDebounce}
                            placeholder='Search City'
                            placeholderTextColor={'darkgray'}
                            className="pl-6 h-10 mt-2 flex-1 text-base text-white"
                          />
                        ):null
                      }
                      <TouchableOpacity
                        onPress={()=> toggleSearch(!showSearch)}
                        style={{backgroundColor: "rgba(0, 0, 0, 0)", borderRadius: 0}}
                        className="pl-3 m-1 pr-4 mt-4 mb-4"
                      >
                        <MagnifyingGlassIcon size="25" color="white" />
                      </TouchableOpacity>
                  </View>
                  {
                    locations.length>0 && showSearch? (
                      <View className="absolute w-full bg-gray-300 top-80 mt-5 rounded-3xl">
                        {
                          locations.map((loc, index)=>{
                            let showBorder = index+1 != locations.length;
                            let borderClass = showBorder? ' border-b-2 border-b-gray-400': '';
                            return (
                              <TouchableOpacity
                                onPress={() => handleLocation(loc)}
                                key={index}
                                className={"flex-row items-center bordor-0 p-3 px-4 mb-1"+borderClass}
                              >
                                <MapPinIcon size="20" color="gray" />
                                <Text className="text-black text-md ml-2">{loc?.name}, {loc?.country}</Text>
                              </TouchableOpacity>
                            )
                          })
                        }
                      </View>
                    ):null
                  }

                  {/* forcast for the week */}
                  <View className="mb-2 mt-80">
                    <View className="flex-row items-center">
                      <CalendarDaysIcon size="22" color="white"/>
                      <Text className="text-white text-base ml-2 mt-1"> Daily Forecast</Text>
                    </View>
                  </View>
                  <ScrollView
                    horizontal
                    contentContainerStyle={{paddingHorizontal:0}}
                    showsHorizontalScrollIndicator={false}
                    className="mt-2 "
                  >
                    {
                      weather?.forecast?.forecastday?.map((item,index)=>{
                        let date = new Date(item.date);
                        let options = {weekday: 'long'};
                        let dayName = date.toLocaleDateString('en-US', options);
                        return(
                          <View
                            key={index}
                            className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                            style={{backgroundColor: "rgba(0, 0, 0, 0.15)"}}
                          >
                            <Image source={weatherImages[item?.day?.condition?.text as keyof typeof weatherImages || 'Partly cloudy']} className="w-11 h-11 mt-0.3" />
                            <Text className="text-white ">{dayName}</Text>
                            <Text className="text-white text-[20px] font-bold">
                              {item?.day?.avgtemp_c}&#176;C
                            </Text>
                          </View>
                        )
                      })
                    }
                  </ScrollView>
                </View>
              </SafeAreaView>
            )
          }

        </ImageBackground>
      </View>
    </GestureHandlerRootView>
  );
};

export default index;

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#111",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "0%",
    height: "0%",
  },
  container: {
    flex: 1,
  },
});
async function getData(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.log('Error getting value:', error);
    return null;
  }
}

function storeData(arg0: string, name: string) {
  throw new Error("Function not implemented.");
}

