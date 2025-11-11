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

  const fallback: Comment[] = useMemo(
    () =>
      (comments?.filter((c) => c.visible !== false) ??
        [
          { id: "d1", author: "María González", text: "Una experiencia increíble, el equipo fue muy profesional y atento en todo momento.", visible: true },
          { id: "d2", author: "Carlos Ramírez", text: "Quedé muy satisfecho con el servicio. Altamente recomendado.", visible: true },
          { id: "d3", author: "Ana López", text: "Excelente atención y resultados que superaron mis expectativas.", visible: true },
        ]),
    [comments]
  );

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
        setLoadError(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fallback]);

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

    setList((prev) => [optimistic, ...prev]);

    try {
      const saved = await apiCreateComment({ author: optimistic.author, text: optimistic.text });
      setList((prev) =>
        prev.map((c) => (c.id === tempId ? { ...saved, visible: saved.visible ?? true } : c))
      );
      setName("");
      setText("");
    } catch {
      setList((prev) => prev.filter((c) => c.id !== tempId));
      setSubmitError("No se pudo publicar el comentario. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-5 sm:p-8 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8 sm:mb-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-green-700" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
            Comentarios
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-green-600"></div>
          </div>
        ) : (
          <>
            {/* Lista de comentarios */}
            <div className="space-y-5 sm:space-y-6 mb-10 sm:mb-12">
              {list.map((c) => (
                <div 
                  key={c.id} 
                  className="bg-gray-50 rounded-xl p-4 sm:p-6 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                        {c.author}
                      </h4>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {list.length === 0 && (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Sé el primero en comentar
                  </p>
                </div>
              )}
            </div>

            {/* Formulario */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 sm:p-8 border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5 sm:mb-6">
                Deja tu comentario
              </h3>

              {submitError && (
                <div className="mb-5 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <Label htmlFor="comment-name" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">
                    Nombre
                  </Label>
                  <Input
                    id="comment-name"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    className="h-11 sm:h-12 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm sm:text-base text-gray-900"
                  />
                </div>

                <div>
                  <Label htmlFor="comment-text" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">
                    Comentario
                  </Label>
                  <Textarea
                    id="comment-text"
                    placeholder="Escribe tu comentario..."
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={500}
                    className="resize-none bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm sm:text-base text-gray-900"
                  />
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 text-right">
                    {text.length}/500
                  </p>
                </div>

                <Button 
                  onClick={handleAdd}
                  disabled={submitting || !name.trim() || !text.trim()}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Publicando..." : "Publicar comentario"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}