'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Loader2 } from 'lucide-react';

interface UploadImagesProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxFiles?: number;
  fieldName?: string;
}

export default function UploadImages({
  onImagesUploaded,
  maxFiles = 8,
  fieldName = 'images'
}: UploadImagesProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Configuração do dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      // Verificar se excede o limite de arquivos
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`Você pode enviar no máximo ${maxFiles} imagens`);
        return;
      }
      
      // Adicionar novos arquivos e gerar previews
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      
      // Gerar previews
      const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(rejection => {
        const { errors } = rejection;
        if (errors[0]?.code === 'file-too-large') {
          toast.error('Arquivo muito grande. O tamanho máximo é 5MB');
        } else {
          toast.error(`Erro: ${errors[0]?.message}`);
        }
      });
    }
  });

  // Remover arquivo e preview
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]); // Liberar URL de preview
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  // Enviar arquivos para o servidor
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Selecione pelo menos uma imagem');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append(fieldName, file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar imagens');
      }

      const data = await response.json();
      
      // Limpar estados
      previews.forEach(preview => URL.revokeObjectURL(preview));
      setPreviews([]);
      setFiles([]);
      
      // Notificar componente pai com as URLs das imagens
      onImagesUploaded(data.images);
      toast.success('Imagens enviadas com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(`Erro ao enviar imagens: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de dropzone */}
      <div 
        {...getRootProps()} 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
      >
        <input {...getInputProps()} />
        <UploadCloud size={40} className="text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          Arraste e solte imagens aqui ou {' '}
          <span className="text-purple-600 font-medium">escolha arquivos</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG, WebP • Máximo de 5MB por arquivo
        </p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                <Image 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  fill 
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white shadow-md opacity-90 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botão de upload */}
      {files.length > 0 && (
        <Button
          type="button"
          onClick={uploadFiles}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>Enviar {files.length} {files.length === 1 ? 'imagem' : 'imagens'}</>
          )}
        </Button>
      )}
    </div>
  );
} 