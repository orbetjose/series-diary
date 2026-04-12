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
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type filters = {
  year: string;
  month: string;
  type: string;
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
  const [filters, setFilters] = useState<filters>({
    year: "",
    month: "",
    type: "",
  });
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filtrar series primero
  const filteredSeries = useMemo(() => {
    if (filters.year === "all") {
      return allSeries.filter((serie) => {
        if (!serie.finished_at) return false;

        const finishedType = serie.type.toLowerCase();
        if (filters.type && filters.type !== "all" && finishedType !== filters.type) return false;

        return true;
      });
    }

    return allSeries.filter((serie) => {
      if (!serie.finished_at) return false;

      const finishedDate = new Date(serie.finished_at);
      const finishedYear = finishedDate.getFullYear().toString();
      const finishedMonth = String(finishedDate.getMonth() + 1).padStart(2, "0");
      const finishedType = serie.type.toLowerCase();

      if (filters.type && filters.type !== "all" && finishedType !== filters.type) return false;

      if (finishedYear !== filters.year) return false;
      if (filters.month && finishedMonth !== filters.month) return false;

      return true;
    });
  }, [allSeries, filters]);

  // Calcular datos paginados DESPUÉS de filtrar
  const paginatedSeries = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredSeries.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredSeries, currentPage]);

  // Calcular total de páginas basado en series filtradas
  const totalPages = useMemo(() => {
    return Math.ceil(filteredSeries.length / itemsPerPage);
  }, [filteredSeries.length]);

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Obtener meses disponibles cuando cambia el año
  useEffect(() => {
    if (!filters.year) {
      setAvailableMonths([]);
      return;
    }

    const monthsWithData = new Set<string>();

    allSeries.forEach((serie) => {
      if (!serie.finished_at) return;

      const finishedDate = new Date(serie.finished_at);
      const finishedYear = finishedDate.getFullYear().toString();
      const finishedMonth = String(finishedDate.getMonth() + 1).padStart(2, "0");

      if (finishedYear === filters.year) {
        monthsWithData.add(finishedMonth);
      }
    });

    setAvailableMonths(Array.from(monthsWithData).sort());
  }, [filters.year, allSeries]);

  const showDetails = (serie: Series) => {
    setIsOpenDetails(true);
    setSelectedSerie(serie);
  };

  const handleSelectChange = (value: string, type: "year" | "month" | "type") => {
    setFilters((prev) => ({
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
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {filters.year && filters.year !== "all" && (
            <Select onValueChange={(value) => handleSelectChange(value, "month")}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {months
                    .filter((month) => availableMonths.includes(month.value))
                    .map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          {filters.year.length > 0 && (
            <Select onValueChange={(value) => handleSelectChange(value, "type")}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Seleccionar tipo serie" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="serie">Serie</SelectItem>
                  <SelectItem value="película">Pelicula</SelectItem>
                  <SelectItem value="documental">Documental</SelectItem>
                  <SelectItem value="miniserie">Miniserie</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <div>
            <Button onClick={() => setIsOpen(true)}>Crear</Button>
          </div>
        </div>
      </div>
      <div>
        <Table className="text-center">
          {filteredSeries.length > 0 && (
            <TableCaption>
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSeries.length)} de {filteredSeries.length} series
            </TableCaption>
          )}

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
            {paginatedSeries.length > 0 &&
              paginatedSeries.map((serie) => (
                <TableRow key={serie.id}>
                  <TableCell>
                    <Badge
                      className={`${serie.type === "Serie" ? "dark:bg-green-950 dark:text-green-300" : ""} ${serie.type === "Miniserie" ? "dark:bg-blue-950 dark:text-blue-300" : ""} ${serie.type === "Película" ? "dark:bg-purple-950 dark:text-purple-300" : ""} ${serie.type === "Documental" ? "dark:bg-red-950 dark:text-red-300" : ""} px-2 rounded-full`}>
                      {serie.type}
                    </Badge>
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="py-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <FormRecord open={isOpen} onOpenChange={setIsOpen} refreshSeries={() => setRefreshTrigger(refreshTrigger + 1)} />
      <FormDetails open={isOpenDetails} onOpenChange={setIsOpenDetails} serie={selectedSerie} refreshSeries={() => setRefreshTrigger(refreshTrigger + 1)} />
      <div className="pt-12 text-center">
        <LogoutButton />
      </div>
    </main>
  );
}