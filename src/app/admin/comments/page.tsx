"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type CommentStatus = "PENDIENTE" | "APROBADO" | "DENEGADO";

type AdminComment = {
  id: string;
  author: string;
  text: string;
  status: CommentStatus;
  visible?: boolean;
  createdAt?: string;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/comments`;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export default function AdminCommentsPage() {
  const [status, setStatus] = useState<CommentStatus>("PENDIENTE");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const token = useMemo(() => getToken(), []);

  async function loadComments(currentStatus: CommentStatus) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/admin?status=${currentStatus}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("No se pudieron cargar los comentarios");
      }

      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar los comentarios.");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  async function approveComment(id: string) {
    try {
      setProcessingId(id);
      setError(null);

      const res = await fetch(`${API_BASE}/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo aprobar el comentario");
      }

      await loadComments(status);
    } catch {
      setError("No se pudo aprobar el comentario.");
    } finally {
      setProcessingId(null);
    }
  }

  async function denyComment(id: string) {
    try {
      setProcessingId(id);
      setError(null);

      const res = await fetch(`${API_BASE}/${id}/deny`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo denegar el comentario");
      }

      await loadComments(status);
    } catch {
      setError("No se pudo denegar el comentario.");
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    loadComments(status);
  }, [status]);

  function formatDate(date?: string) {
    if (!date) return "Sin fecha";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Sin fecha";

    return parsed.toLocaleString("es-CR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getStatusClasses(value: CommentStatus) {
    switch (value) {
      case "PENDIENTE":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "APROBADO":
        return "bg-green-100 text-green-800 border border-green-200";
      case "DENEGADO":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Comentarios</h1>
          <p className="text-slate-500">Valida los comentarios enviados desde el landing</p>
        </div>

        <Link href="/admin">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Button>
        </Link>
      </div>

      <section className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => setStatus("PENDIENTE")}
            className={
              status === "PENDIENTE"
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
            }
          >
            Pendientes
          </Button>

          <Button
            type="button"
            onClick={() => setStatus("APROBADO")}
            className={
              status === "APROBADO"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
            }
          >
            Aprobados
          </Button>

          <Button
            type="button"
            onClick={() => setStatus("DENEGADO")}
            className={
              status === "DENEGADO"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
            }
          >
            Denegados
          </Button>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <MessageSquare className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            No hay comentarios en esta lista
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Cuando existan comentarios con este estado, aparecerán aquí.
          </p>
        </div>
      ) : (
        <section className="grid gap-5">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900 break-all">
                      {comment.author}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(comment.status)}`}
                    >
                      {comment.status}
                    </span>
                  </div>

                  <div className="max-w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-slate-700 whitespace-pre-wrap break-all leading-relaxed text-sm sm:text-base">
                      {comment.text}
                    </p>
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    Enviado: {formatDate(comment.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 lg:min-w-[170px]">
                  {status !== "APROBADO" && (
                    <Button
                      type="button"
                      onClick={() => approveComment(comment.id)}
                      disabled={processingId === comment.id}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {processingId === comment.id ? "Procesando..." : "Aprobar"}
                    </Button>
                  )}

                  {status !== "DENEGADO" && (
                    <Button
                      type="button"
                      onClick={() => denyComment(comment.id)}
                      disabled={processingId === comment.id}
                      className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      {processingId === comment.id ? "Procesando..." : "Denegar"}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}