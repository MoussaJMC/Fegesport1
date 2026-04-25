import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Pause } from 'lucide-react';

type StatusVariant =
  | 'active' | 'inactive' | 'pending' | 'draft' | 'published'
  | 'success' | 'error' | 'warning' | 'info'
  | 'completed' | 'cancelled' | 'upcoming' | 'live';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'xs' | 'sm';
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; icon?: React.ReactNode; defaultLabel: string }> = {
  active: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={11} />, defaultLabel: 'Actif' },
  inactive: { color: 'bg-dark-700 text-light-400 border-dark-700', icon: <Pause size={11} />, defaultLabel: 'Inactif' },
  pending: { color: 'bg-fed-gold-500/15 text-fed-gold-500 border-fed-gold-500/30', icon: <Clock size={11} />, defaultLabel: 'En attente' },
  draft: { color: 'bg-dark-700 text-light-400 border-dark-700', defaultLabel: 'Brouillon' },
  published: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={11} />, defaultLabel: 'Publie' },
  success: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={11} />, defaultLabel: 'Succes' },
  error: { color: 'bg-fed-red-500/15 text-fed-red-400 border-fed-red-500/30', icon: <XCircle size={11} />, defaultLabel: 'Erreur' },
  warning: { color: 'bg-fed-gold-500/15 text-fed-gold-500 border-fed-gold-500/30', icon: <AlertTriangle size={11} />, defaultLabel: 'Attention' },
  info: { color: 'bg-accent-blue-500/15 text-accent-blue-400 border-accent-blue-500/30', defaultLabel: 'Info' },
  completed: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={11} />, defaultLabel: 'Termine' },
  cancelled: { color: 'bg-fed-red-500/15 text-fed-red-400 border-fed-red-500/30', icon: <XCircle size={11} />, defaultLabel: 'Annule' },
  upcoming: { color: 'bg-accent-blue-500/15 text-accent-blue-400 border-accent-blue-500/30', icon: <Clock size={11} />, defaultLabel: 'A venir' },
  live: { color: 'bg-fed-red-500/15 text-fed-red-400 border-fed-red-500/30', defaultLabel: 'EN DIRECT' },
  ongoing: { color: 'bg-fed-red-500/15 text-fed-red-400 border-fed-red-500/30', icon: <CheckCircle size={11} />, defaultLabel: 'En cours' },
  suspended: { color: 'bg-fed-red-500/15 text-fed-red-400 border-fed-red-500/30', defaultLabel: 'Suspendu' },
  expired: { color: 'bg-dark-700 text-light-400 border-dark-700', defaultLabel: 'Expire' },
  unread: { color: 'bg-accent-blue-500/15 text-accent-blue-400 border-accent-blue-500/30', defaultLabel: 'Non lu' },
  read: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={11} />, defaultLabel: 'Lu' },
  replied: { color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', defaultLabel: 'Repondu' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm', showIcon = true }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] || {
    color: 'bg-dark-700 text-light-300 border-dark-700',
    defaultLabel: status,
  };

  const sizeClasses = size === 'xs'
    ? 'px-1.5 py-0.5 text-[10px] gap-1'
    : 'px-2 py-0.5 text-xs gap-1';

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold uppercase tracking-wider border ${config.color}`}>
      {showIcon && config.icon}
      {label || config.defaultLabel}
    </span>
  );
};

export default StatusBadge;
