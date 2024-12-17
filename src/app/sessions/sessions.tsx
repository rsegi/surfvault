"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { format } from "date-fns";
import { Calendar, Waves, Wind, Droplet, History } from "lucide-react";
import Image from "next/image";
import { SessionResponse } from "api/session/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { WeatherCode } from "@/utils/weatherCode";
import { getDirectionFromDegrees } from "@/utils/getDirectionFromDegrees";
import { Separator } from "@/components/ui/separator";
import { roundTimeToHour } from "@/utils/timeUtils";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import MapFixed from "@/components/mapFixed";

function InfoItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center h-full px-2">
      <div className="mr-2">{icon}</div>
      <div className="text-sm font-medium flex-grow">{value}</div>
    </div>
  );
}

type SessionsPageProps = {
  initialSessions: SessionResponse[];
  totalSessions: number;
  fetchSessions: (page: number) => Promise<SessionResponse[]>;
};

export default function SessionsPage({
  initialSessions,
  totalSessions,
  fetchSessions,
}: SessionsPageProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const sessionsPerPage = 5;
  const totalPages = Math.ceil(totalSessions / sessionsPerPage);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadSessions = async () => {
      if (loading) {
        return;
      }
      setLoading(true);
      try {
        const newSessions = await fetchSessions(currentPage);
        setSessions(newSessions);
      } catch (error) {
        toast.error("Error cargando sesiones.");
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [currentPage, fetchSessions]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
    <div className="flex space-y-8 py-8 flex-col items-center justify-center">
      <Link href="/sessions/create">
        <Button>Crear Nueva Sesión</Button>
      </Link>
      {loading ? (
        <Spinner>Cargando...</Spinner>
      ) : (
        sessions.map((session) => {
          const formattedCondition = session.surfConditions.find(
            (sc) => sc.dateTime === roundTimeToHour(session.time)
          );
          return (
            <Card className="w-full max-w-[992px]" key={session.id}>
              <CardContent className="space-y-8">
                <div className="flex bg-white rounded-md overflow-hidden">
                  <div className="w-full relative h-96">
                    {session.fileUrls && session.fileUrls.length > 0 ? (
                      <Carousel className="w-full h-full">
                        <CarouselContent className="my-2">
                          {session.fileUrls.map((file, index) => (
                            <CarouselItem key={index} className="h-full w-full">
                              <div className="h-96 w-full relative">
                                <Image
                                  src={file.url}
                                  alt={`${file.name}`}
                                  fill={true}
                                  className="rounded-md w-auto h-auto object-contain"
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <div className="absolute top-1/2 left-14 right-14 flex justify-between transform -translate-y-1/2 z-10">
                          <CarouselPrevious />
                          <CarouselNext />
                        </div>
                      </Carousel>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="w-24 flex flex-col justify-between">
                    <InfoItem
                      icon={<Waves className="w-4 h-4" />}
                      value={`${formattedCondition!.waveHeight}m`}
                    />
                    <Separator />
                    <InfoItem
                      icon={<History className="w-4 h-4" />}
                      value={`${formattedCondition!.wavePeriod}s`}
                    />
                    <Separator />
                    <InfoItem
                      icon={<Wind className="w-4 h-4" />}
                      value={`${getDirectionFromDegrees(formattedCondition!.windDirection)}`}
                    />
                    <Separator />
                    <InfoItem
                      icon={
                        <Image
                          src={
                            WeatherCode[formattedCondition!.weatherCode]
                              .image || "/placeholder.svg"
                          }
                          width={16}
                          height={16}
                          alt="Clima"
                        />
                      }
                      value={`${formattedCondition!.temperature}°C`}
                    />
                    <Separator />
                    <InfoItem
                      icon={<Droplet className="w-4 h-4" />}
                      value={`${formattedCondition!.waterTemperature}°C`}
                    />
                  </div>
                </div>
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div>
                      <div className="flex items-center space-x-2 text-base font-semibold">
                        {session.title}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(session.date), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="w-48 h-24">
                      <MapFixed
                        center={[
                          parseFloat(session.latitude),
                          parseFloat(session.longitude),
                        ]}
                        zoom={10}
                        className="h-full w-full rounded-md"
                      />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })
      )}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              isActive={currentPage > 1}
              aria-label="Anterior"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  handlePageChange(currentPage - 1);
                }
              }}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              {Math.abs(currentPage - page) <= 2 ||
              page === 1 ||
              page === totalPages ? (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              ) : page === 2 || page === totalPages - 1 ? (
                <PaginationEllipsis />
              ) : null}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              isActive={currentPage < totalPages}
              aria-label="Siguiente"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  handlePageChange(currentPage + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
