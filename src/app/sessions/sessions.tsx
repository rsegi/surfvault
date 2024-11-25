"use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import { format } from "date-fns";
// import { MapPin, Calendar } from 'lucide-react';
// import Image from "next/image";
import CreateSessionModal from "@/components/createSessionForm";
// import { useQuery } from "@tanstack/react-query";

// async function fetchSessions() {
//   const response = await fetch("/api/sessions");
//   if (!response.ok) {
//     throw new Error("Failed to fetch sessions");
//   }
//   return response.json();
// }

export default function SessionsPage() {
  // const { data: sessions = [], isLoading } = useQuery({
  //   queryKey: ["sessions"],
  //   queryFn: fetchSessions,
  // });

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (sessions.length === 0) {
  return (
    <div className="flex flex-col items-center h-[calc(100vh-4rem)] space-y-4">
      <h2 className="text-2xl font-bold text-center">No tienes sesiones aún</h2>
      <p className="text-center text-muted-foreground">
        Crea tu primera sesión de surf y comienza a trackear tu progreso.
      </p>
      <CreateSessionModal />
    </div>
  );
  // }

  // return (
  //   <div className="space-y-8 py-8">
  //     <CreateSessionModal />
  //     {sessions.map((session) => (
  //       <Card key={session.id} className="w-full max-w-3xl mx-auto">
  //         <CardHeader>
  //           <CardTitle>{session.title}</CardTitle>
  //           <div className="flex items-center space-x-2 text-sm text-muted-foreground">
  //             <MapPin className="w-4 h-4" />
  //             <span>{session.location}</span>
  //           </div>
  //           <div className="flex items-center space-x-2 text-sm text-muted-foreground">
  //             <Calendar className="w-4 h-4" />
  //             <span>{format(new Date(session.date), "dd/MM/yyyy")}</span>
  //           </div>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           {session.fileUrls && (
  //             <Carousel className="w-full max-w-xs mx-auto">
  //               <CarouselContent>
  //                 {session.fileUrls.split(',').map((url, index) => (
  //                   <CarouselItem key={index}>
  //                     <Image
  //                       src={url}
  //                       alt={`Session photo ${index + 1}`}
  //                       width={200}
  //                       height={200}
  //                       className="w-full h-48 object-cover rounded-md"
  //                     />
  //                   </CarouselItem>
  //                 ))}
  //               </CarouselContent>
  //               <CarouselPrevious />
  //               <CarouselNext />
  //             </Carousel>
  //           )}
  //           <ChartContainer
  //             config={{
  //               value: {
  //                 label: "Wave Height (ft)",
  //                 color: "hsl(var(--chart-1))",
  //               },
  //             }}
  //             className="h-[200px]"
  //           >
  //             <ResponsiveContainer width="100%" height="100%">
  //               <LineChart data={session.chartData || []}>
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="name" />
  //                 <YAxis />
  //                 <ChartTooltip content={<ChartTooltipContent />} />
  //                 <Line
  //                   type="monotone"
  //                   dataKey="value"
  //                   stroke="var(--color-value)"
  //                   strokeWidth={2}
  //                   dot={false}
  //                 />
  //               </LineChart>
  //             </ResponsiveContainer>
  //           </ChartContainer>
  //         </CardContent>
  //       </Card>
  //     ))}
  //   </div>
  // );
}
