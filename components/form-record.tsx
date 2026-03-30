"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type FormRecordProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshSeries: () => void;
};

const plataforms = ["Netflix", "Amazon Prime", "HBO", "Disney+"] as const;

const formSchema = z.object({
  title: z
    .string()
    .min(5, "The title must be at least 5 characters.")
    .max(32, "The title must be at most 32 characters."),
  platform: z.enum(plataforms, {
    message: "La plataforma es requerida.",
  }),
  rating: z.string().min(0, "El rating debe ser entre 0 y 5.").max(5, "El rating debe ser entre 0 y 5."),
  finishDate: z.date({
    message: "La fecha es requerida.",
  }),
});

export default function FormRecord({ open, onOpenChange, refreshSeries }: FormRecordProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      platform: "Netflix",
      rating: "",
      finishDate: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const supabase = createClient();

    const { error } = await supabase.from("series").insert({
      title: data.title,
      platform: data.platform,
      rating: parseFloat(data.rating),
      finished_at: data.finishDate.toISOString(),
    });

    if (error) {
      console.error("Error inserting series:", error);
    } else {
      console.log("Serie creada con exito");
      form.reset(); 
      onOpenChange(false);
      refreshSeries();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Creación de serie</DialogTitle>
          <DialogDescription>Ingresa los detalles de la serie.</DialogDescription>
        </DialogHeader>
        <form
          id="form-series-record"
          onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-title">Titulo de serie</FieldLabel>
                  <Input
                    {...field}
                    id="form-series-record-title"
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
                    <SelectTrigger className="w-45" aria-invalid={fieldState.invalid}>
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
            <Controller
              name="rating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-rating">Calificación</FieldLabel>
                  <Input
                    {...field}
                    id="form-series-record-rating"
                    aria-invalid={fieldState.invalid}
                    placeholder="3"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="finishDate"
              control={form.control}
              render={({ field: { value, onChange }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-series-record-finish-date">Fecha de finalización</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="form-series-record-finish-date"
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
                        aria-invalid={fieldState.invalid}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, "PPP") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start">
                      <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
            form="form-series-record">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
