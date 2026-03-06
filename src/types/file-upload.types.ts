/**
 * File Upload Modal Types
 */

export interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onSave?: () => void;
  acceptedFormats?: string[];
}

export interface UploadedFileInfo {
  file: File;
  name: string;
  size: number;
  type: string;
}
