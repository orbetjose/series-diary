"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { LogoutButton } from "@/components/logout-button";
import FormCreateList from "@/components/form-create-list";
import { Lista } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function MiLista() {
  const [isOpen, setIsOpen] = useState(false);
  const [miLista, setMiLista] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchSeries = async () => {
      const { data, error } = await supabase.from("mi_lista").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching series:", error);
      } else {
        setMiLista(data);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    fetchSeries();
  }, [refreshTrigger]);

  return (
    <div>
      <h1 className="text-center text-2xl pt-4">Mi Lista</h1>
      <div className="text-center mt-4">
        <Button
          onClick={() => {
            setIsOpen(true);
          }}>
          Agregar
        </Button>
      </div>
      <div className="max-w-xl mx-auto">
        <Table>
          <TableCaption>Lista de contenido.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Titulo</TableHead>
              <TableHead>Plataforma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {miLista.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.platform}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <FormCreateList
        open={isOpen}
        onOpenChange={setIsOpen}
      />
      <div className="pt-12 text-center">
        <LogoutButton />
      </div>
    </div>
  );
}
