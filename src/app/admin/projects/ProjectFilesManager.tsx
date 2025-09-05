"use client";

import { useState, useEffect } from "react";
import { FileUploader } from "@/components/ui/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, FileText, Download, Trash2, Eye } from "lucide-react";
import { uploadProjectFile, deleteProjectFile, getProjectFiles } from "@/services/projects.service";
import { formatFileSize, getFileIcon } from "@/services/files.service";

interface ProjectFile {
  id?: number;
  url: string;
  name: string;
  mimeType: string;
  size?: number;
  createdAt?: string;
}

interface ProjectFilesManagerProps {
  projectId: number;
  onFilesChange: (files: ProjectFile[]) => void;
}

export function ProjectFilesManager({ projectId, onFilesChange }: ProjectFilesManagerProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

  useEffect(() => {
    loadProjectFiles();
  }, [projectId]);

  const loadProjectFiles = async () => {
    try {
      setLoading(true);
      const projectFiles = await getProjectFiles(projectId);
      setFiles(projectFiles);
      onFilesChange(projectFiles);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tipo de archivo para proyectos
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|gif|txt)$/i)) {
      alert('Tipo de archivo no permitido. Use: PDF, JPG, PNG, GIF, TXT');
      return;
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      await uploadProjectFile(projectId, file);
      await loadProjectFiles(); // Recargar lista
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error al subir archivo: ${error.message}`);
      } else {
        alert('Error desconocido al subir archivo');
      }
      throw error; // Re-lanzar para que el FileUploader lo maneje
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (file: ProjectFile) => {
    setFileToDelete(file);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      await deleteProjectFile(projectId, fileToDelete.url);
      await loadProjectFiles(); // Recargar lista
      setFileToDelete(null);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error al eliminar archivo: ${error.message}`);
      } else {
        alert('Error desconocido al eliminar archivo');
      }
    }
  };

  const handleDownloadFile = (file: ProjectFile) => {
    window.open(`http://localhost:4000/files/download/${file.url.split('/').pop()}`, '_blank');
  };

  const handlePreviewFile = (file: ProjectFile) => {
    if (file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf') {
      window.open(`http://localhost:4000/files/preview/${file.url.split('/').pop()}`, '_blank');
    } else {
      alert('Vista previa no disponible para este tipo de archivo');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando archivos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Archivos del Proyecto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Subidor de archivos */}
        <FileUploader
          onFileSelect={handleFileSelect}
          onFileUpload={handleFileUpload}
          acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt']}
          maxSize={10 * 1024 * 1024} // 10MB
        />

        {/* Lista de archivos existentes */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Archivos subidos ({files.length})</h4>
            
            {files.map((file) => (
              <div key={file.id || file.url} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getFileIcon(file.mimeType)}</div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.size ? formatFileSize(file.size) : 'Tamaño desconocido'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewFile(file)}
                    title="Vista previa"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadFile(file)}
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file)}
                    title="Eliminar"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diálogo de confirmación de eliminación */}
        <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar el archivo "{fileToDelete?.name}"? 
                Esta acción no se puede deshacer y el archivo se eliminará permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setFileToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteFile} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}