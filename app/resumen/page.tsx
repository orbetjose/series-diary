"use client";

import { useState, useEffect, useMemo } from "react";
import { Series } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { StarIcon } from "lucide-react";

export default function Resumen() {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [filters, setFilters] = useState("Serie");
  const [currentYear, setCurrentYear] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const filtered = useMemo(() => {
    const filtered = allSeries.filter((item) => item.type === filters);
    return filtered;
  }, [allSeries, filters]);

  const stats = useMemo(() => {
    return allSeries.reduce(
      (acc, item) => {
        if (item.type === "Película") {
          acc.peliculasVistas++;
        }

        if (item.type === "Serie") {
          acc.seriesVistas++;
        }

        if (item.type === "Miniserie") {
          acc.miniserieVistas++;
        }

        if (item.type === "Documental") {
          acc.documentalVistos++;
        }

        return acc;
      },
      {
        peliculasVistas: 0,
        seriesVistas: 0,
        documentalVistos: 0,
        miniserieVistas: 0,
      },
    );
  }, [allSeries]);

  useEffect(() => {
    const fetchSeries = async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching series:", error);
      } else {
        setAllSeries(data);
      }
      setLoading(false);
    };

    fetchSeries();
  }, []);

  const cards = [
    {
      label: "Series",
      type: "Serie",
      total: stats.seriesVistas,
    },
    {
      label: "Películas",
      type: "Película",
      total: stats.peliculasVistas,
    },
    {
      label: "Miniserie",
      type: "Miniserie",
      total: stats.miniserieVistas,
    },
    {
      label: "Documental",
      type: "Documental",
      total: stats.documentalVistos,
    },
  ];

  if (loading)
    return (
      <div className="relative h-screen w-screen">
        <div className=" absolute left-1/2 top-1/2 translate-middle">
          <Spinner className="size-8" />
        </div>
      </div>
    );
  return (
    <div className="pt-8 pb-8">
      <div className="md:max-w-2xl mx-auto grid md:grid-cols-2 grid-cols-1 gap-4 px-8 md:px-0">
        {cards.map((card) => (
          <div
            key={card.type}
            onClick={() => setFilters(card.type)}
            className={`border rounded-lg p-6 items-center flex flex-col ${filters === card.type ? "bg-green-600" : ""}`}
          >
            <span>{card.label} vistas en {currentYear}</span>
            <span>{card.total}</span>
          </div>
        ))}
      </div>
      <div className="pt-8 md:max-w-4xl mx-auto px-4 md:px-0">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Título</TableHead>
              <TableHead className="w-[35%]">Plataforma</TableHead>
              <TableHead className="w-[15%]">Rating</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="w-[40%] wrap-break-word whitespace-break-spaces">{item.title}</TableCell>
                <TableCell className="w-[35%]">{item.platform}</TableCell>
                <TableCell className="w-[15%] flex">
                  {Array.from({ length: 5 }, (_, index) => index + 1).map(
                    (index) => (
                      <div className="relative" key={index}>
                        <StarIcon
                          fill={
                            item?.rating && item.rating >= index
                              ? "#eab308"
                              : "none"
                          }
                          color={
                            item?.rating && item.rating >= index
                              ? "#eab308"
                              : "gray"
                          }
                        />
                      </div>
                    ),
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
