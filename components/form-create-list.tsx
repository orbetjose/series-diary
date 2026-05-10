import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { plataforms, formMiListaSchema } from "@/lib/types";

type FormRecordProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FormCreateList({ open, onOpenChange }: FormRecordProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formMiListaSchema>>({
    resolver: zodResolver(formMiListaSchema),
    defaultValues: {
      title: "",
      platform: "Netflix",
    },
  });


  async function onSubmit(data: z.infer<typeof formMiListaSchema>) {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    const payload = {
      title: data.title,
      platform: data.platform,
    };

      const id = uuidv4();
      const { error } = await supabase.from("mi_lista").insert({
        id,
        ...payload,
      });
      if (error) {
        console.error("Error inserting series:", error);
        setLoading(false);
      }
    

    form.reset();
    onOpenChange(false);
    setLoading(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar serie a la lista</DialogTitle>
          <DialogDescription>Ingresa los detalles de la serie.</DialogDescription>
        </DialogHeader>
        <form
          id="form-mi-lista-record"
          onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-mi-lista-record-title">Titulo de serie</FieldLabel>
                  <Input
                    {...field}
                    id="form-mi-lista-record-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Stranger things"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="platform"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-platform">Plataforma de streaming</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  <Select
                    name={field.name}
                    value={field.value || "Netflix"}
                    onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-45"
                      aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Seleccionar plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {plataforms.map((platform) => (
                          <SelectItem
                            key={platform}
                            value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button
            type="submit"
            form="form-mi-lista-record"
            disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
