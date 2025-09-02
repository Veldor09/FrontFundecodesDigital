"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Comment = {
  id: string;
  author: string;
  text: string;
  visible?: boolean;
};

// Endpoints que implementarás luego
const API_BASE = "/api/comments";

async function apiGetComments(): Promise<Comment[]> {
  const res = await fetch(API_BASE, { cache: "no-store" });
  if (!res.ok) throw new Error("GET /api/comments failed");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function apiCreateComment(payload: { author: string; text: string }): Promise<Comment> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("POST /api/comments failed");
  const saved = await res.json();
  // Asegura forma
  return {
    id: String(saved?.id ?? Date.now()),
    author: String(saved?.author ?? payload.author),
    text: String(saved?.text ?? payload.text),
    visible: saved?.visible ?? true,
  };
}

export default function Comments({ comments }: { comments?: Comment[] }) {
  const [list, setList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fallback inicial si el backend no responde
  const fallback: Comment[] = useMemo(
    () =>
      (comments?.filter((c) => c.visible !== false) ??
        [
          { id: "d1", author: "Cliente 1", text: "Excelente servicio.", visible: true },
          { id: "d2", author: "Cliente 2", text: "Muy satisfecho con el equipo.", visible: true },
        ]),
    [comments]
  );

  // Carga inicial (intenta backend, cae a fallback)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiGetComments();
        if (!alive) return;
        setList(data.filter((c) => c.visible !== false));
        setLoadError(null);
      } catch {
        if (!alive) return;
        setList(fallback);
        setLoadError("No se pudo cargar desde el servidor. Mostrando datos locales.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fallback]);

  // Envío con update optimista
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setSubmitError(null);
    setSubmitting(true);

    const tempId = "temp-" + Date.now();
    const optimistic: Comment = {
      id: tempId,
      author: name.trim(),
      text: text.trim(),
      visible: true,
    };

    // 1) UI inmediata
    setList((prev) => [optimistic, ...prev]);

    try {
      // 2) Llamada real
      const saved = await apiCreateComment({ author: optimistic.author, text: optimistic.text });

      // 3) Reconciliar temp -> real
      setList((prev) =>
        prev.map((c) => (c.id === tempId ? { ...saved, visible: saved.visible ?? true } : c))
      );

      // 4) Limpiar formulario
      setName("");
      setText("");
    } catch {
      // Revertir si falla
      setList((prev) => prev.filter((c) => c.id !== tempId));
      setSubmitError("No se pudo publicar el comentario. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 font-modern">
        <MessageSquare className="h-6 w-6" />
        SECCIÓN DE COMENTARIOS
      </h2>

      {/* Estados de carga / error */}
      {loading ? (
        <p className="text-gray-500 font-modern">Cargando comentarios…</p>
      ) : (
        <>
          {loadError && (
            <p className="mb-4 text-sm text-amber-600 font-modern">{loadError}</p>
          )}

          {/* Lista */}
          <div className="space-y-6 mb-8">
            {list.map((c) => (
              <div key={c.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 font-modern">{c.author}</h4>
                    <p className="text-sm text-gray-500 font-modern">Opinión</p>
                  </div>
                </div>
                <p className="text-gray-600 font-modern">{c.text}</p>
              </div>
            ))}

            {list.length === 0 && (
              <p className="text-gray-500 font-modern">Sé el primero en comentar.</p>
            )}
          </div>

          {/* Formulario público */}
          <form onSubmit={handleAdd} className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold font-modern">Deja tu comentario</h3>

            {submitError && (
              <p className="text-sm text-red-600 font-modern">{submitError}</p>
            )}

            <div>
              <Label htmlFor="comment-name" className="font-modern">Nombre</Label>
              <Input
                id="comment-name"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="font-modern"
                required
              />
            </div>

            <div>
              <Label htmlFor="comment-text" className="font-modern">Comentario</Label>
              <Textarea
                id="comment-text"
                placeholder="Escribe tu comentario..."
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                className="font-modern"
                required
              />
              <p className="mt-1 text-xs text-gray-500">{text.length}/500</p>
            </div>

            <Button type="submit" disabled={submitting} className="font-modern">
              {submitting ? "Publicando..." : "Publicar Comentario"}
            </Button>
          </form>
        </>
      )}
    </section>
  );
}
