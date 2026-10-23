import React, { useState } from 'react';
import {
  ComputedLoadoutResult,
  DetailedAttributeTabId,
  WeaponSpec,
} from '../utils/gunsmithLogic';

interface DetailedAttributesPanelProps {
  weapon: WeaponSpec;
  computed: ComputedLoadoutResult;
  initialTab?: DetailedAttributeTabId;
}

const TABS: { id: DetailedAttributeTabId; label: string }[] = [
  { id: 'damage', label: '기본 대미지' },
  { id: 'recoil', label: '반동 제어' },
  { id: 'handling', label: '조작 속도' },
  { id: 'stability', label: '안정성' },
  { id: 'hipfire', label: '지향사격 정밀도' },
];

/**
 * Reusable Tactical Soldier X-Ray Silhouette SVG matching Delta Force's in-game target model.
 */
const OperatorSilhouetteSvg: React.FC<{ scale?: number; opacity?: number }> = ({
  scale = 1,
  opacity = 0.32,
}) => (
  <g transform={`scale(${scale})`} opacity={opacity}>
    {/* Helmet & Head */}
    <path
      d="M90,26 C90,16 110,16 110,26 L112,35 C112,42 106,48 100,48 C94,48 88,42 88,35 Z"
      fill="#64748B"
      stroke="#94A3B8"
      strokeWidth="1.2"
    />
    <rect x="91" y="25" width="18" height="6" rx="2" fill="#334155" stroke="#94A3B8" strokeWidth="0.8" />
    {/* Neck & Shoulders */}
    <path
      d="M95,48 L105,48 L108,55 L128,60 C134,62 138,68 140,76 L148,118 L136,120 L128,82 L122,82 L122,135 L78,135 L78,82 L72,82 L64,120 L52,118 L60,76 C62,68 66,62 72,60 L92,55 Z"
      fill="#475569"
      stroke="#94A3B8"
      strokeWidth="1.1"
    />
    {/* Tactical Plate Carrier Vest */}
    <rect x="82" y="62" width="36" height="44" rx="3" fill="#334155" stroke="#CBD5E1" strokeWidth="1.2" />
    <line x1="84" y1="74" x2="116" y2="74" stroke="#64748B" strokeWidth="1" />
    <line x1="84" y1="86" x2="116" y2="86" stroke="#64748B" strokeWidth="1" />
    <line x1="84" y1="98" x2="116" y2="98" stroke="#64748B" strokeWidth="1" />
    {/* Abdomen / Lower Pouch */}
    <rect x="85" y="108" width="30" height="22" rx="2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
    {/* Forearms & Hands */}
    <path d="M52,118 L46,144 L56,146 L64,120 Z" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
    <path d="M148,118 L154,144 L144,146 L136,120 Z" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
    {/* Pelvis & Legs (Thighs + Calves + Boots) */}
    <path
      d="M78,135 L122,135 L120,185 L118,232 L105,232 L103,185 L100,158 L97,185 L95,232 L82,232 L80,185 Z"
      fill="#475569"
      stroke="#94A3B8"
      strokeWidth="1.1"
    />
    {/* Knee pads */}
    <rect x="81" y="180" width="14" height="12" rx="2" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />
    <rect x="105" y="180" width="14" height="12" rx="2" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />
  </g>
);

export const DetailedAttributesPanel: React.FC<DetailedAttributesPanelProps> = ({
  weapon,
  computed,
  initialTab = 'recoil',
}) => {
  const [activeTab, setActiveTab] = useState<DetailedAttributeTabId>(initialTab);
  const { finalStats, deltas, detailed } = computed;

  // Build SVG polyline points for Damage Falloff step chart
  const buildStepPolyline = (steps: { distanceM: number; multiplier: number }[]) => {
    // Chart X: 0m -> 40, 100m -> 340 (width 300)
    // Chart Y: 1.0 -> 30, 0.0 -> 180 (height 150)
    const mapX = (d: number) => 40 + (Math.min(100, Math.max(0, d)) / 100) * 300;
    const mapY = (m: number) => 180 - m * 150;

    const pts: string[] = [];
    for (let i = 0; i < steps.length; i++) {
      const cur = steps[i];
      const x = mapX(cur.distanceM);
      const y = mapY(cur.multiplier);
      if (i > 0) {
        const prevY = mapY(steps[i - 1].multiplier);
        pts.push(`${x.toFixed(1)},${prevY.toFixed(1)}`);
      }
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  // Breathing sway square size in pixels
  const breathSquareHalf = Math.round(Math.min(48, Math.max(14, detailed.breathingSwayDeg * 62)));
  const holdBreathHalf = Math.max(6, Math.round(breathSquareHalf * 0.28));
  const irregularBreathHalf = Math.min(72, Math.round(breathSquareHalf * 1.85));

  // Hipfire concentric circle radii
  const standingRadius = Math.round(Math.min(44, Math.max(12, detailed.standingHipfireSpreadDeg * 9.2)));
  const movingRadius = Math.round(Math.min(58, Math.max(18, detailed.movingHipfireSpreadDeg * 9.2)));
  const maxSpreadRadius = Math.round(Math.min(78, Math.max(32, detailed.maxHipfireSpreadDeg * 9.2)));

  return (
    <section
      aria-label="인게임 상세 속성 및 탄도 시뮬레이터"
      className="bg-[#151A21] border border-slate-700/80 rounded-lg overflow-hidden shadow-lg"
    >
      {/* Top In-Game Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#1A2029] border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polygon points="12 3 21 20 3 20" />
            <line x1="12" y1="10" x2="12" y2="16" />
          </svg>
          <h3 className="text-base font-bold tracking-tight text-slate-100">상세 속성</h3>
          <span className="text-xs text-slate-400 ml-2">
            {weapon.name} · 인게임 총기 작업대 실시간 수치 동기화
          </span>
        </div>

        {/* Quick Mode Indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
          <span>수직반동 {detailed.autoVertRecoilMult}x</span>
          <span aria-hidden="true">·</span>
          <span>수평반동 {detailed.autoHorizRecoilMult}x</span>
          <span aria-hidden="true">·</span>
          <span>정조준 {detailed.adsTimeMs}ms</span>
        </div>
      </div>

      {/* Main 2-Zone In-Game Layout: Left 5 Tabs + Right Detailed Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[430px]">
        {/* Left Tab Navigation (Matches exact 5 vertical buttons in Screenshots 1-5) */}
        <div
          role="tablist"
          aria-label="상세 속성 카테고리"
          className="lg:col-span-3 p-4 border-b lg:border-b-0 lg:border-r border-slate-800/90 flex lg:flex-col gap-2.5 overflow-x-auto bg-[#12171D]"
        >
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-4 text-left text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#252D38] border-slate-300 text-white shadow-inner'
                    : 'bg-[#171C24] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 p-6 bg-[#161B22] flex flex-col justify-between">
          {/* TAB 1: 기본 대미지 (Matches Screenshot 5) */}
          {activeTab === 'damage' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 space-y-5">
                {/* Top Stat Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-slate-100">기본 대미지</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {detailed.baseDamage}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-200"
                      style={{ width: `${Math.min(100, detailed.baseDamage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5">
                    무기가 방어구를 착용하지 않은 플레이어에게 실제로 입히는 피해량이다.
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-200">대미지 저하 배율</h4>
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      유효 사거리: {finalStats.range}m ({deltas.range >= 0 ? `+${deltas.range}m` : `${deltas.range}m`})
                    </span>
                  </div>

                  {/* Step Chart SVG */}
                  <svg
                    viewBox="0 0 365 210"
                    className="w-full h-auto bg-[#12161C] border border-slate-800/80 p-2"
                    role="img"
                    aria-label="거리별 대미지 저하 배율 그래프"
                  >
                    {/* Horizontal & Vertical Grid Lines */}
                    {[0.2, 0.4, 0.6, 0.8, 1.0].map((val) => {
                      const y = 180 - val * 150;
                      return (
                        <g key={val}>
                          <line x1="40" y1={y} x2="340" y2={y} stroke="#222934" strokeWidth="1" />
                          <text x="32" y={y + 4} textAnchor="end" fill="#94A3B8" fontSize="10" className="font-mono">
                            {val.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                    {[0, 25, 50, 75, 100].map((dist) => {
                      const x = 40 + (dist / 100) * 300;
                      return (
                        <g key={dist}>
                          <line x1={x} y1="30" x2={x} y2="180" stroke="#222934" strokeWidth="1" />
                          <text x={x} y="198" textAnchor="middle" fill="#94A3B8" fontSize="10" className="font-mono">
                            {dist === 100 ? '100(m)' : dist}
                          </text>
                        </g>
                      );
                    })}

                    {/* Base Falloff (dashed gray) */}
                    <polyline
                      fill="none"
                      stroke="#64748B"
                      strokeWidth="1.4"
                      strokeDasharray="3 3"
                      points={buildStepPolyline(detailed.baseDamageFalloffSteps)}
                    />
                    {/* Current Modded Falloff (solid bright line) */}
                    <polyline
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="2"
                      points={buildStepPolyline(detailed.damageFalloffSteps)}
                    />
                  </svg>
                </div>
              </div>

              {/* Right Column: 부위별 대미지 */}
              <div className="xl:col-span-5">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">부위별 대미지</h4>
                <div className="bg-[#12161C] border border-slate-800/80 p-3 flex items-center justify-center">
                  <svg viewBox="0 0 260 250" className="w-full max-w-[270px] h-auto" role="img" aria-label="신체 부위별 대미지 표">
                    <g transform="translate(30, 5)">
                      <OperatorSilhouetteSvg scale={1} opacity={0.45} />
                    </g>

                    {/* Left Callouts: Head (68), Chest (34), Abdomen (34) */}
                    <line x1="42" y1="36" x2="130" y2="36" stroke="#94A3B8" strokeWidth="0.9" />
                    <circle cx="130" cy="36" r="2" fill="#E2E8F0" />
                    <text x="36" y="40" textAnchor="end" fill="#E2E8F0" fontSize="12" className="font-mono">
                      {detailed.bodyDamage.head}
                    </text>

                    <line x1="42" y1="88" x2="130" y2="88" stroke="#94A3B8" strokeWidth="0.9" />
                    <circle cx="130" cy="88" r="2" fill="#E2E8F0" />
                    <text x="36" y="92" textAnchor="end" fill="#E2E8F0" fontSize="12" className="font-mono">
                      {detailed.bodyDamage.chest}
                    </text>

                    <line x1="42" y1="124" x2="130" y2="124" stroke="#94A3B8" strokeWidth="0.9" />
                    <circle cx="130" cy="124" r="2" fill="#E2E8F0" />
                    <text x="36" y="128" textAnchor="end" fill="#E2E8F0" fontSize="12" className="font-mono">
                      {detailed.bodyDamage.abdomen}
                    </text>

                    {/* Right Callouts: Upper Arm, Forearm, Thigh, Calf */}
                    <line x1="162" y1="88" x2="220" y2="88" stroke="#94A3B8" strokeWidth="0.9" />
                    <circle cx="162" cy="88" r="2" fill="#E2E8F0" />
                    <text x="226" y="92" textAnchor="start" fill="#E2E8F0" fontSize="12" className="font-mono">
                      {detailed.bodyDamage.upperArm}
                    </text>

                    <line x1="174" y1="122" x2="220" y2="122" stroke="#94A3B8" strokeWidth="0.9" />
                    <circle cx="174" cy="122" r="2" fill="#E2E8F0" />
                    <text x="226" y="126" textAnchor="start" fill="#E2E8F0" fontSize="12" className="font-mono">
                      {detailed.bodyDamage.forearm}
                    </text>

                    <line x1="142" y1="168" x2="220" y2="168" stroke="#94A3B8" strokeWidth="0.9" />
                    <circle cx="142" cy="168" r="2" fill="#E2E8F0" />
                    <text x="226" y="172" textAnchor="start" fill="#E2E8F0" fontSize="12" className="font-mono">
                      {detailed.bodyDamage.thigh}
                    </text>

                    <line x1="142" y1="212" x2="220" y2="212" stroke="#94A3B8" strokeWidth="0.9" />
                    <circle cx="142" cy="212" r="2" fill="#E2E8F0" />
                    <text x="226" y="216" textAnchor="start" fill="#E2E8F0" fontSize="12" className="font-mono">
                      {detailed.bodyDamage.calf}
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 반동 제어 (Matches Screenshot 4) */}
          {activeTab === 'recoil' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-slate-100">반동 제어</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-xl font-bold text-white">{finalStats.control}</span>
                      {deltas.control !== 0 && (
                        <span className={`text-xs ${deltas.control > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({deltas.control > 0 ? `+${deltas.control}` : deltas.control})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-transform duration-150"
                      style={{ width: `${finalStats.control}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5">
                    반동 제어가 높을수록 사격 시 느껴지는 반동이 적다.
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3">반동 제어 세부 속성</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 연사 수직 반동 배율</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.autoVertRecoilMult}x</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 연사 수평 반동 배율</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.autoHorizRecoilMult}x</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 단발/점사 수직 반동 배율</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.burstVertRecoilMult}x</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 단발/점사 수평 반동 배율</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.burstHorizRecoilMult}x</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 발포 시 무기 안정성</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.firingWeaponStabilityMult}x</dd>
                    </div>
                  </dl>

                  <div className="mt-5 p-3 bg-[#11151B] border border-slate-800 rounded text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-amber-400">탄도 궤적 및 반동 튀는 특성 분석</div>
                    <p className="text-slate-300 leading-relaxed">{detailed.recoilPatternSummary}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: 탄도 분포도 (기본 프리셋 vs 현재 개조) */}
              <div className="xl:col-span-5">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">탄도 분포도</h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Left Box: 기본 프리셋 */}
                  <div>
                    <div className="bg-[#12161C] border border-slate-800/90 h-[255px] flex items-center justify-center relative overflow-hidden">
                      <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label="기본 프리셋 탄도 분포도">
                        {/* Faint torso target silhouette */}
                        <path
                          d="M36,24 C36,15 64,15 64,24 L66,35 L86,44 L86,95 L14,95 L14,44 L34,35 Z"
                          fill="#1E293B"
                          opacity="0.55"
                        />
                        {detailed.baseTrajectoryDots.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r={idx === 0 ? '2.2' : '1.6'}
                            fill="#94A3B8"
                            opacity={0.85}
                          />
                        ))}
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-300">
                      <span className="inline-block w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                      <span>기본 프리셋</span>
                    </div>
                  </div>

                  {/* Right Box: 현재 개조 */}
                  <div>
                    <div className="bg-[#12161C] border border-slate-800/90 h-[255px] flex items-center justify-center relative overflow-hidden">
                      <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label="현재 개조 탄도 분포도">
                        <path
                          d="M36,24 C36,15 64,15 64,24 L66,35 L86,44 L86,95 L14,95 L14,44 L34,35 Z"
                          fill="#1E293B"
                          opacity="0.55"
                        />
                        {detailed.moddedTrajectoryDots.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r={idx === 0 ? '2.3' : '1.7'}
                            fill="#10B981"
                          />
                        ))}
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-200">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>현재 개조</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 조작 속도 (Matches Screenshot 1) */}
          {activeTab === 'handling' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-slate-100">조작 속도</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-xl font-bold text-white">{finalStats.handling}</span>
                    {deltas.handling !== 0 && (
                      <span className={`text-xs ${deltas.handling > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ({deltas.handling > 0 ? `+${deltas.handling}` : deltas.handling})
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-slate-200"
                    style={{ width: `${finalStats.handling}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2.5">
                  조작 속도가 빠를수록 무기 조준, 질주에서 발포까지의 시간, 정조준 시 이동 속도가 빨라진다.
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-4">조작 속도 세부 속성</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3.5 text-sm">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 정조준 시간</span>
                      <span className="font-mono tabular-nums text-white">{detailed.adsTimeMs}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 달리기 사격 지연</span>
                      <span className="font-mono tabular-nums text-white">{detailed.sprintToFireMs}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 정조준 이동 속도</span>
                      <span className="font-mono tabular-nums text-white">{detailed.adsMoveSpeedMs}m/s</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 걷기 속도</span>
                      <span className="font-mono tabular-nums text-white">{detailed.walkSpeedMs}m/s</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 질주 속도</span>
                      <span className="font-mono tabular-nums text-white">{detailed.sprintSpeedMs}m/s</span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 재장전 시간</span>
                      <span className="font-mono tabular-nums text-white">{detailed.reloadTimeSec}초</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 탄약 소진 재장전 시간</span>
                      <span className="font-mono tabular-nums text-white">{detailed.emptyReloadTimeSec}초</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 총 회수 시간</span>
                      <span className="font-mono tabular-nums text-white">{detailed.holsterTimeSec}초</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>· 현재 총 교체 시간</span>
                      <span className="font-mono tabular-nums text-white">{detailed.equipTimeSec}초</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 안정성 (Matches Screenshot 3) */}
          {activeTab === 'stability' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-slate-100">안정성</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-xl font-bold text-white">{finalStats.stability}</span>
                      {deltas.stability !== 0 && (
                        <span className={`text-xs ${deltas.stability > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({deltas.stability > 0 ? `+${deltas.stability}` : deltas.stability})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-200"
                      style={{ width: `${finalStats.stability}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    안정성이 높을수록 연속 발포 시 무기의 흔들림이 적다. 조준 시 호흡으로 인한 흔들림이 안정되고 극한의 집중 시간이 길어지며, 피격 시에도 반동이 적다.
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3">안정성 세부 속성</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 호흡 흔들림 범위</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.breathingSwayDeg}°</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 숨 참기 지속 시간</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.holdBreathDurationSec}초</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 숨 참기 시 반동 감소</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.holdBreathRecoilMult}x</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 피격 시 상체 흔들림 배율</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.flinchMultiplier}x</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 이동 안정성</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.movementStabilityMult}x</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 발포 시 렌즈 안정성</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.firingLensStabilityMult}x</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Right Column: 호흡 흔들림 예시 (Concentric Squares inside Scope Circle) */}
              <div className="xl:col-span-5">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">호흡 흔들림 예시</h4>
                <div className="bg-[#12161C] border border-slate-800/90 p-3 flex flex-col items-center">
                  <svg viewBox="0 0 220 220" className="w-full max-w-[210px] h-auto" role="img" aria-label="호흡 흔들림 범위 예시">
                    {/* Outer Scope Circle */}
                    <circle cx="110" cy="110" r="96" fill="#181E26" stroke="#2D3748" strokeWidth="1.5" />
                    <line x1="14" y1="110" x2="206" y2="110" stroke="#334155" strokeWidth="0.8" />
                    <line x1="110" y1="14" x2="110" y2="206" stroke="#334155" strokeWidth="0.8" />

                    {/* Small soldier centered at crosshair */}
                    <g transform="translate(65, 92) scale(0.45)">
                      <OperatorSilhouetteSvg scale={1} opacity={0.45} />
                    </g>

                    {/* Red Outer Square: 호흡이 불규칙할 때 흔들림 범위 */}
                    <rect
                      x={110 - irregularBreathHalf}
                      y={110 - irregularBreathHalf}
                      width={irregularBreathHalf * 2}
                      height={irregularBreathHalf * 2}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="1.1"
                    />

                    {/* White Middle Square: 호흡 흔들림 범위 */}
                    <rect
                      x={110 - breathSquareHalf}
                      y={110 - breathSquareHalf}
                      width={breathSquareHalf * 2}
                      height={breathSquareHalf * 2}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="1.3"
                    />

                    {/* Green Inner Square: 숨 참기 시 호흡 흔들림 범위 */}
                    <rect
                      x={110 - holdBreathHalf}
                      y={110 - holdBreathHalf}
                      width={holdBreathHalf * 2}
                      height={holdBreathHalf * 2}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="1.4"
                    />
                  </svg>

                  <div className="w-full mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 border border-slate-200" aria-hidden="true" />
                      <span>호흡 흔들림 범위 ({detailed.breathingSwayDeg}°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 border border-emerald-500" aria-hidden="true" />
                      <span>숨 참기 시 호흡 흔들림 범위</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 border border-red-500" aria-hidden="true" />
                      <span>호흡이 불규칙할 때 흔들림 범위</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 지향사격 정밀도 (Matches Screenshot 2) */}
          {activeTab === 'hipfire' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-slate-100">지향사격 정밀도</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-xl font-bold text-white">{finalStats.accuracy}</span>
                      {deltas.accuracy !== 0 && (
                        <span className={`text-xs ${deltas.accuracy > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({deltas.accuracy > 0 ? `+${deltas.accuracy}` : deltas.accuracy})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-200"
                      style={{ width: `${finalStats.accuracy}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5">
                    지향사격 정밀도가 높을수록 탄착군이 더욱 조밀하게 형성된다.
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3">지향사격 정밀도 세부 속성</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 현재 서 있는 자세에서 지향사격 확산 범위</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.standingHipfireSpreadDeg}°</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 서 있는 자세에서 최대 발사 확산 범위</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.maxHipfireSpreadDeg}°</dd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <dt>· 이동 시 지향사격 확산 범위</dt>
                      <dd className="font-mono tabular-nums text-white">{detailed.movingHipfireSpreadDeg}°</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Right Column: 지향사격 확산 범위 동심원 (Matches Screenshot 2) */}
              <div className="xl:col-span-5">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">지향사격 확산 예시</h4>
                <div className="bg-[#12161C] border border-slate-800/90 p-3 flex flex-col items-center">
                  <svg viewBox="0 0 220 230" className="w-full max-w-[210px] h-auto" role="img" aria-label="지향사격 확산 범위 동심원">
                    <g transform="translate(10, 0)">
                      <OperatorSilhouetteSvg scale={1} opacity={0.45} />
                    </g>

                    {/* Red Outer Circle: 최대 확산 범위 */}
                    <circle
                      cx="110"
                      cy="104"
                      r={maxSpreadRadius}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="1.2"
                    />
                    {/* White Middle Circle: 이동 시 확산 범위 */}
                    <circle
                      cx="110"
                      cy="104"
                      r={movingRadius}
                      fill="none"
                      stroke="#CBD5E1"
                      strokeWidth="1.2"
                    />
                    {/* Green Inner Circle: 정지 시 확산 범위 */}
                    <circle
                      cx="110"
                      cy="104"
                      r={standingRadius}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="1.4"
                    />
                  </svg>

                  <div className="w-full mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300" aria-hidden="true" />
                      <span>이동 시 확산 범위 ({detailed.movingHipfireSpreadDeg}°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-emerald-500" aria-hidden="true" />
                      <span>정지 시 확산 범위 ({detailed.standingHipfireSpreadDeg}°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-red-500" aria-hidden="true" />
                      <span>최대 확산 범위 ({detailed.maxHipfireSpreadDeg}°)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
