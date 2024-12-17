"use client";

import { useState, useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeocodingResponse, getLocationByText } from "api/open-meteo/location";

interface LocationInputProps {
  setLatitude: (latitude: number) => void;
  setLongitude: (longitude: number) => void;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

type GeocodingLocation = {
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
  country_code: string;
};

export default function LocationSearch({
  setLatitude,
  setLongitude,
  value,
  onChange,
  onBlur,
}: LocationInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<
    GeocodingResponse[]
  >([]);

  useEffect(() => {
    if (search.length > 2) {
      const timer = setTimeout(() => {
        fetchLocations(search);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setFilteredLocations([]);
    }
  }, [search]);

  const fetchLocations = async (input: string) => {
    const response = await getLocationByText(input);
    setFilteredLocations(response);
  };

  const handleSelect = (location: GeocodingLocation) => {
    onChange(location.name);
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => setOpen(true)}
          onBlur={onBlur}
        >
          {value || "Busca una ubicación"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        style={{ zIndex: 9999 }}
      >
        <div className="flex flex-col space-y-2 p-2 w-full">
          <Input
            placeholder="Busca una ubicación"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ScrollArea className="h-[200px]">
            {filteredLocations.length === 0 ? (
              <div className="py-6 text-center text-sm">
                No se han encontrado ubicaciones.
              </div>
            ) : (
              filteredLocations.map((location) => (
                <Button
                  key={`${location.latitude}-${location.longitude}`}
                  variant="ghost"
                  className="w-full flex justify-start items-center p-2"
                  onClick={() => handleSelect(location)}
                >
                  <img
                    src={`https://flagcdn.com/w40/${location.country_code.toLowerCase()}.png`}
                    alt={location.country_code}
                    width="20"
                    height="15"
                  />
                  {location.name}, {location.admin1}, {location.country}
                </Button>
              ))
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
