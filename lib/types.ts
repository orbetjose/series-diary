import * as z from "zod";

export type Series = {
  id: string;
  title: string;
  type: "Serie" | "Película" | "Documental";
  platform: "Netflix" | "Amazon Prime" | "HBO" | "Disney+";
  rating: number;
  season: number;
  comments: string;
  created_at: string;
  finished_at: string | null;
};

export const plataforms = ["Netflix", "Amazon Prime", "HBO", "Disney+"] as const;
export const types = ["Serie", "Película", "Documental"] as const;

export const formSchema = z.object({
  title: z
    .string()
    .min(5, "The title must be at least 5 characters.")
    .max(32, "The title must be at most 32 characters."),
  platform: z.enum(plataforms, {
    message: "La plataforma es requerida.",
  }),
  type: z.enum(types, {
    message: "El tipo es requerida.",
  }),
  rating: z.number().min(1, "La calificación debe ser al menos 1.").max(5, "La calificación debe ser como máximo 5."),
  finishDate: z.date({
    message: "La fecha es requerida.",
  }),
  season: z.number().min(1, "La temporada debe ser un número positivo."),
  comments: z.string().max(255, "Los comentarios deben tener como máximo 255 caracteres.").optional(),
});