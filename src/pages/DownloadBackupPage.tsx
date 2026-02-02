import { Download, FileArchive, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DownloadBackupPage() {
  const handleDownload = () => {
    // Créer un lien de téléchargement vers le fichier dans public
    const link = document.createElement('a');
    link.href = '/fegesport-backup.tar.gz';
    link.download = 'fegesport-backup.tar.gz';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-full p-6">
            <FileArchive className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Sauvegarde FEGESPORT
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Archive complète du site avec toutes les corrections de sécurité
        </p>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date de création</p>
              <p className="text-lg font-semibold text-gray-900">2 février 2026</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taille du fichier</p>
              <p className="text-lg font-semibold text-gray-900">327 KB</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fichiers inclus</p>
              <p className="text-lg font-semibold text-gray-900">264 fichiers</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Format</p>
              <p className="text-lg font-semibold text-gray-900">.tar.gz</p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <Download className="w-6 h-6" />
          Télécharger la Sauvegarde
        </button>

        {/* Features List */}
        <div className="mt-8 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-4">Contenu inclus :</h3>
          {[
            'Code source complet (TypeScript/React)',
            '87 migrations Supabase',
            'Edge Functions',
            'Configuration complète',
            '43 corrections de sécurité appliquées',
            'Documentation incluse'
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 mb-1">Attention</p>
              <p className="text-sm text-yellow-800">
                Cette archive contient des informations sensibles (clés API).
                Stockez-la dans un lieu sécurisé et ne la partagez pas publiquement.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions pour Mac */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-blue-900 mb-2">📦 Pour extraire sur Mac :</h4>
          <div className="bg-blue-900 text-blue-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
            <code>cd ~/Downloads</code><br />
            <code>tar -xzf fegesport-backup.tar.gz</code><br />
            <code>cd project</code>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Ou double-cliquez simplement sur le fichier dans le Finder
          </p>
        </div>
      </div>
    </div>
  );
}
