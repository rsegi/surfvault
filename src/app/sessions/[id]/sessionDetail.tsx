"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Thermometer,
  Droplet,
  Wind,
  Compass,
  MoreVertical,
  Pencil,
  Trash2,
  MousePointer2,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { WeatherCode } from "@/utils/weatherCode";
import { SessionResponse } from "api/session/session";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSession } from "@/lib/deleteSessionServerAction";
import { toast } from "sonner";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useRouter } from "next/navigation";
import { removeSeconds, roundTimeToHour } from "@/utils/timeUtils";
import { getDirectionFromDegrees } from "@/utils/getDirectionFromDegrees";

const getBarColor = (waveHeight: number) => {
  if (waveHeight < 0.5) return "hsl(0, 100%, 50%)";
  if (waveHeight < 1) return "hsl(60, 100%, 50%)";
  if (waveHeight < 1.8) return "hsl(120, 100%, 75%)";
  return "hsl(120, 100%, 25%)";
};

export default function SessionDetailPage({
  session,
}: {
  session: SessionResponse;
}) {
  const [selectedDateTime, setSelectedDateTime] = useState<string>(
    roundTimeToHour(session.time)
  );
  const router = useRouter();

  const selectedCondition = useMemo(() => {
    return (
      session.surfConditions.find(
        (condition) => condition.dateTime === selectedDateTime
      ) || session.surfConditions[0]
    );
  }, [session.surfConditions, selectedDateTime]);

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      setSelectedDateTime(data.activePayload[0].payload.dateTime);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSession(session.id);
      toast.success("Session deleted successfully!");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Error eliminando la sesión. Por favor, prueba de nuevo.");
    } finally {
      window.location.href = DEFAULT_LOGIN_REDIRECT;
    }
  };

  const handleUpdate = () => {
    router.push(`${session.id}/update`);
  };

  const getSessionDate = () => {
    return format(session.date, "dd-MM-yyyy");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">
              {session.title}
            </CardTitle>
            {/* <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{session.location}</span>
          </div> */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{getSessionDate()}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleUpdate}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-8">
          {session.fileUrls && session.fileUrls.length > 0 && (
            <div className="relative w-full">
              <Carousel className="w-full">
                <CarouselContent>
                  {session.fileUrls.map((file, index) => (
                    <CarouselItem key={index}>
                      <div
                        className="relative w-full"
                        style={{ paddingTop: "56.25%" }}
                      >
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill={true}
                          className="rounded-md w-auto h-auto object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute top-1/2 left-14 right-14 flex justify-between transform -translate-y-1/2 z-10">
                  <CarouselPrevious className="bg-white/50 hover:bg-white/75" />
                  <CarouselNext className="bg-white/50 hover:bg-white/75" />
                </div>
              </Carousel>
            </div>
          )}

          <Separator className="my-8" />

          <div className="space-y-8 w-full">
            <ChartContainer
              config={{
                waveHeight: {
                  label: "Altura oleaje (m)",
                  color: "hsl(var(--chart-1))",
                },
                windSpeed: {
                  label: "Velocidad viento (km/h)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={session.surfConditions}
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dateTime"
                    tickFormatter={(value) => removeSeconds(value)}
                  />
                  <YAxis yAxisId="left" domain={[0, 4]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    yAxisId="left"
                    dataKey="waveHeight"
                    name="Altura oleaje (m)"
                  >
                    {session.surfConditions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.waveHeight)}
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="windSpeed"
                    stroke="var(--color-windSpeed)"
                    name="Velocidad viento (km/h)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceLine
                    x={selectedDateTime}
                    yAxisId="left"
                    stroke="black"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <WeatherInfoCard
                icon={<Thermometer className="w-8 h-8" />}
                label="Temperatura"
                value={`${selectedCondition.temperature}°C`}
              />
              <WeatherInfoCard
                icon={<Droplet className="w-8 h-8" />}
                label="Temperatura del agua"
                value={`${selectedCondition.waterTemperature}°C`}
              />
              <WeatherInfoCard
                icon={<Wind className="w-8 h-8" />}
                label="Dirección del viento"
                value={`${getDirectionFromDegrees(selectedCondition.windDirection)}`}
                tooltip={`${selectedCondition.windDirection}°`}
                degrees={selectedCondition.windDirection}
              />
              <WeatherInfoCard
                icon={<Wind className="w-8 h-8" />}
                label="Ráfagas de viento"
                value={`${selectedCondition.windGusts} km/h`}
              />
              <WeatherInfoCard
                icon={<Compass className="w-8 h-8" />}
                label="Dirección del oleaje"
                value={`${getDirectionFromDegrees(selectedCondition.waveDirection)}`}
                tooltip={`${selectedCondition.waveDirection}°`}
                degrees={selectedCondition.waveDirection}
              />
              <WeatherInfoCard
                icon={
                  <Image
                    src={
                      WeatherCode[selectedCondition.weatherCode]?.image ||
                      "/placeholder.svg"
                    }
                    width={40}
                    height={40}
                    alt="Clima"
                  />
                }
                label="Clima"
                value={
                  WeatherCode[selectedCondition.weatherCode]?.description ||
                  "Unknown"
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WeatherInfoCard({
  icon,
  label,
  value,
  tooltip,
  degrees,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip?: string;
  degrees?: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center p-4">
        <div className="mr-4 flex-shrink-0">{icon}</div>
        <div className="flex-grow">
          <p className="text-sm font-medium">{label}</p>
          <div className="flex items-center">
            {degrees !== undefined && (
              <div className="relative w-6 h-6" title={tooltip}>
                <MousePointer2
                  className="w-6 h-6 absolute top-0 left-0 text-primary"
                  style={{ transform: `rotate(${45 + degrees}deg)` }}
                />
              </div>
            )}
            <p className="text-lg font-bold mr-2">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
