"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FormRecord from "@/components/form-record";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import FormDetails from "@/components/ui/form-details";
import { Series } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

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
  const [isOpenDetails, setIsOpenDetails] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterDate, setFilterDate] = useState<FilterDate>({
    year: "",
    month: "",
  });
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchSeries = async () => {
      const { data, error } = await supabase.from("series").select("*").order("created_at", { ascending: true });
      if (error) {
        console.error("Error fetching series:", error);
      } else {
        setAllSeries(data);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    fetchSeries();
  }, [refreshTrigger]);

  const filteredSeries = useMemo(() => {
    if (!filterDate.year) return [];

    return allSeries.filter((serie) => {
      if (!serie.finished_at) return false;

      const finishedDate = new Date(serie.finished_at);
      const finishedYear = finishedDate.getFullYear().toString();
      const finishedMonth = String(finishedDate.getMonth() + 1).padStart(2, "0");

      if (finishedYear !== filterDate.year) return false;
      if (filterDate.month && finishedMonth !== filterDate.month) return false;

      return true;
    });
  }, [allSeries, filterDate]);

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

  const showDetails = (serie: Series) => {
    setIsOpenDetails(true);
    setSelectedSerie(serie);
  };

  const handleSelectChange = (value: string, type: "year" | "month") => {
    setFilterDate((prev) => ({
      ...prev,
      [type]: value,
      ...(type === "year" && { month: "" }),
    }));
  };

  if (loading)
    return (
      <div className="relative h-screen w-screen">
        <div className=" absolute left-1/2 top-1/2 translate-middle">
          <Spinner className="size-8" />
        </div>
      </div>
    );

  return (
    <main className="md:max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-2xl pt-4">Diario de Películas y Series</h1>
      <div className="flex gap-4 pb-4 pt-12 justify-center">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Select onValueChange={(value) => handleSelectChange(value, "year")}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
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
            <Button onClick={() => setIsOpen(true)}>Crear serie</Button>
          </div>
        </div>
      </div>
      <div>
        <Table className="text-center">
          <TableCaption>Filtra algunas series</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-center">Título</TableHead>
              <TableHead className="text-center">Plataforma</TableHead>
              <TableHead className="text-center">Terminada</TableHead>
              <TableHead className="text-center">Temporada</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSeries.length > 0 &&
              filteredSeries.map((serie) => (
                <TableRow key={serie.id}>
                  <TableCell
                    className={`${serie.type === "Serie" ? "bg-green-600" : ""} ${serie.type === "Película" ? "bg-white text-black" : ""} ${serie.type === "Documental" ? "bg-red-600" : ""}`}>
                    {serie.type}
                  </TableCell>
                  <TableCell>{serie.title}</TableCell>
                  <TableCell>{serie.platform}</TableCell>
                  <TableCell>{serie.finished_at ? new Date(serie.finished_at).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{serie.season}</TableCell>
                  <TableCell>
                    <Button onClick={() => showDetails(serie)}> Detalles</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <FormRecord
        open={isOpen}
        onOpenChange={setIsOpen}
        refreshSeries={() => setRefreshTrigger(refreshTrigger + 1)}
      />
      <FormDetails
        open={isOpenDetails}
        onOpenChange={setIsOpenDetails}
        serie={selectedSerie}
        refreshSeries={() => setRefreshTrigger(refreshTrigger + 1)}
      />
      <div className="pt-12 text-center">
        <LogoutButton />
      </div>
    </main>
  );
}
