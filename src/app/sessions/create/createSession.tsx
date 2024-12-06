"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Play } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

import Image from "next/image";
import LocationSearch from "@/components/ui/locationSearch";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { createSession } from "@/lib/createSessionServerAction";
import { useRouter } from "next/navigation";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const LocationMarker = dynamic(() => import("@/components/locationMarker"), {
  ssr: false,
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
});

type FileWithPreview = {
  file: File;
  preview: string;
  fileType: string;
};

export default function CreateSessionPage() {
  const user = useCurrentUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (values: z.infer<typeof createSessionSchema>) => {
    if (!user?.id) {
      console.error("Usuario no autenticado");
      toast.error("Debes estar autenticado para crear una sesión.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("latitude", values.latitude.toString());
      formData.append("longitude", values.longitude.toString());
      formData.append("title", values.title);
      formData.append("date", format(values.date, "yyyy-MM-dd"));
      formData.append("time", values.time);
      formData.append("location", values.location);

      files.forEach((fileWithPreview, index) => {
        formData.append(`file${index}`, fileWithPreview.file);
      });

      const result = await createSession(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Session created successfully!");
      router.push("/sessions");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Error creando la sesión. Por favor, prueba de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        fileType: file.type.startsWith("image/") ? "image" : "video",
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className="container mx-auto py-8 flex justify-center min-h-screen">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Crear nueva sesión</h1>
        <Form {...form}>
          <form className="space-y-8 p-6">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          className="max-w-xl bg-white"
                          placeholder="Introduce el título de la sesión"
                          {...field}
                        />
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
                      <FormLabel>Fecha</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Selecciona una fecha</span>
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
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <Input
                          className="max-w-28 bg-white"
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <LocationSearch
                          {...field}
                          setLatitude={(lat) => {
                            form.setValue("latitude", lat);
                            form.setValue(
                              "location",
                              `${lat}, ${form.getValues("longitude")}`
                            );
                          }}
                          setLongitude={(lng) => {
                            form.setValue("longitude", lng);
                            form.setValue(
                              "location",
                              `${form.getValues("latitude")}, ${lng}`
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="h-[50vh] w-full">
                  <MapContainer
                    center={[37.8, -122.4]}
                    zoom={14}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[
                        form.watch("latitude"),
                        form.watch("longitude"),
                      ]}
                    />
                    <LocationMarker
                      setLatitude={(lat) => {
                        form.setValue("latitude", lat);
                        form.setValue(
                          "location",
                          `${lat}, ${form.getValues("longitude")}`
                        );
                      }}
                      setLongitude={(lng) => {
                        form.setValue("longitude", lng);
                        form.setValue(
                          "location",
                          `${form.getValues("latitude")}, ${lng}`
                        );
                      }}
                      latitude={form.watch("latitude")}
                      longitude={form.watch("longitude")}
                    />
                  </MapContainer>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="media">Multimedia</Label>
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
                    {files.map((fileWithPreview, index) => (
                      <div key={index} className="relative aspect-video">
                        {fileWithPreview.fileType === "image" ? (
                          <Image
                            src={fileWithPreview.preview}
                            alt={`Preview ${index + 1}`}
                            className="object-cover rounded"
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
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Atrás
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isSubmitting ? "Creando..." : "Crear Sesión"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
