'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';
import { logger } from '@/lib/logger';

interface TwoFASetupStep {
  step: 'start' | 'qr' | 'verify' | 'backup';
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

export default function TwoFactorAuthPage(): React.ReactNode {
  const router = useRouter();
  const [setupStep, setSetupStep] = useState<TwoFASetupStep>({ step: 'start' });
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  const handleEnableTwoFA = async (): Promise<void> => {
    setLoading(true);
    try {
      logger.debug('Requesting 2FA setup');
      const response = await authAPI.request('/auth/2fa/setup', 'POST', {});
      const data = response?.data;
      setSetupStep({
        step: 'qr',
        secret: data?.secret,
        qrCode: data?.qrCode,
      });
      
      toast.success('Code QR généré');
    } catch (error) {
      logger.error('Failed to enable 2FA', error as Error);
      toast.error('Erreur lors de la configuration de 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (): Promise<void> => {
    if (!verificationCode.trim()) {
      toast.error('Veuillez entrer le code de vérification');
      return;
    }

    setLoading(true);
    try {
      logger.debug('Verifying 2FA code');
      const response = await authAPI.request('/auth/2fa/verify', 'POST', {
        code: verificationCode,
        secret: setupStep.secret,
      });
      const data = response?.data;

      setSetupStep({
        step: 'backup',
        backupCodes: data?.backupCodes,
      });
      setEnabled(true);
      
      toast.success('Authentification 2FA activée');
    } catch (error) {
      logger.error('2FA verification failed', error as Error);
      toast.error('Code invalide. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string): void => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleComplete = (): void => {
    logger.info('2FA setup completed');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Authentification 2FA</h1>
          <p className="text-gray-600 mt-2">Sécurisez votre compte</p>
        </div>

        {/* Step Indicator */}
        {setupStep.step !== 'start' && (
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              {['QR', 'Vérifier', 'Codes'].map((label, idx) => (
                <div
                  key={label}
                  className={`text-xs font-medium ${
                    (idx === 0 && setupStep.step !== 'start') ||
                    (idx === 1 && (setupStep.step === 'verify' || setupStep.step === 'backup')) ||
                    (idx === 2 && setupStep.step === 'backup')
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{
                  width:
                    setupStep.step === 'qr'
                      ? '33%'
                      : setupStep.step === 'verify'
                        ? '66%'
                        : '100%',
                }}
              />
            </div>
          </div>
        )}

        {/* Start Step */}
        {setupStep.step === 'start' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                L'authentification à deux facteurs ajoute une couche supplémentaire de sécurité à votre compte. Vous devrez entrer un code depuis votre téléphone en plus de votre mot de passe.
              </p>
            </div>
            <button
              onClick={handleEnableTwoFA}
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  Préparation...
                </>
              ) : (
                'Commencer la configuration'
              )}
            </button>
          </motion.div>
        )}

        {/* QR Step */}
        {setupStep.step === 'qr' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-600">
              Scannez ce code QR avec votre application authenticateur (Google Authenticator, Authy, Microsoft Authenticator, etc.)
            </p>
            {setupStep.qrCode && (
              <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
                <img
                  src={setupStep.qrCode}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            )}
            {setupStep.secret && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Clé manuelle:</p>
                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                  <code className="text-sm font-mono text-gray-900">
                    {setupStep.secret}
                  </code>
                  <button
                    onClick={() => handleCopyCode(setupStep.secret!)}
                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedCode === setupStep.secret ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => setSetupStep({ ...setupStep, step: 'verify' })}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Continuer
            </button>
          </motion.div>
        )}

        {/* Verify Step */}
        {setupStep.step === 'verify' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-600">
              Entrez le code à 6 chiffres de votre application authenticateur
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Vérifier'
              )}
            </button>
          </motion.div>
        )}

        {/* Backup Codes Step */}
        {setupStep.step === 'backup' && setupStep.backupCodes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-900 mb-2">Codes de secours</p>
              <p className="text-sm text-yellow-800">
                Sauvegardez ces codes en sécurité. Vous pouvez les utiliser pour accéder à votre compte si vous perdez accès à votre appareil.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              {setupStep.backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                >
                  <code className="text-sm font-mono text-gray-900">{code}</code>
                  <button
                    onClick={() => handleCopyCode(code)}
                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedCode === code ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleComplete}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Terminé
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
