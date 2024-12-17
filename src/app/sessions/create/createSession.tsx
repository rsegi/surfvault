"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

import Image from "next/image";
import LocationSearch from "@/components/locationSearch";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { createSession } from "@/lib/createSessionServerAction";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
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
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Por favor, introduce una fecha válida",
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
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [fileOrder, setFileOrder] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof createSessionSchema>>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      title: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      location: "",
      latitude: 0,
      longitude: 0,
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: z.infer<typeof createSessionSchema>) => {
    let sessionId = "";
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("userId", user!.id!);
      formData.append("latitude", values.latitude.toString());
      formData.append("longitude", values.longitude.toString());
      formData.append("title", values.title);
      formData.append("date", values.date);
      formData.append("time", values.time);
      formData.append("location", values.location);

      fileOrder.forEach((index, orderIndex) => {
        formData.append(`file${orderIndex}`, files[index].file);
        formData.append(`fileType${orderIndex}`, files[index].fileType);
      });

      const result = await createSession(formData);

      sessionId = result!.createdSession;
      toast.success("Sesión creada con éxito.");
      router.push(`${DEFAULT_LOGIN_REDIRECT}/${sessionId}`);
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
      setFileOrder((prevOrder) => [
        ...prevOrder,
        ...Array.from(
          { length: newFiles.length },
          (_, i) => prevOrder.length + i
        ),
      ]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setFileOrder((prevOrder) => {
      const newOrder = prevOrder.filter(
        (orderIndex) => orderIndex !== indexToRemove
      );
      return newOrder.map((orderIndex) =>
        orderIndex > indexToRemove ? orderIndex - 1 : orderIndex
      );
    });
  };

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <Card className="min-w-[600px] min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Crear nueva sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
          <Form {...form}>
            <form className="space-y-8 h-full">
              {step === 1 && (
                <div className="space-y-4 flex flex-col items-center justify-center h-full">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="w-full max-w-md">
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-white"
                            placeholder="Introduce el título de la sesión"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-4 max-w-md">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Fecha</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Hora</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white"
                              type="time"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4 min-w-[900px] min-h-[600px]">
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
                  <div className="h-[600px] w-full rounded-md overflow-hidden">
                    <MapContainer
                      center={[37.8, -122.4]}
                      zoom={14}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
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
                          form.trigger("location");
                        }}
                        setLongitude={(lng) => {
                          form.setValue("longitude", lng);
                          form.setValue(
                            "location",
                            `${form.getValues("latitude")}, ${lng}`
                          );
                          form.trigger("location");
                        }}
                        latitude={form.watch("latitude")}
                        longitude={form.watch("longitude")}
                      />
                    </MapContainer>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4 flex flex-col items-center justify-center h-full">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="media">Multimedia</Label>
                    <Input
                      id="media"
                      type="file"
                      multiple
                      max={6}
                      accept="image/jpeg,image/png,image/webp,video/mp4"
                      onChange={handleFileChange}
                    />
                  </div>
                  {files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                      {fileOrder.map((orderIndex) => {
                        const fileWithPreview = files[orderIndex];
                        return (
                          <div
                            key={orderIndex}
                            className="relative aspect-video rounded-md overflow-hidden group"
                          >
                            {fileWithPreview.fileType === "image" ? (
                              <Image
                                src={fileWithPreview.preview}
                                alt={`Preview ${orderIndex + 1}`}
                                className="object-cover"
                                fill
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                <Play className="text-gray-500" size={48} />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(orderIndex)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove file"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setStep(step - 1)}
            >
              Atrás
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(step + 1)}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting || !form.formState.isValid}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isSubmitting ? "Creando..." : "Crear Sesión"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
