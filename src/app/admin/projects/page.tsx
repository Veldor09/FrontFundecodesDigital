"use client";

import Modal from "@/components/ui/Modal";
import { useProjects } from "./hooks/useProjects";
import ProjectNav from "./components/ProjectNav";
import ProjectTable from "./components/ProjectTable";
import ProjectForm from "./components/ProjectForm";
import ProjectFilesModal from "./components/ProjectFilesModal";
import type { Project } from "@/lib/projects.types";

export default function AdminProjectsPage() {
  const {
    // datos / estado
    items,
    loading,

    // filtros
    q, setQ,
    place, setPlace,
    category, setCategory,
    area, setArea,
    status, setStatus,
    published, setPublished,

    // opciones derivadas
    places,
    categories,
    areas,

    // paginación
    page,
    totalPages,
    goPrev,
    goNext,

    // acciones
    applyFilters,
    clearFilters,
    reload,

    // CRUD / modal
    mode,
    setMode,
    handleCreate,
    handleUpdate,
    handleRemove,

    // modal de archivos (post-create)
    filesModalOpen,
    setFilesModalOpen,
    newProjectId,
  } = useProjects();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <ProjectNav title="Bienvenido al Área de Proyectos" backHref="/admin" />

        <section>
          <ProjectTable
            // estado
            loading={loading}
            items={items}

            // filtros
            q={q}
            onQChange={setQ}
            place={place}
            onPlaceChange={setPlace}
            category={category}
            onCategoryChange={setCategory}
            area={area}
            onAreaChange={setArea}
            status={status}
            onStatusChange={setStatus}
            published={published}
            onPublishedChange={setPublished}

            // opciones para selects
            places={places}
            categories={categories}
            areas={areas}

            // acciones
            onApply={applyFilters}
            onClear={clearFilters}
            onReload={reload}
            onAdd={() => setMode({ kind: "create" })}
            onEdit={(p: Project) => setMode({ kind: "edit", item: p })}
            onDelete={handleRemove}

            // paginación
            page={page}
            totalPages={totalPages}
            onPrev={goPrev}
            onNext={goNext}
          />
        </section>

        {/* Modal del formulario (crear/editar) */}
        <Modal
          open={mode.kind !== "none"}
          onClose={() => setMode({ kind: "none" })}
          title={mode.kind === "create" ? "Añadir proyecto" : "Editar proyecto"}
        >
          {/* CREATE */}
          <div style={{ display: mode.kind === "create" ? "block" : "none" }}>
            <ProjectForm
              key="create"
              mode="create"
              onCancel={() => setMode({ kind: "none" })}
              onSubmit={handleCreate}
            />
          </div>

          {/* EDIT */}
          <div style={{ display: mode.kind === "edit" ? "block" : "none" }}>
            {mode.kind === "edit" && (
              <ProjectForm
                key={`edit-${mode.item.id}`}
                mode="edit"
                initial={mode.item}
                onCancel={() => setMode({ kind: "none" })}
                onSubmit={(payload) => handleUpdate(payload, mode.item.id)}
              />
            )}
          </div>
        </Modal>

        {/* Modal de archivos (post-create) */}
        <ProjectFilesModal
          open={filesModalOpen}
          onOpenChange={setFilesModalOpen}
          projectId={newProjectId}
        />
      </div>
    </main>
  );
}
