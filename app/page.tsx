"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FormRecord from "@/components/form-record";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

type Series = {
  id: string;
  title: string;
  platform: "Netflix" | "Amazon Prime" | "HBO" | "Disney+";
  rating: number;
  created_at: string;
  finished_at: string | null;
};

type FilterDate = {
  year: string;
  month: string;
};

const months = [
  { name: "Enero", value: "01" },
  { name: "Febrero", value: "02" },
  { name: "Marzo", value: "03" },
  { name: "Abril", value: "04" },
  { name: "Mayo", value: "05" },
  { name: "Junio", value: "06" },
  { name: "Julio", value: "07" },
  { name: "Agosto", value: "08" },
  { name: "Septiembre", value: "09" },
  { name: "Octubre", value: "10" },
  { name: "Noviembre", value: "11" },
  { name: "Diciembre", value: "12" },
];

export default function Home() {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterDate, setFilterDate] = useState<FilterDate>({
    year: "",
    month: "",
  });
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const supabase = createClient();

  // Cargar TODAS las series una sola vez
  useEffect(() => {
    const fetchSeries = async () => {
      const { data, error } = await supabase.from("series").select("*");
      if (error) {
        console.error("Error fetching series:", error);
      } else {
        setAllSeries(data);
      }
      setLoading(false);
    };

    fetchSeries();
  }, [refreshTrigger]);

  // Obtener meses disponibles cuando cambia el año
  useEffect(() => {
    if (!filterDate.year) {
      setAvailableMonths([]);
      return;
    }

    const monthsWithData = new Set<string>();

    allSeries.forEach((serie) => {
      if (!serie.finished_at) return;

      const finishedDate = new Date(serie.finished_at);
      const finishedYear = finishedDate.getFullYear().toString();
      const finishedMonth = String(finishedDate.getMonth() + 1).padStart(2, "0");

      if (finishedYear === filterDate.year) {
        monthsWithData.add(finishedMonth);
      }
    });

    setAvailableMonths(Array.from(monthsWithData).sort());
  }, [filterDate.year, allSeries]);

  // Reemplaza los últimos 3 useEffect por este:

  useEffect(() => {
    let results = allSeries;

    // Filtro 1: Por búsqueda de texto

    // Filtro 2: Por año y mes
    if (filterDate.year) {
      results = results.filter((serie) => {
        if (!serie.finished_at) return false;

        const finishedDate = new Date(serie.finished_at);
        const finishedYear = finishedDate.getFullYear().toString();
        const finishedMonth = String(finishedDate.getMonth() + 1).padStart(2, "0");

        if (finishedYear !== filterDate.year) return false;

        if (filterDate.month && finishedMonth !== filterDate.month) return false;

        return true;
      });
    }

    setFilteredSeries(results);
  }, [filterDate]);

  const handleSelectChange = (value: string, type: "year" | "month") => {
    setFilterDate((prev) => ({
      ...prev,
      [type]: value,
      ...(type === "year" && { month: "" }),
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="md:max-w-3xl mx-auto min-h-screen">
        <h1 className="text-center text-2xl pt-4">Diario de series Mignori</h1>
      <div className="flex gap-4 pb-4 pt-12 justify-center">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Select onValueChange={(value) => handleSelectChange(value, "year")}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {filterDate.year.length > 0 && (
            <Select onValueChange={(value) => handleSelectChange(value, "month")}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {months
                    .filter((month) => availableMonths.includes(month.value))
                    .map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value}>
                        {month.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <div>
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}>
              Crear serie
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Table>
          <TableCaption>Filtra algunas series</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Terminada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSeries.length > 0 &&
              filteredSeries.map((serie) => (
                <TableRow key={serie.id}>
                  <TableCell>{serie.title}</TableCell>
                  <TableCell>{serie.platform}</TableCell>
                  <TableCell>{serie.rating}/5</TableCell>
                  <TableCell>{serie.finished_at ? new Date(serie.finished_at).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <FormRecord
        open={isOpen}
        onOpenChange={setIsOpen}
        refreshSeries={() => setRefreshTrigger((prev) => prev + 1)}
      />
      <div className="pt-12 text-center">
        <LogoutButton />
      </div>
    </main>
  );
}
