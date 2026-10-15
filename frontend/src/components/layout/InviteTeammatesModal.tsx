import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { Mail, Check, School } from 'lucide-react';

export interface InviteTeammatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteTeammatesModal: React.FC<InviteTeammatesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Co-teacher');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast({
        title: 'Please enter a valid school email address',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        title: 'Invitation sent',
        message: `An invitation to join Lincoln Middle School was sent to ${email}`,
        type: 'success',
      });
      setEmail('');
      onClose();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite teammates"
      subtitle="Collaborate on automations with teachers and department staff"
      maxWidth="md"
    >
      <form onSubmit={handleInvite} className="space-y-4 pt-2">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-forest-50/60 border border-forest-200/60 text-xs text-forest-900">
          <School className="w-4 h-4 text-forest-700 shrink-0" aria-hidden="true" />
          <span>Workspace: <strong>Lincoln Middle School</strong></span>
        </div>

        <div>
          <label htmlFor="invite-email" className="block text-xs font-semibold text-stone-700 mb-1.5">
            Colleague's email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. j.smith@lincolnms.edu"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="invite-role" className="block text-xs font-semibold text-stone-700 mb-1.5">
            Team role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
          >
            <option value="Co-teacher">Co-teacher (Can view & review drafts)</option>
            <option value="Grade lead">Grade Lead (Can create & publish automations)</option>
            <option value="Department chair">Department Chair (Full management)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            icon={<Check className="w-4 h-4" />}
          >
            Send invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
