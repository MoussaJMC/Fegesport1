/**
 * FICHIER TEMPORAIRE - À SUPPRIMER APRÈS UTILISATION
 *
 * Ce composant permet de réinitialiser le mot de passe admin via l'interface
 * Accès : /admin/reset-password-helper
 *
 * IMPORTANT : Supprimez ce fichier après avoir réinitialisé le mot de passe !
 */

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

const PasswordResetHelper: React.FC = () => {
  const [email, setEmail] = useState('admin@fegesport.org');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Email de réinitialisation envoyé avec succès !');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Avertissement de sécurité */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Page temporaire de réinitialisation
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Cette page est uniquement pour réinitialiser le mot de passe admin.</p>
                <p className="font-bold mt-2">⚠️ Supprimez ce fichier après utilisation !</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Réinitialisation du mot de passe admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Un email de réinitialisation sera envoyé à l'adresse admin
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email administrateur
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Nouveaux critères de mot de passe :
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ Minimum 12 caractères</li>
                <li>✓ Au moins une majuscule (A-Z)</li>
                <li>✓ Au moins une minuscule (a-z)</li>
                <li>✓ Au moins un chiffre (0-9)</li>
                <li>✓ Au moins un caractère spécial (!@#$%^&*)</li>
              </ul>
              <p className="mt-2 text-xs text-blue-700">
                Exemples : <code>AdminFegesport2026!</code>, <code>Fegesport@Admin2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Envoi en cours...
                </div>
              ) : (
                'Envoyer l\'email de réinitialisation'
              )}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-md p-6">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-green-900 text-center mb-2">
              Email envoyé avec succès !
            </h3>
            <p className="text-sm text-green-700 text-center mb-4">
              Vérifiez votre boîte email <strong>{email}</strong>
            </p>
            <div className="bg-white border border-green-300 rounded p-4 text-sm text-gray-700">
              <p className="font-medium mb-2">Prochaines étapes :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Ouvrez l'email de réinitialisation</li>
                <li>Cliquez sur le lien de réinitialisation</li>
                <li>Créez un nouveau mot de passe respectant les critères</li>
                <li>Connectez-vous avec votre nouveau mot de passe</li>
              </ol>
            </div>
            <div className="mt-4 text-center">
              <a
                href="/admin/login"
                className="text-sm text-red-600 hover:text-red-500"
              >
                Retour à la page de connexion
              </a>
            </div>
          </div>
        )}

        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>IMPORTANT :</strong> Après avoir réinitialisé votre mot de passe,
                supprimez ce fichier pour des raisons de sécurité :
              </p>
              <code className="block mt-2 text-xs bg-red-100 p-2 rounded">
                src/pages/admin/PasswordResetHelper.tsx
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetHelper;
