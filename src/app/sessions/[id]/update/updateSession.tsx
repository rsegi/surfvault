"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

import LocationSearch from "@/components/locationSearch";
import { toast } from "sonner";
import { SessionResponse } from "api/session/session";
import { updateSession } from "@/lib/updateSessionServerAction";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { removeSeconds } from "@/utils/timeUtils";

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

const updateSessionSchema = z.object({
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
  latitude: z.string(),
  longitude: z.string(),
});

export default function UpdateSessionPage({
  session,
}: {
  session: SessionResponse;
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof updateSessionSchema>>({
    resolver: zodResolver(updateSessionSchema),
    defaultValues: {
      title: session.title,
      date: format(new Date(session.date), "yyyy-MM-dd"),
      time: removeSeconds(session.time),
      latitude: session.latitude,
      longitude: session.longitude,
      location: `${session.latitude}, ${session.longitude}`,
    },
  });

  const onSubmit = async (values: z.infer<typeof updateSessionSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("sessionId", session.id);
      formData.append("latitude", values.latitude);
      formData.append("longitude", values.longitude);
      formData.append("title", values.title);
      formData.append("date", values.date);
      formData.append("time", values.time);
      formData.append("previousLatitude", session.latitude);
      formData.append("previousLongitude", session.longitude);
      formData.append("previousDate", `${session.date}`);

      await updateSession(formData);

      toast.success("Sesión editada con éxito.");
      window.location.href = `${DEFAULT_LOGIN_REDIRECT}/${session.id}`;
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Error editando la sesión. Por favor, prueba de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <Card className="min-w-[600px] min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Actualizar sesión
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
                              form.setValue("latitude", lat.toString());
                              form.setValue(
                                "location",
                                `${lat}, ${form.getValues("longitude")}`
                              );
                            }}
                            setLongitude={(lng) => {
                              form.setValue("longitude", lng.toString());
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
                      center={[
                        parseFloat(form.getValues("latitude")),
                        parseFloat(form.getValues("longitude")),
                      ]}
                      zoom={14}
                      className="h-full w-full"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[
                          parseFloat(form.watch("latitude")),
                          parseFloat(form.watch("longitude")),
                        ]}
                      />
                      <LocationMarker
                        setLatitude={(lat) => {
                          form.setValue("latitude", lat.toString());
                          form.setValue(
                            "location",
                            `${lat}, ${form.getValues("longitude")}`
                          );
                        }}
                        setLongitude={(lng) => {
                          form.setValue("longitude", lng.toString());
                          form.setValue(
                            "location",
                            `${form.getValues("latitude")}, ${lng}`
                          );
                        }}
                        latitude={parseFloat(form.watch("latitude"))}
                        longitude={parseFloat(form.watch("longitude"))}
                      />
                    </MapContainer>
                  </div>
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
              onClick={() => setStep(step - 1)}
            >
              Atrás
            </Button>
          )}
          {step < 2 ? (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isSubmitting ? "Actualizando..." : "Actualizar Sesión"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
