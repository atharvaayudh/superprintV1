import React, { useState, useRef } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Customer } from '../types';

interface BulkCustomerUploadProps {
  onUpload: (customers: Customer[]) => void;
  onClose: () => void;
}

export const BulkCustomerUpload: React.FC<BulkCustomerUploadProps> = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadResults, setUploadResults] = useState<{ success: number; errors: string[] }>({ success: 0, errors: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setUploadResults({ success: 0, errors: ['Please upload a CSV file'] });
      return;
    }

    setUploadStatus('processing');
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const requiredHeaders = ['name', 'email', 'phone', 'company', 'address', 'city', 'state', 'zipcode'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setUploadStatus('error');
        setUploadResults({ 
          success: 0, 
          errors: [`Missing required columns: ${missingHeaders.join(', ')}`] 
        });
        return;
      }

      const customers: Customer[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Invalid number of columns`);
          continue;
        }

        const customer: Customer = {
          id: Math.random().toString(36).substr(2, 9),
          name: values[headers.indexOf('name')] || '',
          email: values[headers.indexOf('email')] || '',
          phone: values[headers.indexOf('phone')] || '',
          company: values[headers.indexOf('company')] || '',
          address: values[headers.indexOf('address')] || '',
          city: values[headers.indexOf('city')] || '',
          state: values[headers.indexOf('state')] || '',
          zipCode: values[headers.indexOf('zipcode')] || ''
        };

        // Validate required fields
        if (!customer.name || !customer.email || !customer.company) {
          errors.push(`Row ${i + 1}: Missing required fields (name, email, or company)`);
          continue;
        }

        customers.push(customer);
      }

      setUploadResults({ success: customers.length, errors });
      setUploadStatus(customers.length > 0 ? 'success' : 'error');
      
      if (customers.length > 0) {
        onUpload(customers);
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadResults({ success: 0, errors: ['Failed to parse CSV file'] });
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'name,email,phone,company,address,city,state,zipcode\n' +
                      'John Doe,john@example.com,(555) 123-4567,Example Corp,123 Main St,Anytown,CA,12345\n' +
                      'Jane Smith,jane@company.com,(555) 987-6543,Company Inc,456 Oak Ave,Somewhere,NY,67890';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Customer Upload</h2>
            <p className="text-gray-600">Upload multiple customers from CSV file</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Download Template</h3>
                <p className="text-sm text-blue-700">Get the CSV template with required columns</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Template
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : uploadStatus === 'error'
                ? 'border-red-300 bg-red-50'
                : uploadStatus === 'success'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            
            {uploadStatus === 'processing' ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">Processing CSV file...</p>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <p className="text-green-800 font-medium">Upload Successful!</p>
                  <p className="text-green-600">{uploadResults.success} customers imported</p>
                  {uploadResults.errors.length > 0 && (
                    <p className="text-orange-600 text-sm mt-2">
                      {uploadResults.errors.length} rows had errors
                    </p>
                  )}
                </div>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="space-y-4">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
                <div>
                  <p className="text-red-800 font-medium">Upload Failed</p>
                  <div className="text-red-600 text-sm mt-2 space-y-1">
                    {uploadResults.errors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your CSV file here</p>
                  <p className="text-gray-600">or click to browse</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            )}
          </div>

          {/* Error Details */}
          {uploadStatus === 'error' && uploadResults.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-medium text-red-900 mb-2">Error Details:</h4>
              <div className="text-sm text-red-700 space-y-1">
                {uploadResults.errors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            </div>
          )}

          {/* Required Format */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Required CSV Format:</h4>
            <p className="text-sm text-gray-600 mb-2">Your CSV file must include these columns:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <span>• name</span>
              <span>• email</span>
              <span>• phone</span>
              <span>• company</span>
              <span>• address</span>
              <span>• city</span>
              <span>• state</span>
              <span>• zipcode</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {uploadStatus === 'success' ? 'Done' : 'Cancel'}
            </button>
            {uploadStatus === 'success' && (
              <button
                onClick={() => {
                  setUploadStatus('idle');
                  setUploadResults({ success: 0, errors: [] });
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Another File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};