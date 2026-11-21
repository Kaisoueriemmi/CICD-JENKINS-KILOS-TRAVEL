'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export default function FileUpload({
  onFileSelect,
  accept = 'image/jpeg,image/png,application/pdf',
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('Le fichier est trop volumineux (maximum 5MB)');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Format non supporté. Utilisez JPG, PNG ou PDF uniquement');
        } else {
          setError('Erreur lors du chargement du fichier');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);
        
        // Créer preview pour les images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => setPreview(reader.result as string);
          reader.readAsDataURL(file);
        } else {
          // Pour les PDFs, afficher juste le nom
          setPreview(null);
        }

        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize,
    multiple: false,
    disabled,
  });

  const clearPreview = () => {
    setPreview(null);
    setFileName('');
    setError(null);
  };

  return (
    <div className="w-full">
      {!preview && !fileName ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 scale-105' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive
              ? '📥 Déposez le fichier ici'
              : '📤 Glissez-déposez votre ticket ici'}
          </p>
          <p className="text-sm text-gray-500">
            ou cliquez pour sélectionner un fichier
          </p>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG ou PDF (max 5MB)
          </p>
        </div>
      ) : (
        <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain rounded-lg bg-white"
              />
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileImage className="w-10 h-10 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{fileName}</p>
                  <p className="text-xs text-gray-500">Fichier prêt à être scanné</p>
                </div>
              </div>
              <button
                onClick={clearPreview}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
