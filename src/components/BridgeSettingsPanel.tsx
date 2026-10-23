import React, { useState } from 'react';
import { Server, Check, RefreshCw, Copy } from 'lucide-react';
import {
  GameMode,
  LoadoutAttachments,
  LoadoutCalibrations,
  serializeToolStationPayload,
} from '../utils/gunsmithLogic';

export interface BridgeConfigState {
  mode: 'OFFICIAL_TOOL_STATION_API' | 'HEADLESS_BOT_ACCOUNT_RELAY';
  toolStationRegion: 'KR_GLOBAL_GARE' | 'CN_WEGAME_STATION';
  botAccountUid: string;
  customRelayEndpoint: string;
  autoRegisterOnAiMod: boolean;
  totalIssuedCount: number;
}

interface BridgeSettingsPanelProps {
  config: BridgeConfigState;
  activeLoadoutState: {
    weaponId: string;
    gameMode: GameMode;
    attachments: LoadoutAttachments;
    calibrations: LoadoutCalibrations;
  };
  onSaveConfig: (updated: Partial<BridgeConfigState>) => Promise<void>;
  onTestIssueCode: () => Promise<void>;
}

export const BridgeSettingsPanel: React.FC<BridgeSettingsPanelProps> = ({
  config,
  activeLoadoutState,
  onSaveConfig,
  onTestIssueCode,
}) => {
  const [mode, setMode] = useState<BridgeConfigState['mode']>(config.mode);
  const [region, setRegion] = useState<BridgeConfigState['toolStationRegion']>(config.toolStationRegion);
  const [botUid, setBotUid] = useState(config.botAccountUid);
  const [endpoint, setEndpoint] = useState(config.customRelayEndpoint);
  const [autoRegister, setAutoRegister] = useState(config.autoRegisterOnAiMod);
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const livePayload = serializeToolStationPayload(activeLoadoutState);
  const payloadJson = JSON.stringify(livePayload, null, 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveConfig({
      mode,
      toolStationRegion: region,
      botAccountUid: botUid,
      customRelayEndpoint: endpoint,
      autoRegisterOnAiMod: autoRegister,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleCopyPayload = () => {
    navigator.clipboard?.writeText(payloadJson);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTestIssueCode();
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Configuration Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-6 bg-[#151A21] border border-slate-800 rounded-lg p-6 space-y-5"
      >
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-100">
            델타포스 공식 툴 스테이션 & 인게임 봇 브릿지 설정
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            AI가 설계한 총기 모딩 조합을 백엔드 서버에서 공식 툴 스테이션 API 또는 인게임 봇 세션으로 호출하여 실시간 공유 코드를 발급하는 파이프라인을 설정합니다.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            코드 발급 연동 아키텍처 선택
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('OFFICIAL_TOOL_STATION_API')}
              className={`p-3.5 text-left rounded-lg border transition-colors ${
                mode === 'OFFICIAL_TOOL_STATION_API'
                  ? 'bg-slate-800/90 border-amber-500 text-slate-100'
                  : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold text-amber-400 mb-1">
                공식 툴 스테이션 API 직결
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                공식 개조 시뮬레이터(Tool Station) 공유 API를 백엔드가 직접 호출해 서버 저장 후 즉시 코드를 반환합니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('HEADLESS_BOT_ACCOUNT_RELAY')}
              className={`p-3.5 text-left rounded-lg border transition-colors ${
                mode === 'HEADLESS_BOT_ACCOUNT_RELAY'
                  ? 'bg-slate-800/90 border-amber-500 text-slate-100'
                  : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold text-sky-400 mb-1">
                인게임 봇 계정 프리셋 릴레이
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                대기 중인 인게임 봇 계정이 AI 조합을 총기 작업대에 적용·저장한 뒤 생성된 공유 코드를 추출합니다.
              </p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="region-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
              대상 서버 권역 (오픈 API 리전)
            </label>
            <select
              id="region-select"
              value={region}
              onChange={(e) => setRegion(e.target.value as BridgeConfigState['toolStationRegion'])}
              className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="KR_GLOBAL_GARE">한국 / 글로벌 공식 서버 (Steam · 런처)</option>
              <option value="CN_WEGAME_STATION">WeGame 공식 툴 스테이션 (CN)</option>
            </select>
          </div>

          <div>
            <label htmlFor="bot-uid-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              인게임 봇 계정 식별자 (UID)
            </label>
            <input
              id="bot-uid-input"
              type="text"
              value={botUid}
              onChange={(e) => setBotUid(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="relay-endpoint-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
            툴 스테이션 / 봇 브릿지 엔드포인트 URL
          </label>
          <input
            id="relay-endpoint-input"
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label htmlFor="auto-register-checkbox" className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              id="auto-register-checkbox"
              type="checkbox"
              checked={autoRegister}
              onChange={(e) => setAutoRegister(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
            />
            <span>AI 모딩 완료 시 자동으로 서버에 조합 저장 및 실시간 코드 발급</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            누적 실시간 코드 발급: {config.totalIssuedCount.toLocaleString()}건
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? '발급 테스트 중...' : '현재 조합으로 코드 즉시 발급 테스트'}</span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {savedNotice ? <Check className="w-3.5 h-3.5" /> : <Server className="w-3.5 h-3.5" />}
              <span>{savedNotice ? '설정 저장 완료' : '브릿지 설정 저장'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Right: Live Tool Station JSON Payload Inspector */}
      <div className="lg:col-span-6 bg-[#151A21] border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              실시간 툴 스테이션 API 직렬화 페이로드
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              현재 작업대의 8개 파츠 ID와 세부 보정(g/mm) 데이터가 백엔드 서버를 통해 전송되는 실제 규격입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyPayload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPayload ? 'JSON 복사됨' : 'JSON 복사'}</span>
          </button>
        </div>

        <pre className="p-4 bg-[#0B1120] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed">
          {payloadJson}
        </pre>
      </div>
    </div>
  );
};
