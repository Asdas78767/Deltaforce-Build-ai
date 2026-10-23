import React, { useState } from 'react';
import { X, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { ModdingLoadout } from '../utils/gunsmithLogic';

interface CodeDecoderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDecoded: (loadout: ModdingLoadout, source: string) => void;
  sampleCodes: { label: string; code: string }[];
}

export const CodeDecoderModal: React.FC<CodeDecoderModalProps> = ({
  isOpen,
  onClose,
  onLoadDecoded,
  sampleCodes,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDecodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!inputCode.trim()) {
      setErrorMsg('분석할 델타포스 총기 공유 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/bridge/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareCode: inputCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setErrorMsg(data.error || '공유 코드 해독에 실패했습니다. 형식을 확인해주세요.');
        setIsLoading(false);
        return;
      }
      onLoadDecoded(data.loadout, data.source);
      setInputCode('');
      setIsLoading(false);
      onClose();
    } catch {
      setErrorMsg('서버 통신 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decoder-modal-title"
    >
      <div className="w-full max-w-xl bg-[#1E293B] border border-slate-700 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 id="decoder-modal-title" className="text-lg font-bold text-slate-100">
              공유 코드 역설계 및 작업대 불러오기
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              기존 공유 코드를 입력하면 장착 파츠와 세부 보정치를 복원하여 AI 재모딩을 진행할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="코드 분석 창 닫기"
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDecodeSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="share-code-input" className="block text-xs font-semibold text-slate-300 mb-2">
              델타포스 공식 공유 코드 입력
            </label>
            <input
              id="share-code-input"
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="예: M4A1 돌격소총-전면전-611111211386D3A5"
              className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-700 rounded-lg text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {errorMsg && (
            <div role="alert" className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {sampleCodes.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">빠른 테스트용 서버 등록 코드 선택:</p>
              <div className="space-y-1.5">
                {sampleCodes.slice(0, 3).map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setInputCode(item.code);
                      setErrorMsg(null);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs bg-[#0F172A] hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                  >
                    <span className="text-slate-300 font-medium truncate mr-3">{item.label}</span>
                    <span className="font-mono tabular-nums text-amber-400 shrink-0">{item.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isLoading ? '코드 해독 중...' : '코드 해독 후 작업대로 불러오기'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
