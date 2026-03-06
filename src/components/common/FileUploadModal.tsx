import { useRef, useState, DragEvent } from 'react';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { FileUploadModalProps } from '@/types/file-upload.types';
import { useAppStore } from '@/stores/useAppStore';
import xlsxIcon from '@/assets/upload/xlsx-icon.png';

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34" fill="none">
  <path d="M10 25.185H18C19.1 25.185 20 24.285 20 23.185V13.185H23.18C24.96 13.185 25.86 11.025 24.6 9.765L15.42 0.585C14.64 -0.195 13.38 -0.195 12.6 0.585L3.42 9.765C2.16 11.025 3.04 13.185 4.82 13.185H8V23.185C8 24.285 8.9 25.185 10 25.185ZM2 29.185H26C27.1 29.185 28 30.085 28 31.185C28 32.285 27.1 33.185 26 33.185H2C0.9 33.185 0 32.285 0 31.185C0 30.085 0.9 29.185 2 29.185Z" fill="#B8B8C0"/>
</svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.66683 2H7.3335V8.78L5.08016 6.52667L4.14016 7.46667L8.00016 11.3267L11.8602 7.46667L10.9202 6.52667L8.66683 8.78V2Z" fill="currentColor"/>
    <path d="M12.6668 12.6667H3.3335V14H12.6668V12.6667Z" fill="currentColor"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667ZM8.66667 5.33333C8.66667 5.70152 8.36819 6 8 6C7.63181 6 7.33333 5.70152 7.33333 5.33333C7.33333 4.96514 7.63181 4.66667 8 4.66667C8.36819 4.66667 8.66667 4.96514 8.66667 5.33333ZM7.33333 7.33333V11.3333H8.66667V7.33333H7.33333Z" fill="currentColor"/>
  </svg>
);

export const FileUploadModal = ({
  isOpen,
  onClose,
  onFileSelect,
  onSave,
  acceptedFormats = ['.xlsx', '.xls', '.csv']
}: FileUploadModalProps) => {
  const { t } = useTranslation();
  const { isSidebarCollapsed } = useAppStore();
  const sidebarWidth = isSidebarCollapsed ? 72 : 280;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      onFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    // TODO: Implement template download
    console.log('Download template clicked');
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsDragging(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      contentLabel={t('fileUpload.modalTitle')}
      className="relative bg-white rounded-3xl shadow-2xl w-[37.5rem] max-h-[90vh] overflow-y-auto outline-none"
      overlayClassName="fixed top-0 right-0 bottom-0 bg-white/70 backdrop-blur-[0.125rem] z-50 flex items-center justify-center"
      overlayElement={(props, contentElement) => (
        <div {...props} style={{ ...props.style, left: `${sidebarWidth}px` }}>
          {contentElement}
        </div>
      )}
      ariaHideApp={false}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-300">
        <h2 className="text-[1.25rem] font-medium text-gray-1000">{t('fileUpload.modalTitle')}</h2>
        <button
          onClick={handleClose}
          className="w-9 h-9 bg-black/8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Upload Drop Zone */}
        <div
          onClick={handleBrowseClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 px-7 py-8 h-[20rem] bg-white border rounded-lg cursor-pointer transition-colors ${
            selectedFile
              ? 'border-blue-400'
              : isDragging
                ? 'border-primary bg-blue-50'
                : 'border-gray-300'
          }`}
        >
          {!selectedFile ? (
            <>
              {/* Upload Icon */}
              <div className="text-gray-400">
                <UploadIcon />
              </div>

              {/* Primary Text */}
              <p className="text-h3 text-gray-1000 text-center">
                {t('fileUpload.dragDropText')}
              </p>

              {/* Secondary Text */}
              <p className="text-body-s text-gray-600 text-center">
                {t('fileUpload.bulkUploadHint')}
              </p>

              {/* File Format Badges */}
              <div className="flex gap-1.5 mt-2">
                <div className="bg-white border border-gray-300 rounded-full px-2 h-5 flex items-center">
                  <span className="font-mono text-[0.75rem] text-gray-600">.xlsx</span>
                </div>
                <div className="bg-white border border-gray-300 rounded-full px-2 h-5 flex items-center">
                  <span className="font-mono text-[0.75rem] text-gray-600">.xls</span>
                </div>
                <div className="bg-white border border-gray-300 rounded-full px-2 h-5 flex items-center">
                  <span className="font-mono text-[0.75rem] text-gray-600">.csv</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* File Icon */}
              <img
                src={xlsxIcon}
                alt="Excel file"
                className="w-12 h-12"
              />

              {/* Filename */}
              <p className="text-h3 text-gray-1000 text-center max-w-[25rem] truncate px-4">
                {selectedFile.name}
              </p>

              {/* File Format Badges */}
              <div className="flex gap-1.5 mt-2">
                <div className="bg-white border border-gray-300 rounded-full px-2 h-5 flex items-center">
                  <span className="font-mono text-[0.75rem] text-gray-600">.xlsx</span>
                </div>
                <div className="bg-white border border-gray-300 rounded-full px-2 h-5 flex items-center">
                  <span className="font-mono text-[0.75rem] text-gray-600">.xls</span>
                </div>
                <div className="bg-white border border-gray-300 rounded-full px-2 h-5 flex items-center">
                  <span className="font-mono text-[0.75rem] text-gray-600">.csv</span>
                </div>
              </div>
            </>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Download Template Button */}
        <button
          onClick={handleDownloadTemplate}
          className="w-full h-9 mt-4 bg-blue-100 rounded flex items-center justify-center gap-2 text-label-m text-blue-600 hover:bg-blue-200 transition-colors"
        >
          <DownloadIcon />
          <span>{t('fileUpload.downloadTemplate')}</span>
        </button>

        {/* Upload Instructions */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-400">
              <InfoIcon />
            </span>
            <h3 className="text-label-m-strong text-gray-1000">
              {t('fileUpload.cautionTitle')}
            </h3>
          </div>

          {/* List */}
          <ol className="space-y-2 pl-6">
            <li className="text-body-m text-gray-600 list-decimal">
              {t('fileUpload.caution1')}
            </li>
            <li className="text-body-m text-gray-600 list-decimal">
              {t('fileUpload.caution2')}
            </li>
            <li className="text-body-m text-gray-600 list-decimal">
              {t('fileUpload.caution3')}
            </li>
          </ol>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-6 py-3 border-t border-gray-300">
        <button
          onClick={handleClose}
          className="flex-1 h-10 bg-white border border-gray-300 rounded-1.5 text-[1rem] font-medium text-gray-800 hover:bg-gray-50 transition-colors"
        >
          {t('fileUpload.cancelButton')}
        </button>
        <button
          disabled={!selectedFile}
          onClick={() => {
            if (onSave) {
              onSave();
            } else {
              handleClose();
            }
          }}
          className={`flex-1 h-10 rounded-1.5 text-[1rem] font-medium text-white transition-colors ${
            selectedFile
              ? 'bg-primary hover:bg-blue-600'
              : 'bg-blue-300 cursor-not-allowed'
          }`}
        >
          {t('fileUpload.submitButton')}
        </button>
      </div>
    </Modal>
  );
};
