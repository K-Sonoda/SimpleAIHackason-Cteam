"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select"; // Auto-complete用ライブラリ
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';

export default function Home() {
  const [query, setQuery] = useState("");
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState({});
  const [selectCountry, setSelectCountry] = useState(null);
  const [selectCity, setSelectCity] = useState(null);
  const router = useRouter

  useEffect(() => {
    fetch("/place.json")
      .then((response) => response.json())
      .then((json) => {
        const { countryList, countryCityMap } = processCountryCityData(json);
        setCountries(
          countryList.map((country) => ({ value: country, label: country }))
        );
        setCities(
          Object.fromEntries(
            Object.entries(countryCityMap).map(([country, cityList]) => [
              country,
              cityList.map((city) => ({ value: city, label: city })),
            ])
          )
        );
      });
  }, []);

  function processCountryCityData(data) {
    const countryList = [];
    const countryCityMap = {};

    data.forEach((item) => {
      const country = item.county;
      const city = item.city;

      if (!countryList.includes(country)) {
        countryList.push(country);
      }

      if (!countryCityMap[country]) {
        countryCityMap[country] = [];
      }
      countryCityMap[country].push(city);
    });

    return { countryList, countryCityMap };
  }

  const submitInput = (event) => {
    event.preventDefault();
    console.log({
      query,
      selectedCountry: selectCountry ? selectCountry.value : null,
      selectedCity: selectCity ? selectCity.value : null,
    });
    window.location.href = `/result?country=${selectCountry}&city=${selectCity}&query=${query}`
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={submitInput}>
          <div className="submit-box flex flex-col gap-4">
            {/* 国のAuto-Complete */}
            <Select
              id="country-select"
              options={countries}
              value={selectCountry}
              onChange={(selectedOption) => {
                setSelectCountry(selectedOption);
                setSelectCity(null); // 国を変えたら都市をリセット
              }}
              placeholder="Type or select a country"
              isClearable
            />
            <p>の</p>
            {/* 都市のAuto-Complete */}
            {selectCountry && (
              <>
                <Select
                  id="city-select"
                  options={cities[selectCountry.value]}
                  value={selectCity}
                  onChange={(selectedOption) => setSelectCity(selectedOption)}
                  placeholder="Type or select a city"
                  isClearable
                />
              </>
            )}
            <p>の</p>
            <Input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter some text"
            />
            <p>な場所</p>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </main>
      <style>{`
        .submit-box {
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
