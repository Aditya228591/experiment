import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { ShieldCheck, Lock, CheckCircle2, Key, Sparkles } from 'lucide-react';
import { IntegrationConfig } from '../../types';
import { saveVaultIntegration, loadUserProfile } from '../../services/storageService';

export interface OAuthConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationConfig | null;
  onSuccess: (updatedIntegration: IntegrationConfig) => void;
}

export const OAuthConnectModal: React.FC<OAuthConnectModalProps> = ({
  isOpen,
  onClose,
  integration,
  onSuccess,
}) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { showToast } = useToast();

  if (!integration) return null;

  const isApiKeyAuth = integration.authMechanism === 'api_key';

  const handleAuthorize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isApiKeyAuth && !apiKeyInput.trim()) {
      showToast({
        title: 'API Key required',
        message: 'Please enter your access key or token to connect.',
        type: 'warning',
      });
      return;
    }

    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      const currentUser = loadUserProfile();
      const updated: IntegrationConfig = {
        ...integration,
        connected: true,
        accountName: isApiKeyAuth
          ? `Token (starts with ...${apiKeyInput.slice(-4) || 'auth'})`
          : currentUser.email || 'teacher@school.edu',
        apiKeyValue: isApiKeyAuth ? apiKeyInput : undefined,
      };

      // Save to Universal Credential Vault so all future automations reuse it!
      saveVaultIntegration(updated);

      onSuccess(updated);
      showToast({
        title: 'App connected & saved to Vault',
        message: `${integration.service} is now connected. Future automations will use this automatically without asking again.`,
        type: 'success',
      });
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Connect ${integration.service}`}
      subtitle="Classflow AI connects via least-privilege permissions and stores credentials in your secure vault"
      maxWidth="md"
    >
      <form onSubmit={handleAuthorize} className="space-y-4 py-2">
        {/* Universal Vault Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-forest-50/70 border border-forest-200/80 text-xs text-forest-900">
          <Sparkles className="w-4 h-4 text-forest-700 shrink-0" />
          <span><strong>One-Time Connection:</strong> Once connected, Classflow reuses this credential across all your automations.</span>
        </div>

        {/* OAuth flow vs API Key flow */}
        {isApiKeyAuth ? (
          <div className="space-y-3">
            <div>
              <label htmlFor="api-key-input" className="block text-xs font-semibold text-stone-700 mb-1">
                {integration.apiKeyLabel || `${integration.service} API Key / Token`}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="api-key-input"
                  type="password"
                  required
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your secret token or API key here..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                />
              </div>
            </div>

            {integration.keyInstructions && (
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {integration.keyInstructions}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Account Selector */}
            <div className="p-3 rounded-xl bg-canvas border border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-forest-700 text-white font-semibold text-xs flex items-center justify-center">
                  {loadUserProfile().avatarInitials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900">{loadUserProfile().name}</p>
                  <p className="text-[11px] text-stone-500">{loadUserProfile().email || 'teacher@school.edu'}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                Verified School ID
              </span>
            </div>

            {/* Permission Scopes Requested */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-700">Requested Read-Only Scopes:</p>
              <div className="space-y-2">
                {integration.requiredScopes.map((scope, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5 text-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                    <div>
                      <code className="font-mono text-[11px] text-stone-800 font-semibold">{scope}</code>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Read-only access to inspect headers, events, or student milestones. Cannot delete or alter any external records.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security & FERPA Statement */}
        <div className="p-3 rounded-xl bg-canvas/80 border border-stone-200/60 flex items-start gap-2.5 text-xs text-stone-700">
          <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <strong>Zero Data Selling:</strong> Credentials are encrypted and used only when your configured automation schedule runs.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isAuthorizing}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isAuthorizing}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isApiKeyAuth ? 'Save token & connect' : 'Allow & connect'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
