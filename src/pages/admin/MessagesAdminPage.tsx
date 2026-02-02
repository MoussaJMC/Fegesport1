import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Mail, Eye, Archive, Trash2, Search, Filter, Reply, MailSearch as MarkEmailRead } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  updated_at: string;
}

const MessagesAdminPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Utility function to escape HTML and prevent XSS
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\//g, '&#x2F;');
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Message supprimé avec succès');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Message marqué comme lu');
      fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const markAsReplied = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'replied' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Message marqué comme répondu');
      fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    if (message.status === 'unread') {
      markAsRead(message.id);
    }
  };

  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplySubject(`Re: ${message.subject}`);
    setReplyMessage(`\n\n---\nEn réponse à votre message du ${format(new Date(message.created_at), 'PPP à HH:mm', { locale: fr })}:\n\n${message.message}`);
    setShowReplyModal(true);
  };

  const sendReply = async () => {
    if (!selectedMessage) return;

    try {
      setSendingReply(true);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: selectedMessage.email,
            toName: selectedMessage.name,
            subject: replySubject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                  <h2 style="color: #333; margin-bottom: 20px;">FEGESPORT</h2>
                  <div style="background-color: white; padding: 20px; border-radius: 4px;">
                    ${escapeHtml(replyMessage).replace(/\n/g, '<br>')}
                  </div>
                  <div style="margin-top: 20px; font-size: 12px; color: #666;">
                    <p>Cordialement,<br>L'équipe FEGESPORT</p>
                  </div>
                </div>
              </div>
            `,
            text: replyMessage,
            replyTo: 'noreply@fegesport.org',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Erreur lors de l\'envoi');
      }

      await markAsReplied(selectedMessage.id);

      toast.success('Réponse envoyée avec succès');
      setShowReplyModal(false);
      setReplySubject('');
      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || message.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-green-100 text-green-800';
      case 'replied': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unread': return 'Non lu';
      case 'read': return 'Lu';
      case 'replied': return 'Répondu';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages de Contact</h1>
          <p className="text-gray-600">Gérer les messages reçus via le formulaire de contact</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{messages.filter(m => m.status === 'unread').length}</div>
          <div className="text-sm text-gray-600">Non lus</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{messages.filter(m => m.status === 'read').length}</div>
          <div className="text-sm text-gray-600">Lus</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{messages.filter(m => m.status === 'replied').length}</div>
          <div className="text-sm text-gray-600">Répondus</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="unread">Non lu</option>
            <option value="read">Lu</option>
            <option value="replied">Répondu</option>
          </select>

          <div className="flex items-center text-sm text-gray-500">
            <Filter className="mr-2" size={16} />
            {filteredMessages.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Répondre à {selectedMessage.name}</h2>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplySubject('');
                    setReplyMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={sendingReply}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <div><span className="font-medium">À:</span> {selectedMessage.email}</div>
                  <div><span className="font-medium">Message original:</span> {selectedMessage.subject}</div>
                </div>

                <div>
                  <label htmlFor="reply-subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    id="reply-subject"
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    disabled={sendingReply}
                  />
                </div>

                <div>
                  <label htmlFor="reply-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="reply-message"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Écrivez votre réponse ici..."
                    disabled={sendingReply}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={sendReply}
                    disabled={sendingReply || !replySubject.trim() || !replyMessage.trim()}
                    className="btn bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingReply ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Reply className="w-4 h-4 mr-2" />
                        Envoyer la réponse
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplySubject('');
                      setReplyMessage('');
                    }}
                    disabled={sendingReply}
                    className="btn bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">De:</span> {selectedMessage.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedMessage.email}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {format(new Date(selectedMessage.created_at), 'PPP à HH:mm', { locale: fr })}
                    </div>
                    <div>
                      <span className="font-medium">Statut:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedMessage.status)}`}>
                        {getStatusLabel(selectedMessage.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Message:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      handleReply(selectedMessage);
                    }}
                    className="btn bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Répondre
                  </button>
                  
                  {selectedMessage.status !== 'read' && (
                    <button
                      onClick={() => markAsRead(selectedMessage.id)}
                      className="btn bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MarkEmailRead className="w-4 h-4 mr-2" />
                      Marquer comme lu
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      deleteMessage(selectedMessage.id);
                      setShowMessageModal(false);
                    }}
                    className="btn bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expéditeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sujet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMessages.map((message, index) => (
                <motion.tr
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`${message.status === 'unread' ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer`}
                  onClick={() => handleViewMessage(message)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {message.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {message.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {message.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {message.subject}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {message.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(message.created_at), 'PPP', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(message.status)}`}>
                      {getStatusLabel(message.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMessage(message);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="Voir le message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(message);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Répondre"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus 
                ? 'Aucun message ne correspond à vos critères de recherche.'
                : 'Aucun message de contact reçu pour le moment.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesAdminPage;