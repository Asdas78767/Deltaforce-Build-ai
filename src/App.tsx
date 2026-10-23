import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  AttachmentSlotId,
  GameMode,
  LoadoutAttachments,
  LoadoutCalibrations,
  ModdingLoadout,
  PLAYSTYLE_META,
  PlaystylePreset,
  RECOIL_BEHAVIOR_META,
  RecoilBehaviorPreference,
  SLOT_META,
  WEAPONS,
  buildOptimalLoadout,
  computeLoadoutStats,
  generateOfficialShareCode,
  getAttachmentById,
  getAttachmentsForSlot,
  getWeaponById,
} from './utils/gunsmithLogic';
import { WeaponSchematicSvg } from './components/WeaponSchematicSvg';
import { DetailedAttributesPanel } from './components/DetailedAttributesPanel';
import { CodeDecoderModal } from './components/CodeDecoderModal';
import { BridgeConfigState, BridgeSettingsPanel } from './components/BridgeSettingsPanel';

type WorkspaceSection = 'workbench' | 'attributes' | 'registry' | 'bridge';

export default function App() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('workbench');

  // Active Gunsmith Workbench State
  const [weaponId, setWeaponId] = useState<string>('m4a1');
  const [gameMode, setGameMode] = useState<GameMode>('전면전');
  const [playstyle, setPlaystyle] = useState<PlaystylePreset>('laser_recoil');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // User Modding Target Constraints (가격, 반동 제어, 안정성, 반동 튀는 특성)
  const [maxBudget, setMaxBudget] = useState<number>(420000);
  const [targetControl, setTargetControl] = useState<number>(80);
  const [targetStability, setTargetStability] = useState<number>(75);
  const [recoilBehavior, setRecoilBehavior] = useState<RecoilBehaviorPreference>('laser_cluster');

  // Initial default loadout
  const initialBuild = useMemo(
    () =>
      buildOptimalLoadout({
        weaponId: 'm4a1',
        gameMode: '전면전',
        playstyle: 'laser_recoil',
        targets: {
          maxBudget: 420000,
          targetControl: 80,
          targetStability: 75,
          recoilBehavior: 'laser_cluster',
        },
      }),
    []
  );

  const [attachments, setAttachments] = useState<LoadoutAttachments>(initialBuild.attachments);
  const [calibrations, setCalibrations] = useState<LoadoutCalibrations>(initialBuild.calibrations);
  const [buildTitle, setBuildTitle] = useState<string>(initialBuild.title);
  const [aiReasoning, setAiReasoning] = useState<string>(initialBuild.aiReasoning);
  const [calibrationAdvice, setCalibrationAdvice] = useState<string>(initialBuild.calibrationAdvice);
  const [issuedCode, setIssuedCode] = useState<string>(initialBuild.shareCode);
  const [bridgeTxId, setBridgeTxId] = useState<string>('TS-KR-90841A');
  const [isDirtySinceIssue, setIsDirtySinceIssue] = useState<boolean>(false);

  // Active slot in Gunsmith
  const [activeSlot, setActiveSlot] = useState<AttachmentSlotId>('muzzle');

  // Server Registry & Bridge Config
  const [serverLoadouts, setServerLoadouts] = useState<ModdingLoadout[]>([]);
  const [bridgeConfig, setBridgeConfig] = useState<BridgeConfigState>({
    mode: 'OFFICIAL_TOOL_STATION_API',
    toolStationRegion: 'KR_GLOBAL_GARE',
    botAccountUid: 'DF-BOT-KR-8849201',
    customRelayEndpoint: 'https://toolstation-relay.deltaforce.internal/v2/gunsmith/share',
    autoRegisterOnAiMod: true,
    totalIssuedCount: 142,
  });

  // UI Interaction States
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isReissuingCode, setIsReissuingCode] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDecoderOpen, setIsDecoderOpen] = useState<boolean>(false);

  // Registry Filters
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryModeFilter, setRegistryModeFilter] = useState<'ALL' | GameMode>('ALL');

  const weapon = useMemo(() => getWeaponById(weaponId), [weaponId]);
  const computed = useMemo(
    () => computeLoadoutStats(weaponId, attachments, calibrations),
    [weaponId, attachments, calibrations]
  );

  // Fetch initial server loadouts & bridge config
  useEffect(() => {
    fetch('/api/loadouts')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.loadouts)) {
          setServerLoadouts(data.loadouts);
        }
        if (data.bridgeConfig) {
          setBridgeConfig(data.bridgeConfig);
        }
      })
      .catch(() => {
        // Fallback if offline
      });
  }, []);

  const showTempStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Apply a full ModdingLoadout onto the workbench
  const applyLoadoutToWorkbench = (loadout: ModdingLoadout) => {
    setWeaponId(loadout.weaponId);
    setGameMode(loadout.gameMode);
    setPlaystyle(loadout.playstyle);
    setAttachments({ ...loadout.attachments });
    setCalibrations({ ...loadout.calibrations });
    setBuildTitle(loadout.title);
    setAiReasoning(loadout.aiReasoning);
    setCalibrationAdvice(loadout.calibrationAdvice);
    setIssuedCode(loadout.shareCode);
    setBridgeTxId(loadout.bridgeTxId);
    if (loadout.targets) {
      setMaxBudget(loadout.targets.maxBudget);
      setTargetControl(loadout.targets.targetControl);
      setTargetStability(loadout.targets.targetStability);
      setRecoilBehavior(loadout.targets.recoilBehavior);
    }
    setIsDirtySinceIssue(false);
  };

  // Handle switching weapon in the selector
  const handleSelectWeapon = (newWeaponId: string) => {
    setWeaponId(newWeaponId);
    const autoBuilt = buildOptimalLoadout({
      weaponId: newWeaponId,
      gameMode,
      playstyle,
      customPrompt,
      targets: { maxBudget, targetControl, targetStability, recoilBehavior },
    });
    setAttachments(autoBuilt.attachments);
    setCalibrations(autoBuilt.calibrations);
    setBuildTitle(autoBuilt.title);
    setAiReasoning(autoBuilt.aiReasoning);
    setCalibrationAdvice(autoBuilt.calibrationAdvice);
    setIssuedCode(autoBuilt.shareCode);
    setIsDirtySinceIssue(true);
  };

  // Handle selecting a playstyle preset
  const handleSelectPlaystyle = (newStyle: PlaystylePreset) => {
    setPlaystyle(newStyle);
    const meta = PLAYSTYLE_META[newStyle];
    setGameMode(meta.recommendedMode);
    setMaxBudget(meta.defaultTargets.maxBudget);
    setTargetControl(meta.defaultTargets.targetControl);
    setTargetStability(meta.defaultTargets.targetStability);
    setRecoilBehavior(meta.defaultTargets.recoilBehavior);
  };

  // 1. Trigger AI Gunsmith Modding & Server Share Code Issuance
  const handleRunAiModding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/modding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weaponId,
          gameMode,
          playstyle,
          customPrompt,
          targets: {
            maxBudget,
            targetControl,
            targetStability,
            recoilBehavior,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.loadout) {
        applyLoadoutToWorkbench(data.loadout);
        setServerLoadouts((prev) => [data.loadout, ...prev.filter((i) => i.id !== data.loadout.id)]);
        setBridgeConfig((prev) => ({ ...prev, totalIssuedCount: prev.totalIssuedCount + 1 }));
        showTempStatus(`AI 모딩 완료 및 실시간 공유 코드 발급됨 (${data.loadout.bridgeTxId})`);
      }
    } catch {
      // Local deterministic fallback if network error
      const localBuilt = buildOptimalLoadout({
        weaponId,
        gameMode,
        playstyle,
        customPrompt,
        targets: { maxBudget, targetControl, targetStability, recoilBehavior },
      });
      setAttachments(localBuilt.attachments);
      setCalibrations(localBuilt.calibrations);
      setBuildTitle(localBuilt.title);
      setAiReasoning(localBuilt.aiReasoning);
      setCalibrationAdvice(localBuilt.calibrationAdvice);
      setIssuedCode(localBuilt.shareCode);
      setIsDirtySinceIssue(false);
      showTempStatus('AI 모딩 설계 및 코드 발급이 완료되었습니다.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // 2. Re-issue official share code when user tweaks attachments or calibration sliders
  const handleReissueManualCode = async () => {
    setIsReissuingCode(true);
    try {
      const res = await fetch('/api/bridge/issue-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weaponId,
          gameMode,
          playstyle,
          title: `${weapon.shortName} 커스텀 보정 빌드 (${Math.round(computed.totalCost / 10000)}만 코인)`,
          attachments,
          calibrations,
          aiReasoning,
          calibrationAdvice,
          targets: { maxBudget, targetControl, targetStability, recoilBehavior },
        }),
      });
      const data = await res.json();
      if (res.ok && data.loadout) {
        setIssuedCode(data.loadout.shareCode);
        setBridgeTxId(data.loadout.bridgeTxId);
        setBuildTitle(data.loadout.title);
        setIsDirtySinceIssue(false);
        setServerLoadouts((prev) => [data.loadout, ...prev]);
        setBridgeConfig((prev) => ({ ...prev, totalIssuedCount: prev.totalIssuedCount + 1 }));
        showTempStatus(`변경된 세팅이 서버에 저장되고 새 공유 코드가 발급되었습니다 (${data.loadout.bridgeTxId})`);
      }
    } catch {
      const code = generateOfficialShareCode(weaponId, gameMode, attachments, calibrations);
      setIssuedCode(code);
      setIsDirtySinceIssue(false);
    } finally {
      setIsReissuingCode(false);
    }
  };

  // Handle changing a single attachment in a slot
  const handleAttachmentChange = (slot: AttachmentSlotId, attId: string | null) => {
    const nextAttachments = { ...attachments, [slot]: attId };
    setAttachments(nextAttachments);
    setIssuedCode(generateOfficialShareCode(weaponId, gameMode, nextAttachments, calibrations));
    setIsDirtySinceIssue(true);
  };

  // Handle changing fine calibration sliders
  const handleCalibrationChange = (
    slot: AttachmentSlotId,
    axis: 'weightPct' | 'placementPct',
    val: number
  ) => {
    const currentSlotCal = calibrations[slot] || { weightPct: 0, placementPct: 0 };
    const nextCalibrations: LoadoutCalibrations = {
      ...calibrations,
      [slot]: {
        ...currentSlotCal,
        [axis]: val,
      },
    };
    setCalibrations(nextCalibrations);
    setIssuedCode(generateOfficialShareCode(weaponId, gameMode, attachments, nextCalibrations));
    setIsDirtySinceIssue(true);
  };

  const handleCopyCode = (code: string, idKey: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeId(idKey);
    setTimeout(() => {
      setCopiedCodeId((prev) => (prev === idKey ? null : prev));
    }, 2000);
  };

  const handleDeleteLoadout = async (id: string) => {
    try {
      const res = await fetch(`/api/loadouts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.loadouts)) {
        setServerLoadouts(data.loadouts);
      } else {
        setServerLoadouts((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      setServerLoadouts((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSaveBridgeConfig = async (updated: Partial<BridgeConfigState>) => {
    try {
      const res = await fetch('/api/bridge/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.bridgeConfig) {
        setBridgeConfig(data.bridgeConfig);
      }
    } catch {
      setBridgeConfig((prev) => ({ ...prev, ...updated }));
    }
  };

  const filteredLoadouts = useMemo(() => {
    return serverLoadouts.filter((item) => {
      if (registryModeFilter !== 'ALL' && item.gameMode !== registryModeFilter) {
        return false;
      }
      if (!registrySearch.trim()) return true;
      const q = registrySearch.toLowerCase();
      const w = getWeaponById(item.weaponId);
      return (
        item.title.toLowerCase().includes(q) ||
        item.shareCode.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q)
      );
    });
  }, [serverLoadouts, registryModeFilter, registrySearch]);

  const activeSlotSpec = SLOT_META.find((s) => s.id === activeSlot) || SLOT_META[0];
  const slotChoices = getAttachmentsForSlot(activeSlot);
  const equippedInActiveSlot = getAttachmentById(attachments[activeSlot]);
  const activeSlotCal = calibrations[activeSlot] || { weightPct: 0, placementPct: 0 };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      {/* Top Bar Contract: Strictly 1 row, 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-[#111827] border-b border-slate-800">
        {/* Zone 1: Brand Title Wordmark (Single text element, no badges) */}
        <a
          href="#workbench"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('workbench');
          }}
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          DeltaSmith AI
        </a>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav aria-label="주요 메뉴" className="flex items-center gap-6 text-sm font-medium text-slate-400 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('workbench')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeSection === 'workbench' ? 'text-amber-400 border-b-2 border-amber-400' : ''
            }`}
          >
            AI 모딩 작업대
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('attributes')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeSection === 'attributes' ? 'text-amber-400 border-b-2 border-amber-400' : ''
            }`}
          >
            인게임 상세 속성
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('registry')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeSection === 'registry' ? 'text-amber-400 border-b-2 border-amber-400' : ''
            }`}
          >
            서버 발급 코드함 ({serverLoadouts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('bridge')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeSection === 'bridge' ? 'text-amber-400 border-b-2 border-amber-400' : ''
            }`}
          >
            툴 스테이션 연동
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsDecoderOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            공유 코드 역설계 입력
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 space-y-6">
        {/* Live Toast / Status Banner when code is minted */}
        {statusMessage && (
          <div
            role="status"
            className="flex items-center justify-between px-4 py-3 bg-emerald-950/60 border border-emerald-700/70 rounded-lg text-xs text-emerald-200"
          >
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 font-semibold ml-4"
            >
              닫기
            </button>
          </div>
        )}

        {/* SECTION 1: AI 모딩 작업대 (Unified AI Modder + Real-Time Share Code + In-Game Detailed Attributes) */}
        {activeSection === 'workbench' && (
          <div className="space-y-6">
            {/* Top Live Issued Share Code & Tool Station Bridge Bar */}
            <section
              aria-label="실시간 발급 공유 코드 및 브릿지 상태"
              className="bg-[#151A21] border border-slate-800 rounded-lg p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-amber-400">{buildTitle}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      연동 모드:{' '}
                      {bridgeConfig.mode === 'OFFICIAL_TOOL_STATION_API'
                        ? '공식 툴 스테이션 API 직결'
                        : `인게임 봇 릴레이 (${bridgeConfig.botAccountUid})`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">트랜잭션 {bridgeTxId}</span>
                  </div>

                  {/* Issued Official Share Code Box */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <code
                      data-testid="active-share-code"
                      className="px-3.5 py-2 bg-[#0B1120] border border-slate-700 rounded-lg text-base sm:text-lg font-bold font-mono tabular-nums text-amber-400 tracking-wide select-all"
                    >
                      {issuedCode}
                    </code>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(issuedCode, 'main-code')}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      {copiedCodeId === 'main-code' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>공유 코드 복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>인게임 즉시 적용 코드 복사</span>
                        </>
                      )}
                    </button>

                    {isDirtySinceIssue && (
                      <button
                        type="button"
                        onClick={handleReissueManualCode}
                        disabled={isReissuingCode}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isReissuingCode ? 'animate-spin' : ''}`} />
                        <span>
                          {isReissuingCode ? '서버 저장 중...' : '수동 변경사항 서버 저장 및 새 코드 확정'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Cost & Key Ballistic Summary */}
                <div className="flex flex-wrap items-center gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800 text-right">
                  <div>
                    <div className="text-xs text-slate-400">총 모딩 비용 (목표: {(maxBudget / 10000).toFixed(0)}만)</div>
                    <div
                      className={`text-lg font-bold font-mono tabular-nums ${
                        computed.totalCost <= maxBudget ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {computed.totalCost.toLocaleString()} 코인
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">반동 제어 / 안정성</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-100">
                      {computed.finalStats.control} / {computed.finalStats.stability}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">수직 / 수평 반동 배율</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-sky-400">
                      {computed.detailed.autoVertRecoilMult}x / {computed.detailed.autoHorizRecoilMult}x
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Modding Rationale & Season Meta Summary Strip */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/90 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs text-slate-300">
                <div>
                  <span className="font-semibold text-amber-400 mr-2">AI 모딩 설계 근거:</span>
                  <span>{aiReasoning}</span>
                </div>
                <div>
                  <span className="font-semibold text-sky-400 mr-2">세부 보정 튜닝 요약:</span>
                  <span>{calibrationAdvice}</span>
                </div>
              </div>
            </section>

            {/* Main 12-Column Workbench Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 4 Columns: AI Modding Target & Open API Season Meta Controller */}
              <form
                onSubmit={handleRunAiModding}
                className="lg:col-span-4 bg-[#151A21] border border-slate-800 rounded-lg p-5 space-y-5"
              >
                <div className="border-b border-slate-800 pb-3.5">
                  <h2 className="text-base font-bold text-slate-100">
                    오픈 API 시즌 메타 기반 AI 맞춤 모딩 설계
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    원하는 예산, 반동 제어, 안정성, 반동이 튀는 궤적을 지정하면 AI가 조합을 짜고 서버에서 새 공유 코드를 즉시 발급합니다.
                  </p>
                </div>

                {/* 1. Weapon Selection */}
                <div>
                  <label htmlFor="weapon-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    대상 총기 선택 (델타포스 오픈 API 연동)
                  </label>
                  <select
                    id="weapon-select"
                    value={weaponId}
                    onChange={(e) => handleSelectWeapon(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0F172A] border border-slate-700 rounded-lg text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {WEAPONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.category} · 기본 {w.baseCost.toLocaleString()} 코인)
                      </option>
                    ))}
                  </select>

                  {/* Open API Season Meta Card */}
                  <div className="mt-2.5 p-3 bg-[#0F172A] border border-slate-800 rounded-lg space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300 font-mono tabular-nums">
                      <span className="font-semibold text-amber-400">
                        메타 등급 {weapon.seasonMeta.tier} · 픽률 {weapon.seasonMeta.pickRatePct}%
                      </span>
                      <span>승률 {weapon.seasonMeta.winRatePct}%</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{weapon.seasonMeta.metaTrendNote}</p>
                  </div>
                </div>

                {/* 2. Game Mode & Playstyle Preset */}
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs font-semibold text-slate-300 mb-1.5">전장 모드 선택</span>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#0F172A] border border-slate-800 rounded-lg">
                      {(['전면전', '비콘 에어리어'] as GameMode[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setGameMode(m)}
                          className={`py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            gameMode === m
                              ? 'bg-slate-800 text-amber-400 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="playstyle-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      전술 모딩 프리셋
                    </label>
                    <select
                      id="playstyle-select"
                      value={playstyle}
                      onChange={(e) => handleSelectPlaystyle(e.target.value as PlaystylePreset)}
                      className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      {(Object.keys(PLAYSTYLE_META) as PlaystylePreset[]).map((key) => (
                        <option key={key} value={key}>
                          {PLAYSTYLE_META[key].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. User Specific Targets: 가격, 반동정도, 안정성, 반동 튀는 특성 */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label htmlFor="budget-slider" className="font-semibold text-slate-300">
                        원하는 가격 상한 (총기+파츠 합산)
                      </label>
                      <span className="font-mono tabular-nums font-bold text-amber-400">
                        {maxBudget.toLocaleString()} 하브 코인
                      </span>
                    </div>
                    <input
                      id="budget-slider"
                      type="range"
                      min={90000}
                      max={500000}
                      step={10000}
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400 mt-0.5">
                      <span>9만 (극가성비)</span>
                      <span>25만 (표준)</span>
                      <span>50만 (종결 풀모딩)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label htmlFor="target-control-slider" className="font-semibold text-slate-300">
                          목표 반동 제어
                        </label>
                        <span className="font-mono tabular-nums text-emerald-400 font-bold">
                          {targetControl}
                        </span>
                      </div>
                      <input
                        id="target-control-slider"
                        type="range"
                        min={40}
                        max={95}
                        step={1}
                        value={targetControl}
                        onChange={(e) => setTargetControl(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label htmlFor="target-stability-slider" className="font-semibold text-slate-300">
                          목표 안정성
                        </label>
                        <span className="font-mono tabular-nums text-sky-400 font-bold">
                          {targetStability}
                        </span>
                      </div>
                      <input
                        id="target-stability-slider"
                        type="range"
                        min={40}
                        max={95}
                        step={1}
                        value={targetStability}
                        onChange={(e) => setTargetStability(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="recoil-behavior-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      원하는 반동 궤적 (반동이 어떤 식으로 튀는지 제어)
                    </label>
                    <select
                      id="recoil-behavior-select"
                      value={recoilBehavior}
                      onChange={(e) => setRecoilBehavior(e.target.value as RecoilBehaviorPreference)}
                      className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      {(Object.keys(RECOIL_BEHAVIOR_META) as RecoilBehaviorPreference[]).map((key) => (
                        <option key={key} value={key}>
                          {RECOIL_BEHAVIOR_META[key].label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {RECOIL_BEHAVIOR_META[recoilBehavior].desc}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="ai-prompt-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      AI 추가 요청사항 (선택)
                    </label>
                    <textarea
                      id="ai-prompt-input"
                      rows={2}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="예: 우측으로 튀는 수평 반동을 완전히 잡고 소음기를 꼭 달아줘"
                      className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isGeneratingAi
                      ? '오픈 API 메타 분석 및 코드 발급 중...'
                      : 'AI 맞춤 모딩 설계 및 실시간 코드 발급'}
                  </span>
                </button>
              </form>

              {/* Right 8 Columns: In-Game Detailed Attributes (상세 속성 1:1) + Gunsmith Slot & Calibration Workbench */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1:1 In-Game Detailed Attributes Panel (Matches the 5 Uploaded Delta Force Screenshots) */}
                <DetailedAttributesPanel weapon={weapon} computed={computed} initialTab="recoil" />

                {/* Interactive Weapon Blueprint & 8-Slot Attachment + Fine Calibration Editor */}
                <div className="bg-[#151A21] border border-slate-800 rounded-lg p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">
                        총기 작업대 (Gunsmith) 파츠 구성 및 세부 보정
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        슬롯을 선택해 파츠를 교체하거나 무게추(g)·위치(mm) 세부 보정 슬라이더를 조절하면 위 상세 속성과 탄도 분포도가 즉시 갱신됩니다.
                      </p>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-300">
                      장착 파츠 {computed.equippedCount}/8 · 파츠 비용 {computed.attachmentsCost.toLocaleString()} 코인
                    </span>
                  </div>

                  {/* Interactive SVG Blueprint */}
                  <WeaponSchematicSvg
                    weaponId={weaponId}
                    attachments={attachments}
                    activeSlot={activeSlot}
                    onSelectSlot={setActiveSlot}
                  />

                  {/* 8 Slot Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    {SLOT_META.map((slot) => {
                      const att = getAttachmentById(attachments[slot.id]);
                      const isSelected = activeSlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setActiveSlot(slot.id)}
                          className={`p-2.5 rounded-lg border text-left transition-colors ${
                            isSelected
                              ? 'bg-slate-800 border-amber-500 text-slate-100'
                              : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-[11px] font-semibold text-amber-400 truncate">
                            {slot.label}
                          </div>
                          <div className="text-xs text-slate-200 font-medium truncate mt-0.5">
                            {att ? att.name : '순정 기본'}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Slot Attachment Picker & Fine Calibration (세부 보정) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2 border-t border-slate-800">
                    {/* Slot Attachment List */}
                    <div className="md:col-span-7 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">
                          [{activeSlotSpec.label}] 장착 가능 파츠 목록
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAttachmentChange(activeSlot, null)}
                          className="text-slate-400 hover:text-slate-200 underline"
                        >
                          순정 상태로 탈거
                        </button>
                      </div>

                      <div className="space-y-2">
                        {slotChoices.map((choice) => {
                          const isEquipped = attachments[activeSlot] === choice.id;
                          return (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() => handleAttachmentChange(activeSlot, choice.id)}
                              className={`w-full p-3 rounded-lg border text-left transition-colors flex items-start justify-between gap-3 ${
                                isEquipped
                                  ? 'bg-slate-800/90 border-amber-500 text-slate-100'
                                  : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                                  <span>{choice.name}</span>
                                  <span className="text-slate-400 font-normal">· {choice.tier}</span>
                                </div>
                                <p className="text-xs text-slate-400">{choice.note}</p>
                              </div>
                              <div className="text-right font-mono tabular-nums shrink-0">
                                <div className="text-xs font-semibold text-amber-400">
                                  {choice.cost.toLocaleString()} 코인
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {choice.statMods.control ? `반동 ${choice.statMods.control > 0 ? '+' : ''}${choice.statMods.control} ` : ''}
                                  {choice.statMods.handling ? `조작 ${choice.statMods.handling > 0 ? '+' : ''}${choice.statMods.handling} ` : ''}
                                  {choice.statMods.stability ? `안정 ${choice.statMods.stability > 0 ? '+' : ''}${choice.statMods.stability}` : ''}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Slot Fine Calibration Sliders (세부 보정) */}
                    <div className="md:col-span-5 bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>[{activeSlotSpec.label}] 세부 보정 (Calibration)</span>
                        </div>
                        {equippedInActiveSlot?.calibratable && (
                          <button
                            type="button"
                            onClick={() => {
                              handleCalibrationChange(activeSlot, 'weightPct', 0);
                              handleCalibrationChange(activeSlot, 'placementPct', 0);
                            }}
                            className="text-[11px] text-slate-400 hover:text-slate-200"
                          >
                            보정 초기화
                          </button>
                        )}
                      </div>

                      {equippedInActiveSlot && equippedInActiveSlot.calibratable ? (
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <label htmlFor="cal-axis-1" className="text-slate-300 font-medium">
                                {equippedInActiveSlot.axis1Label || '무게 배분 (g)'}
                              </label>
                              <span className="font-mono tabular-nums text-amber-400 font-semibold">
                                {activeSlotCal.weightPct > 0 ? `+${activeSlotCal.weightPct}%` : `${activeSlotCal.weightPct}%`}
                                {' '}({((activeSlotCal.weightPct / 100) * 50).toFixed(0)}g)
                              </span>
                            </div>
                            <input
                              id="cal-axis-1"
                              type="range"
                              min={-100}
                              max={100}
                              step={10}
                              value={activeSlotCal.weightPct}
                              onChange={(e) =>
                                handleCalibrationChange(activeSlot, 'weightPct', Number(e.target.value))
                              }
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                              <span>경량화 (정조준 속도↑)</span>
                              <span>중량화 (반동·안정성↑)</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <label htmlFor="cal-axis-2" className="text-slate-300 font-medium">
                                {equippedInActiveSlot.axis2Label || '장착 위치 (mm)'}
                              </label>
                              <span className="font-mono tabular-nums text-sky-400 font-semibold">
                                {activeSlotCal.placementPct > 0 ? `+${activeSlotCal.placementPct}%` : `${activeSlotCal.placementPct}%`}
                                {' '}({((activeSlotCal.placementPct / 100) * 10).toFixed(1)}mm)
                              </span>
                            </div>
                            <input
                              id="cal-axis-2"
                              type="range"
                              min={-100}
                              max={100}
                              step={10}
                              value={activeSlotCal.placementPct}
                              onChange={(e) =>
                                handleCalibrationChange(activeSlot, 'placementPct', Number(e.target.value))
                              }
                              className="w-full accent-sky-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                              <span>후방 (조작 반응↑)</span>
                              <span>전방 (수평반동·집탄↑)</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-xs text-slate-400">
                          {equippedInActiveSlot
                            ? '이 파츠는 고정 규격 부품으로 세부 보정 대상이 아닙니다. (총열, 전방 손잡이, 조준경, 후방 손잡이, 개머리판에서 세부 보정 가능)'
                            : '파츠를 먼저 장착하면 세부 보정 슬라이더가 활성화됩니다.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: 인게임 상세 속성 (Full-Width Dedicated Inspector View) */}
        {activeSection === 'attributes' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#151A21] border border-slate-800 rounded-lg p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  인게임 상세 속성 및 탄도 분포도 정밀 뷰어
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  델타포스 인게임 상세 속성 화면과 동일한 5대 항목(기본 대미지, 반동 제어, 조작 속도, 안정성, 지향사격 정밀도)을 왜곡 없이 그대로 검증합니다.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <code className="px-3 py-1.5 bg-[#0B1120] border border-slate-700 rounded text-xs font-mono text-amber-400">
                  {issuedCode}
                </code>
                <button
                  type="button"
                  onClick={() => setActiveSection('workbench')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>파츠·보정 수정하러 가기</span>
                </button>
              </div>
            </div>

            <DetailedAttributesPanel weapon={weapon} computed={computed} initialTab="recoil" />
          </div>
        )}

        {/* SECTION 3: 서버 발급 코드함 (Server Loadout Registry) */}
        {activeSection === 'registry' && (
          <div className="bg-[#151A21] border border-slate-800 rounded-lg p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  서버 저장 AI 모딩 조합 & 실시간 발급 코드 보관함
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  백엔드 서버가 툴 스테이션 API 및 봇 계정을 통해 저장·발급한 모든 총기 공유 코드입니다. 즉시 복사하거나 작업대로 불러와 재모딩할 수 있습니다.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    aria-label="저장된 코드 또는 총기 검색"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="총기명, 빌드명, 코드 검색..."
                    className="pl-8 pr-3 py-1.5 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#0F172A] border border-slate-800 rounded-lg">
                  {(['ALL', '전면전', '비콘 에어리어'] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      type="button"
                      onClick={() => setRegistryModeFilter(filterVal)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        registryModeFilter === filterVal
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {filterVal === 'ALL' ? '전체 모드' : filterVal}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredLoadouts.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-sm text-slate-400">조건에 일치하는 서버 저장 총기 모딩 코드가 없습니다.</p>
                <button
                  type="button"
                  onClick={() => {
                    setRegistrySearch('');
                    setRegistryModeFilter('ALL');
                    setActiveSection('workbench');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                >
                  새 AI 모딩 생성하기
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400">
                      <th className="py-3 px-3 font-semibold">빌드명 / 총기</th>
                      <th className="py-3 px-3 font-semibold">모드 · 브릿지</th>
                      <th className="py-3 px-3 font-semibold text-right">총 모딩 비용</th>
                      <th className="py-3 px-3 font-semibold text-right">반동 / 안정 / ADS</th>
                      <th className="py-3 px-3 font-semibold">발급된 실시간 공유 코드</th>
                      <th className="py-3 px-3 font-semibold text-right">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {filteredLoadouts.map((item) => {
                      const itemStats = computeLoadoutStats(
                        item.weaponId,
                        item.attachments,
                        item.calibrations
                      );
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-100">{item.title}</div>
                            <div className="text-slate-400 mt-0.5 line-clamp-1">{item.aiReasoning}</div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap text-slate-300">
                            <span>{item.gameMode}</span>
                            <span className="mx-1.5" aria-hidden="true">·</span>
                            <span className="font-mono text-slate-400">{item.bridgeTxId}</span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums text-amber-400 font-semibold whitespace-nowrap">
                            {itemStats.totalCost.toLocaleString()} 코인
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                            반동 {itemStats.finalStats.control} · 안정 {itemStats.finalStats.stability} · {itemStats.detailed.adsTimeMs}ms
                          </td>
                          <td className="py-3.5 px-3">
                            <code className="px-2.5 py-1 bg-[#0B1120] border border-slate-800 rounded font-mono tabular-nums text-amber-300 whitespace-nowrap">
                              {item.shareCode}
                            </code>
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyCode(item.shareCode, item.id)}
                                className="px-2.5 py-1.5 font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded transition-colors"
                              >
                                {copiedCodeId === item.id ? '복사됨' : '코드 복사'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  applyLoadoutToWorkbench(item);
                                  setActiveSection('workbench');
                                  showTempStatus(`'${item.title}' 세팅을 작업대로 불러왔습니다.`);
                                }}
                                className="px-2.5 py-1.5 font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                              >
                                작업대 로드
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLoadout(item.id)}
                                aria-label={`${item.title} 삭제`}
                                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: 툴 스테이션 연동 (Official Tool Station / Bot Relay Configuration) */}
        {activeSection === 'bridge' && (
          <BridgeSettingsPanel
            config={bridgeConfig}
            activeLoadoutState={{
              weaponId,
              gameMode,
              attachments,
              calibrations,
            }}
            onSaveConfig={handleSaveBridgeConfig}
            onTestIssueCode={handleReissueManualCode}
          />
        )}
      </main>

      {/* Share Code Decoder Modal */}
      <CodeDecoderModal
        isOpen={isDecoderOpen}
        onClose={() => setIsDecoderOpen(false)}
        onLoadDecoded={(decodedLoadout, source) => {
          applyLoadoutToWorkbench(decodedLoadout);
          setActiveSection('workbench');
          showTempStatus(
            `공유 코드 역설계 완료 (${source === 'SERVER_REGISTRY' ? '서버 DB 일치' : '해시 슬롯 복원'}): ${decodedLoadout.title}`
          );
        }}
        sampleCodes={serverLoadouts.map((l) => ({ label: l.title, code: l.shareCode }))}
      />
    </div>
  );
}
