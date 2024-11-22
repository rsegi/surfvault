"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Play } from "lucide-react";
import L, { LatLng } from "leaflet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIconShadowPng from "leaflet/dist/images/marker-shadow.png";
import Image from "next/image";
import LocationSearch from "./ui/locationSearch";

L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  shadowUrl: markerIconShadowPng,
  iconRetinaUrl: markerIconPng,
});

const createSessionSchema = z.object({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 carácteres",
  }),
  date: z.date({
    required_error: "Es necesario definir una fecha",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Por favor, introduce una hora en formato HH:MM",
  }),
  location: z.string().min(2, {
    message: "La ubicación debe tener al menos 2 carácteres",
  }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  files: z.array(z.instanceof(File)).optional(),
});

interface LocationMarkerProps {
  latitude: number;
  longitude: number;
  setLatitude: (latitude: number) => void;
  setLongitude: (longitude: number) => void;
}

type FileWithPreview = File & { preview: string; type: string };

function LocationMarker({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}: LocationMarkerProps) {
  const map = useMap();
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvents({
    click: (e: { latlng: LatLng }) => {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (latitude && longitude) {
      const newCenter = new LatLng(latitude, longitude);
      setPosition(newCenter);
      map.setView(newCenter, map.getZoom());
    }
  }, [latitude, longitude, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function CreateSessionModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const form = useForm<z.infer<typeof createSessionSchema>>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      time: "",
      location: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof createSessionSchema>) => {
    console.log(values);
    setOpen(false);
    setStep(1);
    form.reset();
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          type: file.type.startsWith("image/") ? "image" : "video",
        })
      );
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Open Form</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[55vh] sm:h-[55vh] md:h-[55vh] lg:h-[55vh] overflow-y-auto">
        <DialogHeader className="p-2 h-auto">
          <DialogTitle className="text-lg">Create New Session</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Add details about your surf session. Click next to proceed through
            the steps.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 h-full flex flex-col"
          >
            {step === 1 && (
              <div className="space-y-4 flex-grow overflow-y-auto">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter session title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full sm:w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-col h-full space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <LocationSearch
                          {...field}
                          setLatitude={(lat) => form.setValue("latitude", lat)}
                          setLongitude={(lng) =>
                            form.setValue("longitude", lng)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex-grow w-full">
                  <MapContainer
                    center={[37.8, -122.4]}
                    zoom={14}
                    className="w-full h-[400px]"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[
                        form.watch("latitude"),
                        form.watch("longitude"),
                      ]}
                    />
                    <LocationMarker
                      setLatitude={(lat) => form.setValue("latitude", lat)}
                      setLongitude={(lng) => form.setValue("longitude", lng)}
                      latitude={form.watch("latitude")}
                      longitude={form.watch("longitude")}
                    />
                  </MapContainer>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4 flex-grow overflow-y-auto">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="media">Media</Label>
                  <Input
                    id="media"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                </div>
                {files.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="relative aspect-video">
                        {file.type === "image" ? (
                          <Image
                            src={file.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                            fill
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <Play className="text-gray-500" size={48} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="mt-auto pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Create Session</Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
