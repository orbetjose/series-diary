import * as z from "zod";

export type Series = {
  id: string;
  title: string;
  type: "Serie" | "Película" | "Documental" | "Miniserie";
  platform: "Netflix" | "Amazon Prime" | "HBO" | "Disney+" | "Cine";
  rating: number;
  couple: boolean;
  season: string;
  comments: string;
  created_at: string;
  finished_at: string | null;
};
export type Mode = "create" | "edit";

export const plataforms = ["Netflix", "Amazon Prime", "HBO", "Disney+", "Cine"] as const;
export const types = ["Serie", "Película", "Documental", "Miniserie"] as const;

export const formSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres.")
    .max(42, "El título debe tener como máximo 42 caracteres."),
  platform: z.enum(plataforms, {
    message: "La plataforma es requerida.",
  }),
  type: z.enum(types, {
    message: "El tipo es requerido.",
  }),
  rating: z.number().min(1, "La calificación debe ser al menos 1.").max(5, "La calificación debe ser como máximo 5."),
  couple: z.boolean().optional(),
  finishDate: z.date({
    message: "La fecha es requerida.",
  }),
  season: z.string().max(32, "La temporada debe tener como máximo 32 caracteres.").optional(),
  comments: z.string().max(255, "Los comentarios deben tener como máximo 255 caracteres.").optional(),
});