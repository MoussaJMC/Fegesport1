import React, { useState } from 'react';
import FileManager from '../../components/admin/FileManager';
import FileUploadDiagnostic from '../../components/admin/FileUploadDiagnostic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Database, AlertTriangle } from 'lucide-react';

const FilesAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('files');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestionnaire de Fichiers</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
              activeTab === 'diagnostic' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle size={16} className="mr-1.5" />
            Diagnostic
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="flex items-center justify-center">
            <Database className="w-4 h-4 mr-2" />
            Fichiers
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Diagnostic
          </TabsTrigger>
        </TabsList>
        <TabsContent value="files">
          <FileManager />
        </TabsContent>
        <TabsContent value="diagnostic">
          <FileUploadDiagnostic />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FilesAdminPage;