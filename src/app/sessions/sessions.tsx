"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltipContent, Tooltip } from "@/components/ui/chart";
import { format, isValid, parse } from "date-fns";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { SessionByUser } from "api/session/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SessionsPage({
  sessions,
}: {
  sessions: SessionByUser[];
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  console.log("Sessions: ", sessions);
  const chartConfig = {
    waveHeight: {
      label: "Wave Height (m)",
      color: "hsl(var(--chart-1))",
    },
    windSpeed: {
      label: "Wind Speed (m/s)",
      color: "hsl(var(--chart-2))",
    },
  };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center h-[calc(100vh-4rem)] space-y-4">
        <h2 className="text-2xl font-bold text-center">
          No tienes sesiones aún
        </h2>
        <p className="text-center text-muted-foreground">
          Crea tu primera sesión de surf y comienza a trackear tu progreso.
        </p>
        <Link href="/sessions/create">
          <Button>Crear Nueva Sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <Link href="/sessions/create">
        <Button>Crear Nueva Sesión</Button>
      </Link>
      {sessions.map((session) => (
        <Card key={session.id} className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>{session.title}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(session.date), "dd/MM/yyyy")}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.fileUrls && session.fileUrls.length > 0 && (
              <Carousel className="w-full max-w-xs mx-auto">
                <CarouselContent>
                  {session.fileUrls.map((url, index) => (
                    <CarouselItem key={index}>
                      <Image
                        src={url.url}
                        alt={`Session photo ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
            {isClient && (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={session.surfConditions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dateTime"
                      tickFormatter={(value) => {
                        const cleanedValue = value.trim();

                        const parsedTime = parse(
                          cleanedValue,
                          "HH:mm:ss",
                          new Date()
                        );
                        if (isValid(parsedTime)) {
                          return format(parsedTime, "HH:mm");
                        }

                        return cleanedValue;
                      }}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      content={<ChartTooltipContent config={chartConfig} />}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="waveHeight"
                      stroke={chartConfig.waveHeight.color}
                      name={chartConfig.waveHeight.label}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="windSpeed"
                      stroke={chartConfig.windSpeed.color}
                      name={chartConfig.windSpeed.label}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
