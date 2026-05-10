'use client';

import { useState, useRef } from 'react';
import { Lock, Upload, Shield, Key, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

type Stage = 'idle' | 'encrypting' | 'encrypted' | 'decrypting' | 'decrypted';

interface CryptoResult {
  encryptedBase64: string;
  ivBase64: string;
  encryptTime: number;
  decryptTime: number;
  fileSizeBytes: number;
  algorithm: string;
  keyLength: number;
}

const DEMO_FILE_CONTENT = `ArtistShield Demo Track
Title: Midnight Sessions
Artist: Alex Rivera
Album: Unreleased EP – 2026
Duration: 3:47
BPM: 128
Key: A minor
Royalty Split: Artist 70% / Label 30%
Distribution: Exclusive – DO NOT SHARE
File Hash (SHA-256): a3f5c9d2e1b4...
This file is protected under international copyright law.`;

async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

function makeArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

async function encryptData(key: CryptoKey, data: Uint8Array): Promise<{ ciphertext: ArrayBuffer; iv: ArrayBuffer }> {
  const ivBytes = crypto.getRandomValues(new Uint8Array(12));
  const iv = makeArrayBuffer(ivBytes);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, makeArrayBuffer(data));
  return { ciphertext, iv };
}

async function decryptData(key: CryptoKey, ciphertext: ArrayBuffer, iv: ArrayBuffer): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
}

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function EncryptionPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<CryptoResult | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>(DEMO_FILE_CONTENT);
  const [fileName, setFileName] = useState<string>('midnight_sessions_metadata.txt');
  const keyRef = useRef<CryptoKey | null>(null);
  const ciphertextRef = useRef<ArrayBuffer | null>(null);
  const ivRef = useRef<ArrayBuffer | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      setSelectedFile(ev.target?.result as string);
      setStage('idle');
      setResult(null);
      setDecryptedText(null);
    };
    reader.readAsText(file);
  };

  const handleEncrypt = async () => {
    setError(null);
    setStage('encrypting');
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(selectedFile);
      const key = await generateKey();
      keyRef.current = key;

      const t0 = performance.now();
      const { ciphertext, iv } = await encryptData(key, data);
      const encryptTime = performance.now() - t0;

      ciphertextRef.current = ciphertext;
      ivRef.current = iv;

      setResult({
        encryptedBase64: toBase64(ciphertext).slice(0, 120) + '...',
        ivBase64: toBase64(iv),
        encryptTime: Math.round(encryptTime * 100) / 100,
        decryptTime: 0,
        fileSizeBytes: data.length,
        algorithm: 'AES-256-GCM',
        keyLength: 256,
      });
      setStage('encrypted');
    } catch (err) {
      setError('Encryption failed: ' + String(err));
      setStage('idle');
    }
  };

  const handleDecrypt = async () => {
    if (!keyRef.current || !ciphertextRef.current || !ivRef.current) return;
    setStage('decrypting');
    setError(null);
    try {
      const t0 = performance.now();
      const decrypted = await decryptData(keyRef.current, ciphertextRef.current, ivRef.current);
      const decryptTime = performance.now() - t0;

      const decoder = new TextDecoder();
      const text = decoder.decode(decrypted);
      setDecryptedText(text);
      setResult(prev => prev ? { ...prev, decryptTime: Math.round(decryptTime * 100) / 100 } : null);
      setStage('decrypted');
    } catch (err) {
      setError('Decryption failed: ' + String(err));
      setStage('encrypted');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setResult(null);
    setDecryptedText(null);
    setError(null);
    keyRef.current = null;
    ciphertextRef.current = null;
    ivRef.current = null;
    setSelectedFile(DEMO_FILE_CONTENT);
    setFileName('midnight_sessions_metadata.txt');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Encryption Demo</h1>
        <p className="text-slate-400 text-sm mt-1">
          AES-256-GCM encryption using the browser&apos;s Web Crypto API. Demonstrates file-level protection for music assets.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Algorithm', value: 'AES-256-GCM', icon: <Lock className="w-4 h-4" />, color: 'text-cyan-400' },
          { label: 'Key Length', value: '256 bits', icon: <Key className="w-4 h-4" />, color: 'text-violet-400' },
          { label: 'IV Size', value: '96 bits', icon: <Shield className="w-4 h-4" />, color: 'text-emerald-400' },
          { label: 'Auth Tag', value: '128 bits', icon: <CheckCircle className="w-4 h-4" />, color: 'text-amber-400' },
        ].map(item => (
          <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`${item.color} mb-2`}>{item.icon}</div>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input / file selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-400" />
            <h3 className="text-slate-100 font-medium text-sm">Source File</h3>
          </div>

          <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center">
            <p className="text-slate-500 text-xs mb-2">Upload a file or use the demo data below</p>
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs inline-block transition-colors">
              Choose File
              <input type="file" className="hidden" onChange={handleFileChange} accept=".txt,.json,.csv,.md" />
            </label>
            <p className="text-slate-600 text-xs mt-2">{fileName}</p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <p className="text-slate-500 text-xs uppercase tracking-wider">File Contents</p>
              <p className="text-slate-600 text-xs">{formatBytes(new TextEncoder().encode(selectedFile).length)}</p>
            </div>
            <pre className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-400 text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap leading-relaxed">
              {selectedFile}
            </pre>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {stage === 'idle' && (
              <button
                onClick={handleEncrypt}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg py-2.5 text-sm transition-colors"
              >
                <Lock className="w-4 h-4" />
                Encrypt File
              </button>
            )}
            {stage === 'encrypting' && (
              <button disabled className="flex-1 flex items-center justify-center gap-2 bg-cyan-500/50 text-slate-900 rounded-lg py-2.5 text-sm cursor-not-allowed">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Encrypting...
              </button>
            )}
            {(stage === 'encrypted' || stage === 'decrypting') && (
              <>
                <button
                  onClick={handleDecrypt}
                  disabled={stage === 'decrypting'}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-semibold rounded-lg py-2.5 text-sm transition-colors"
                >
                  {stage === 'decrypting' ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Decrypt File
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-lg text-sm transition-colors"
                >
                  Reset
                </button>
              </>
            )}
            {stage === 'decrypted' && (
              <button
                onClick={handleReset}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-lg py-2.5 text-sm transition-colors"
              >
                Run Again
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          {/* Encrypted output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-slate-100 font-medium text-sm">Encrypted Output</h3>
              {(stage === 'encrypted' || stage === 'decrypted') && (
                <span className="ml-auto bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-2 py-0.5 rounded-full">AES-256-GCM</span>
              )}
            </div>
            {result ? (
              <pre className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-cyan-400/80 text-xs font-mono overflow-auto max-h-24 break-all">
                {result.encryptedBase64}
              </pre>
            ) : (
              <div className="bg-slate-800 border border-dashed border-slate-700 rounded-lg p-6 text-center">
                <p className="text-slate-600 text-xs">Encrypted ciphertext will appear here</p>
              </div>
            )}
            {result && (
              <div className="mt-2 text-xs text-slate-600">
                <span className="text-slate-500">IV: </span>{result.ivBase64}
              </div>
            )}
          </div>

          {/* Decrypted output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="text-slate-100 font-medium text-sm">Decrypted Output</h3>
              {stage === 'decrypted' && (
                <span className="ml-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>
            {decryptedText ? (
              <pre className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-emerald-400/80 text-xs font-mono overflow-auto max-h-36 whitespace-pre-wrap">
                {decryptedText}
              </pre>
            ) : (
              <div className="bg-slate-800 border border-dashed border-slate-700 rounded-lg p-6 text-center">
                <p className="text-slate-600 text-xs">Decrypted plaintext will appear here</p>
              </div>
            )}
          </div>

          {/* Performance metrics */}
          {result && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-violet-400" />
                <h3 className="text-slate-100 font-medium text-sm">Performance Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Encrypt Time', value: `${result.encryptTime} ms`, color: 'text-cyan-400' },
                  { label: 'Decrypt Time', value: result.decryptTime > 0 ? `${result.decryptTime} ms` : '—', color: 'text-emerald-400' },
                  { label: 'File Size', value: formatBytes(result.fileSizeBytes), color: 'text-slate-300' },
                  { label: 'Algorithm', value: result.algorithm, color: 'text-violet-400' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-800 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">{m.label}</p>
                    <p className={`font-bold text-sm ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explainer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-slate-100 font-medium text-sm mb-3">How AES-256-GCM Protects Artist Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Lock className="w-4 h-4 text-cyan-400" />, title: 'Confidentiality', desc: 'AES-256 encryption ensures that even if files are intercepted or leaked, the content is unreadable without the key.' },
            { icon: <Shield className="w-4 h-4 text-violet-400" />, title: 'Integrity', desc: 'GCM mode provides authenticated encryption — any tampering with the ciphertext is detected during decryption.' },
            { icon: <Key className="w-4 h-4 text-emerald-400" />, title: 'Key Management', desc: 'Keys are generated per-session and stored securely. Rotating keys limits the blast radius if a key is compromised.' },
          ].map(item => (
            <div key={item.title} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <p className="text-slate-300 text-sm font-medium">{item.title}</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
