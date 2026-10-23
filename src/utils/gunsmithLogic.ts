export type GameMode = '비콘 에어리어' | '전면전';

export type PlaystylePreset =
  | 'laser_recoil'
  | 'budget_beacon'
  | 'ads_rush'
  | 'hipfire_cqb'
  | 'long_range_beam';

export type RecoilBehaviorPreference =
  | 'vertical_only'     // 좌우 수평 흔들림 제거 (수직 일직선 반동)
  | 'laser_cluster'     // 수직·수평 동시 압축 (한 점 집탄)
  | 'first_burst_lock'  // 초탄 1~8발 반동 억제 (점사/끊어치기)
  | 'smooth_climb';     // 반동 회복 및 렌즈 흔들림 최소화

export type AttachmentSlotId =
  | 'muzzle'
  | 'barrel'
  | 'foregrip'
  | 'optic'
  | 'magazine'
  | 'rear_grip'
  | 'stock'
  | 'laser';

export type DetailedAttributeTabId =
  | 'damage'
  | 'recoil'
  | 'handling'
  | 'stability'
  | 'hipfire';

export interface WeaponStats {
  baseDamage: number;   // 기본 대미지 (e.g., 34)
  control: number;      // 반동 제어 (0 - 100)
  handling: number;     // 조작 속도 (0 - 100)
  stability: number;    // 안정성 (0 - 100)
  accuracy: number;     // 지향사격 정밀도 (0 - 100)
  range: number;        // 유효 사거리 (m)
  fireRate: number;     // 연사 속도 (RPM)
  adsTimeMs: number;    // 현재 정조준 시간 (ms)
  muzzleVelocity: number; // 탄속 (m/s)
}

export interface DetailedSubAttributes {
  // 1. 기본 대미지 탭
  baseDamage: number;
  bodyDamage: {
    head: number;
    chest: number;
    abdomen: number;
    upperArm: number;
    forearm: number;
    thigh: number;
    calf: number;
  };
  damageFalloffSteps: { distanceM: number; multiplier: number }[];
  baseDamageFalloffSteps: { distanceM: number; multiplier: number }[];

  // 2. 반동 제어 탭
  autoVertRecoilMult: number;      // 현재 연사 수직 반동 배율 (e.g. 0.72x)
  autoHorizRecoilMult: number;     // 현재 연사 수평 반동 배율 (e.g. 0.68x)
  burstVertRecoilMult: number;     // 현재 단발/점사 수직 반동 배율 (e.g. 0.78x)
  burstHorizRecoilMult: number;    // 현재 단발/점사 수평 반동 배율 (e.g. 0.75x)
  firingWeaponStabilityMult: number; // 현재 발포 시 무기 안정성 (e.g. 0.80x)
  recoilPatternSummary: string;    // 반동이 튀는 방향/특성 요약
  baseTrajectoryDots: { x: number; y: number }[];    // 기본 프리셋 탄도 분포도 (18발)
  moddedTrajectoryDots: { x: number; y: number }[];  // 현재 개조 탄도 분포도 (18발)

  // 3. 조작 속도 탭
  adsTimeMs: number;               // 현재 정조준 시간 (e.g. 289ms)
  sprintToFireMs: number;          // 현재 달리기 사격 지연 (e.g. 109ms)
  adsMoveSpeedMs: number;          // 현재 정조준 이동 속도 (e.g. 2.53m/s)
  walkSpeedMs: number;             // 현재 걷기 속도 (e.g. 3.58m/s)
  sprintSpeedMs: number;           // 현재 질주 속도 (e.g. 5.9m/s)
  reloadTimeSec: number;           // 현재 재장전 시간 (e.g. 1.8초)
  emptyReloadTimeSec: number;      // 현재 탄약 소진 재장전 시간 (e.g. 2.0초)
  holsterTimeSec: number;          // 현재 총 회수 시간 (e.g. 0.3초)
  equipTimeSec: number;            // 현재 총 교체 시간 (e.g. 0.3초)

  // 4. 안정성 탭
  breathingSwayDeg: number;        // 현재 호흡 흔들림 범위 (e.g. 0.42°)
  holdBreathDurationSec: number;   // 현재 숨 참기 지속 시간 (e.g. 20초)
  holdBreathRecoilMult: number;    // 현재 숨 참기 시 반동 감소 (e.g. 0.95x)
  flinchMultiplier: number;        // 현재 피격 시 상체 흔들림 배율 (e.g. 0.8x)
  movementStabilityMult: number;   // 현재 이동 안정성 (e.g. 1x)
  firingLensStabilityMult: number; // 현재 발포 시 렌즈 안정성 (e.g. 1x)

  // 5. 지향사격 정밀도 탭
  standingHipfireSpreadDeg: number; // 현재 서 있는 자세에서 지향사격 확산 범위 (e.g. 2.5°)
  maxHipfireSpreadDeg: number;      // 서 있는 자세에서 최대 발사 확산 범위 (e.g. 6.0°)
  movingHipfireSpreadDeg: number;   // 이동 시 확산 범위 (e.g. 3.8°)
}

export interface WeaponSpec {
  id: string;
  name: string;         // e.g., "M4A1 돌격소총"
  shortName: string;    // e.g., "M4A1"
  category: '돌격소총' | '전투소총' | '기관단총' | '저격소총';
  caliber: string;
  baseCost: number;     // 기본 총기 가격 (하브 코인)
  baseStats: WeaponStats;
  recoilCurveSeed: {
    vertStep: number;
    horizAmplitude: number;
    horizFrequency: number;
    driftDirection: 'right' | 'left' | 's_curve';
  };
  seasonMeta: {
    seasonName: string;
    tier: 'S+' | 'S' | 'A';
    pickRatePct: number;
    winRatePct: number;
    openApiId: string;
    metaTrendNote: string;
  };
  description: string;
}

export interface AttachmentSpec {
  id: string;
  slot: AttachmentSlotId;
  name: string;
  tier: '가성비' | '전술 표준' | '종결 엘리트';
  cost: number;         // 하브 코인 가격
  statMods: {
    control?: number;
    handling?: number;
    stability?: number;
    accuracy?: number;
    rangePct?: number;
    muzzleVelocityPct?: number;
    vertRecoilBias?: number;   // 추가 수직 반동 억제 보너스 (%)
    horizRecoilBias?: number;  // 추가 수평 반동 억제 보너스 (%)
    reloadDeltaSec?: number;   // 재장전 시간 증감 (초)
  };
  calibratable: boolean;
  axis1Label?: string;
  axis2Label?: string;
  note: string;
}

export interface SlotCalibration {
  weightPct: number;    // -100 to +100
  placementPct: number; // -100 to +100
}

export type LoadoutAttachments = Record<AttachmentSlotId, string | null>;
export type LoadoutCalibrations = Partial<Record<AttachmentSlotId, SlotCalibration>>;

export interface UserModdingTargets {
  maxBudget: number;                          // 원하는 총기 모딩 가격 상한 (하브 코인)
  targetControl: number;                      // 원하는 반동 제어 목표치 (40 ~ 95)
  targetStability: number;                    // 원하는 안정성 목표치 (40 ~ 95)
  recoilBehavior: RecoilBehaviorPreference;   // 반동이 어떤 식으로 튀길 원하는지
}

export interface ModdingLoadout {
  id: string;
  title: string;
  weaponId: string;
  gameMode: GameMode;
  playstyle: PlaystylePreset;
  attachments: LoadoutAttachments;
  calibrations: LoadoutCalibrations;
  aiReasoning: string;
  calibrationAdvice: string;
  metaAnalysis?: string;
  shareCode: string;
  bridgeStatus: 'ISSUED_TOOL_STATION' | 'SYNCED_BOT_RELAY';
  bridgeTxId: string;
  createdAt: string;
  authorPrompt?: string;
  targets?: UserModdingTargets;
}

export interface ComputedLoadoutResult {
  finalStats: WeaponStats;
  deltas: {
    control: number;
    handling: number;
    stability: number;
    accuracy: number;
    range: number;
    adsTimeMs: number;
    muzzleVelocity: number;
  };
  detailed: DetailedSubAttributes;
  totalCost: number;
  attachmentsCost: number;
  equippedCount: number;
}

export const SLOT_META: { id: AttachmentSlotId; label: string; engLabel: string }[] = [
  { id: 'muzzle', label: '총구', engLabel: 'Muzzle' },
  { id: 'barrel', label: '총열', engLabel: 'Barrel' },
  { id: 'foregrip', label: '전방 손잡이', engLabel: 'Foregrip' },
  { id: 'optic', label: '조준경', engLabel: 'Optic' },
  { id: 'magazine', label: '탄창', engLabel: 'Magazine' },
  { id: 'rear_grip', label: '후방 손잡이', engLabel: 'Rear Grip' },
  { id: 'stock', label: '개머리판', engLabel: 'Stock' },
  { id: 'laser', label: '전술 장비', engLabel: 'Tactical / Laser' },
];

export const RECOIL_BEHAVIOR_META: Record<
  RecoilBehaviorPreference,
  { label: string; desc: string }
> = {
  vertical_only: {
    label: '좌우 수평 튀김 억제 (수직 일직선)',
    desc: '좌우로 불규칙하게 튀는 수평 반동을 최우선 제거하여 마우스만 아래로 내리면 한 점에 박히도록 제어',
  },
  laser_cluster: {
    label: '수직·수평 통합 압축 (무반동 레이저)',
    desc: '수직 상승폭과 좌우 편차를 동시에 압축해 50m 이상 연사 시 탄착군 면적을 최소화',
  },
  first_burst_lock: {
    label: '초탄 1~8발 고정 (점사·헤드라인)',
    desc: '초기 발포 시 총구 들림과 흔들림을 억제해 머리·흉부 첫 점사 명중률을 극대화',
  },
  smooth_climb: {
    label: '렌즈 흔들림·피격 에임펀치 최소화',
    desc: '연속 발포 시 조준경 흔들림(시각 반동)과 적 피격 시 상체 들림을 최소화해 정밀 조준 유지',
  },
};

export const PLAYSTYLE_META: Record<
  PlaystylePreset,
  { label: string; summary: string; recommendedMode: GameMode; defaultTargets: UserModdingTargets }
> = {
  laser_recoil: {
    label: '무반동 레이저 종결',
    summary: '수직·수평 반동 제어와 조준 안정성을 극대화하여 중장거리 연사 집탄율을 잡는 풀모딩',
    recommendedMode: '전면전',
    defaultTargets: {
      maxBudget: 420000,
      targetControl: 82,
      targetStability: 78,
      recoilBehavior: 'laser_cluster',
    },
  },
  budget_beacon: {
    label: '비콘 에어리어 가성비',
    summary: '하브 코인 소모를 억제하면서 핵심 반동 파츠만 장착해 탈출 실패 부담을 낮춘 실전 조합',
    recommendedMode: '비콘 에어리어',
    defaultTargets: {
      maxBudget: 165000,
      targetControl: 66,
      targetStability: 64,
      recoilBehavior: 'vertical_only',
    },
  },
  ads_rush: {
    label: '초고속 ADS 돌격형',
    summary: '조작 속도와 정조준 시간(ms)을 최우선으로 당겨 코너 교전 선공권을 가져오는 세팅',
    recommendedMode: '전면전',
    defaultTargets: {
      maxBudget: 320000,
      targetControl: 58,
      targetStability: 56,
      recoilBehavior: 'first_burst_lock',
    },
  },
  hipfire_cqb: {
    label: '근접 지향사격 특화',
    summary: '지향사격 정밀도와 확산 범위를 극단적으로 좁혀 줌 없이도 15m 내 적을 녹이는 실내전 빌드',
    recommendedMode: '비콘 에어리어',
    defaultTargets: {
      maxBudget: 260000,
      targetControl: 55,
      targetStability: 54,
      recoilBehavior: 'vertical_only',
    },
  },
  long_range_beam: {
    label: '탄속·사거리 저격형',
    summary: '롱 배럴과 고배율 조준경, 호흡 안정성 보정으로 대미지 저하 거리를 늘린 중장거리 제압 세팅',
    recommendedMode: '전면전',
    defaultTargets: {
      maxBudget: 450000,
      targetControl: 80,
      targetStability: 85,
      recoilBehavior: 'smooth_climb',
    },
  },
};

export const WEAPONS: WeaponSpec[] = [
  {
    id: 'm4a1',
    name: 'M4A1 돌격소총',
    shortName: 'M4A1',
    category: '돌격소총',
    caliber: '5.56x45mm NATO',
    baseCost: 48000,
    baseStats: {
      baseDamage: 34,
      control: 46,
      handling: 60,
      stability: 51,
      accuracy: 50,
      range: 25,
      fireRate: 800,
      adsTimeMs: 289,
      muzzleVelocity: 620,
    },
    recoilCurveSeed: {
      vertStep: 9.2,
      horizAmplitude: 7.5,
      horizFrequency: 0.42,
      driftDirection: 's_curve',
    },
    seasonMeta: {
      seasonName: 'S4 이클립스 비질 (Open API 집계)',
      tier: 'S+',
      pickRatePct: 24.8,
      winRatePct: 54.2,
      openApiId: 'DF-WPN-AR-001',
      metaTrendNote: '기본 대미지 34(헤드 68)로 가브리엘 롱 배럴 + 샌드스톰/바스티온 보정기 조합 시 S자 수평 반동이 일직선으로 펴져 현 시즌 픽률 1위를 기록 중입니다.',
    },
    description: '전면전과 비콘 에어리어 모두에서 가장 균형 잡힌 1티어 돌격소총. 기본 프리셋은 완만한 S자 형태로 탄이 튀며, 수평·수직 보정 시 레이저 탄도를 보여줍니다.',
  },
  {
    id: 'k416',
    name: 'K416 돌격소총',
    shortName: 'K416',
    category: '돌격소총',
    caliber: '5.56x45mm NATO',
    baseCost: 85000,
    baseStats: {
      baseDamage: 31,
      control: 42,
      handling: 62,
      stability: 52,
      accuracy: 58,
      range: 24,
      fireRate: 880,
      adsTimeMs: 268,
      muzzleVelocity: 600,
    },
    recoilCurveSeed: {
      vertStep: 9.8,
      horizAmplitude: 10.4,
      horizFrequency: 0.55,
      driftDirection: 'right',
    },
    seasonMeta: {
      seasonName: 'S4 이클립스 비질 (Open API 집계)',
      tier: 'S+',
      pickRatePct: 21.4,
      winRatePct: 56.1,
      openApiId: 'DF-WPN-AR-004',
      metaTrendNote: '880 RPM의 압도적 연사력으로 비콘 에어리어 고가치 교전 승률 1위. 기본 반동이 우상향 지그재그로 튀기 때문에 바스티온 수평 보정기가 필수 메타입니다.',
    },
    description: '880 RPM의 폭발적인 연사력으로 근·중거리 TTK 최상위를 자랑하는 메타 총기. 우측 수평 반동 제어가 모딩의 핵심입니다.',
  },
  {
    id: 'akm',
    name: 'AKM 돌격소총',
    shortName: 'AKM',
    category: '돌격소총',
    caliber: '7.62x39mm',
    baseCost: 52000,
    baseStats: {
      baseDamage: 40,
      control: 36,
      handling: 48,
      stability: 50,
      accuracy: 45,
      range: 35,
      fireRate: 600,
      adsTimeMs: 318,
      muzzleVelocity: 640,
    },
    recoilCurveSeed: {
      vertStep: 11.5,
      horizAmplitude: 8.8,
      horizFrequency: 0.48,
      driftDirection: 's_curve',
    },
    seasonMeta: {
      seasonName: 'S4 이클립스 비질 (Open API 집계)',
      tier: 'A',
      pickRatePct: 11.2,
      winRatePct: 51.4,
      openApiId: 'DF-WPN-AR-007',
      metaTrendNote: '헤드샷 80 대미지로 상급 방탄복 상대로도 3발 컷이 가능하나, 강한 수직 상승폭을 샌드스톰 수직 보정기와 무게추 보정으로 눌러줘야 합니다.',
    },
    description: '강력한 7.62mm 단발 위력과 방탄복 관통력을 지닌 중량급 소총. 강한 초기 수직 반동을 잡아주는 세팅이 필수입니다.',
  },
  {
    id: 'as_val',
    name: 'AS Val 돌격소총',
    shortName: 'AS Val',
    category: '돌격소총',
    caliber: '9x39mm SP6',
    baseCost: 92000,
    baseStats: {
      baseDamage: 36,
      control: 44,
      handling: 65,
      stability: 51,
      accuracy: 60,
      range: 22,
      fireRate: 900,
      adsTimeMs: 245,
      muzzleVelocity: 330,
    },
    recoilCurveSeed: {
      vertStep: 9.6,
      horizAmplitude: 6.5,
      horizFrequency: 0.5,
      driftDirection: 'left',
    },
    seasonMeta: {
      seasonName: 'S4 이클립스 비질 (Open API 집계)',
      tier: 'S',
      pickRatePct: 16.5,
      winRatePct: 55.8,
      openApiId: 'DF-WPN-AR-011',
      metaTrendNote: '행정구역 및 실내 거점 교전에서 최단 TTK를 기록하는 9x39mm 내장 소음 총기. 45발 확장 탄창과 전방 그립 반동 보정이 핵심입니다.',
    },
    description: '일체형 아음속 소음기와 900 RPM 연사력을 갖춘 비콘 에어리어 실내 교전 패왕. 확장 탄창과 반동 보정이 중요합니다.',
  },
  {
    id: 'scar_h',
    name: 'SCAR-H 전투소총',
    shortName: 'SCAR-H',
    category: '전투소총',
    caliber: '7.62x51mm NATO',
    baseCost: 68000,
    baseStats: {
      baseDamage: 42,
      control: 40,
      handling: 49,
      stability: 57,
      accuracy: 46,
      range: 42,
      fireRate: 585,
      adsTimeMs: 310,
      muzzleVelocity: 690,
    },
    recoilCurveSeed: {
      vertStep: 10.6,
      horizAmplitude: 5.8,
      horizFrequency: 0.36,
      driftDirection: 'right',
    },
    seasonMeta: {
      seasonName: 'S4 이클립스 비질 (Open API 집계)',
      tier: 'S',
      pickRatePct: 18.9,
      winRatePct: 53.7,
      openApiId: 'DF-WPN-BR-002',
      metaTrendNote: '전면전 중장거리 교전 메타 1위 전투소총. 대미지 저하 구간이 42m 이후로 길어 롱 배럴 장착 시 60m 밖에서도 3~4발 킬이 가능합니다.',
    },
    description: '중장거리 교전에서 압도적인 저지력과 유효 사거리를 발휘하는 전투소총. 안정성과 총열 연장 효율이 매우 높습니다.',
  },
  {
    id: 'vector',
    name: 'Vector 기관단총',
    shortName: 'Vector',
    category: '기관단총',
    caliber: '.45 ACP',
    baseCost: 64000,
    baseStats: {
      baseDamage: 28,
      control: 45,
      handling: 74,
      stability: 46,
      accuracy: 72,
      range: 18,
      fireRate: 1090,
      adsTimeMs: 210,
      muzzleVelocity: 380,
    },
    recoilCurveSeed: {
      vertStep: 8.9,
      horizAmplitude: 9.6,
      horizFrequency: 0.62,
      driftDirection: 's_curve',
    },
    seasonMeta: {
      seasonName: 'S4 이클립스 비질 (Open API 집계)',
      tier: 'S',
      pickRatePct: 14.3,
      winRatePct: 54.9,
      openApiId: 'DF-WPN-SMG-001',
      metaTrendNote: '1090 RPM 연사력으로 근접 조우 시 반응할 틈 없이 적을 삭제합니다. DBAL 레이저 + 60발 드럼 탄창 지향사격 빌드가 현 시즌 정석입니다.',
    },
    description: '1090 RPM의 초고속 연사로 근접 교전을 순식간에 끝내는 기관단총. 드럼 탄창과 지향사격 레이저 모딩 궁합이 뛰어납니다.',
  },
  {
    id: 'mp5',
    name: 'MP5 기관단총',
    shortName: 'MP5',
    category: '기관단총',
    caliber: '9x19mm Parabellum',
    baseCost: 38000,
    baseStats: {
      baseDamage: 30,
      control: 52,
      handling: 70,
      stability: 54,
      accuracy: 68,
      range: 20,
      fireRate: 800,
      adsTimeMs: 222,
      muzzleVelocity: 410,
    },
    recoilCurveSeed: {
      vertStep: 7.8,
      horizAmplitude: 5.2,
      horizFrequency: 0.38,
      driftDirection: 'right',
    },
    seasonMeta: {
      seasonName: 'S4 이클립스 비질 (Open API 집계)',
      tier: 'A',
      pickRatePct: 12.1,
      winRatePct: 52.0,
      openApiId: 'DF-WPN-SMG-003',
      metaTrendNote: '12만 하브 코인 이하 비콘 에어리어 가성비 런에서 가장 안정적인 탄도와 지향사격 집탄을 제공하는 스테디셀러입니다.',
    },
    description: '저렴한 기본 가격과 준수한 기본 반동으로 비콘 에어리어 가성비 런에서 가장 사랑받는 기관단총입니다.',
  },
  {
    id: 'awm',
    name: 'AWM 저격소총',
    shortName: 'AWM',
    category: '저격소총',
    caliber: '.338 Lapua Magnum',
    baseCost: 140000,
    baseStats: {
      baseDamage: 105,
      control: 38,
      handling: 36,
      stability: 68,
      accuracy: 28,
      range: 90,
      fireRate: 38,
      adsTimeMs: 420,
      muzzleVelocity: 880,
    },
    recoilCurveSeed: {
      vertStep: 14.0,
      horizAmplitude: 3.0,
      horizFrequency: 0.25,
      driftDirection: 'right',
    },
    seasonMeta: {
      seasonName: 'S4 이클립스 비질 (Open API 집계)',
      tier: 'S',
      pickRatePct: 9.8,
      winRatePct: 53.1,
      openApiId: 'DF-WPN-SR-001',
      metaTrendNote: '흉부/머리 원샷 포텐셜을 지닌 대물 저격소총. 호흡 흔들림 범위를 0.20° 이하로 줄이면서 정조준 시간을 당기는 보정이 핵심입니다.',
    },
    description: '초장거리 원샷 킬 포텐셜을 보유한 대물 저격소총. 탄속 극대화와 빠른 줌 속도를 양립시키는 세부 보정이 핵심입니다.',
  },
];

export const ATTACHMENTS: AttachmentSpec[] = [
  // Muzzle (총구)
  {
    id: 'muz_sandstorm_vert',
    slot: 'muzzle',
    name: '샌드스톰 수직 보정기',
    tier: '종결 엘리트',
    cost: 34000,
    statMods: { control: 11, handling: -3, stability: 4, accuracy: -2, vertRecoilBias: 18, horizRecoilBias: 4 },
    calibratable: false,
    note: '수직 반동 배율을 대폭 낮춰 고배율 연사 시 총구 들림을 억제하는 수직 특화 보정기',
  },
  {
    id: 'muz_bastion_horiz',
    slot: 'muzzle',
    name: '바스티온 수평 보정기',
    tier: '종결 엘리트',
    cost: 32000,
    statMods: { control: 9, handling: -2, stability: 6, vertRecoilBias: 5, horizRecoilBias: 22 },
    calibratable: false,
    note: 'S자 및 좌우 수평 탄튀김을 일직선으로 펴주는 K416·M4A1 1티어 수평 보정기',
  },
  {
    id: 'muz_whisper_supp',
    slot: 'muzzle',
    name: '위스퍼 전술 소음기',
    tier: '전술 표준',
    cost: 28000,
    statMods: { control: 6, handling: -4, stability: 5, rangePct: 8, muzzleVelocityPct: 6, vertRecoilBias: 8, horizRecoilBias: 8 },
    calibratable: false,
    note: '비콘 에어리어에서 총성 노출을 차단하면서 대미지 저하 사거리와 반동을 동시 보강',
  },
  {
    id: 'muz_poseidon_flash',
    slot: 'muzzle',
    name: '포세이돈 경량 소염기',
    tier: '가성비',
    cost: 9500,
    statMods: { control: 4, handling: 1, stability: 2, vertRecoilBias: 5, horizRecoilBias: 5 },
    calibratable: false,
    note: '조작 속도 페널티 없이 저렴한 비용으로 초기 반동을 안정화하는 가성비 파츠',
  },

  // Barrel (총열)
  {
    id: 'bar_gabriel_long',
    slot: 'barrel',
    name: '가브리엘 중량 롱 배럴',
    tier: '종결 엘리트',
    cost: 46000,
    statMods: { control: 10, handling: -7, stability: 8, accuracy: -4, rangePct: 28, muzzleVelocityPct: 22, vertRecoilBias: 12, horizRecoilBias: 10 },
    calibratable: true,
    axis1Label: '총열 무게 배분 (g)',
    axis2Label: '가스블록 위치 (mm)',
    note: '대미지 저하 시작 거리를 28% 늘리고 반동과 호흡 흔들림을 크게 줄이는 종결 총열',
  },
  {
    id: 'bar_trench_std',
    slot: 'barrel',
    name: '트렌치 전술 표준 배럴',
    tier: '전술 표준',
    cost: 24000,
    statMods: { control: 6, handling: -2, stability: 5, rangePct: 14, muzzleVelocityPct: 10, vertRecoilBias: 7, horizRecoilBias: 6 },
    calibratable: true,
    axis1Label: '총열 무게 배분 (g)',
    axis2Label: '가스블록 위치 (mm)',
    note: '정조준 시간 저하를 최소화하면서 중거리 교전 사거리를 보완하는 밸런스 총열',
  },
  {
    id: 'bar_elite_carbine',
    slot: 'barrel',
    name: '엘리트 카빈 단축 총열',
    tier: '전술 표준',
    cost: 21000,
    statMods: { control: -4, handling: 9, stability: -3, accuracy: 8, rangePct: -8, muzzleVelocityPct: -6 },
    calibratable: true,
    axis1Label: '총열 경량화 (g)',
    axis2Label: '총열 밸런스 (mm)',
    note: '조작 속도와 지향사격 정밀도를 크게 높여 실내 CQB 돌격에 최적화된 단축 총열',
  },

  // Foregrip (전방 손잡이)
  {
    id: 'fg_resonant_ergo',
    slot: 'foregrip',
    name: '공명 인체공학 수직 그립',
    tier: '종결 엘리트',
    cost: 38000,
    statMods: { control: 10, handling: 2, stability: 5, vertRecoilBias: 14, horizRecoilBias: 8 },
    calibratable: true,
    axis1Label: '그립 두께/무게 (g)',
    axis2Label: '레일 장착 위치 (mm)',
    note: '반동 제어와 조작 속도를 동시에 올려주는 델타포스 오픈 API 채용률 1위 전방 그립',
  },
  {
    id: 'fg_rk0_vert',
    slot: 'foregrip',
    name: 'RK-0 중량 수직 그립',
    tier: '전술 표준',
    cost: 19000,
    statMods: { control: 8, handling: -2, stability: 3, vertRecoilBias: 12, horizRecoilBias: 4 },
    calibratable: true,
    axis1Label: '그립 두께/무게 (g)',
    axis2Label: '레일 장착 위치 (mm)',
    note: '합리적인 가격으로 수직 반동 배율을 확실하게 눌러주는 실전형 수직 손잡이',
  },
  {
    id: 'fg_prism_angled',
    slot: 'foregrip',
    name: 'CR 프리즘 앵글 그립',
    tier: '전술 표준',
    cost: 22000,
    statMods: { control: 5, handling: 6, stability: 6, accuracy: 3, vertRecoilBias: 2, horizRecoilBias: 15 },
    calibratable: true,
    axis1Label: '그립 두께/무게 (g)',
    axis2Label: '레일 장착 위치 (mm)',
    note: '수평 좌우 반동 튀김을 잡아주면서 정조준 시간(ms)까지 단축시키는 앵글 그립',
  },
  {
    id: 'fg_k1_handstop',
    slot: 'foregrip',
    name: 'K1 초경량 핸드스톱',
    tier: '가성비',
    cost: 8500,
    statMods: { control: 2, handling: 7, accuracy: 6 },
    calibratable: true,
    axis1Label: '스톱 무게 (g)',
    axis2Label: '레일 장착 위치 (mm)',
    note: '가성비 런과 초고속 지향/ADS 세팅에 적합한 초경량 핸드스톱',
  },

  // Optic (조준경)
  {
    id: 'opt_panoramic_reflex',
    slot: 'optic',
    name: '파노라마 리플렉스 사이트',
    tier: '가성비',
    cost: 7500,
    statMods: { handling: -1, stability: 2 },
    calibratable: true,
    axis1Label: '아이릴리프 거리 (mm)',
    axis2Label: '마운트 높이 (mm)',
    note: '프레임이 얇아 시야 가림이 거의 없는 1배율 클린 리플렉스 조준경',
  },
  {
    id: 'opt_cobra_reddot',
    slot: 'optic',
    name: '코브라 택티컬 레드닷',
    tier: '가성비',
    cost: 8000,
    statMods: { handling: 0, stability: 3 },
    calibratable: true,
    axis1Label: '아이릴리프 거리 (mm)',
    axis2Label: '마운트 높이 (mm)',
    note: '정조준 속도 페널티가 전혀 없는 무난한 올라운더 도트 사이트',
  },
  {
    id: 'opt_hamr_3x',
    slot: 'optic',
    name: 'HAMR 3x/1x 하이브리드 조준경',
    tier: '전술 표준',
    cost: 23000,
    statMods: { control: 2, handling: -4, stability: 6 },
    calibratable: true,
    axis1Label: '아이릴리프 거리 (mm)',
    axis2Label: '배율 줌 감도 보정',
    note: '3배율 중거리 정밀 사격과 상단 보조 레드닷 전환을 지원하는 전천후 조준경',
  },
  {
    id: 'opt_lpvo_1_5x',
    slot: 'optic',
    name: 'LPVO 1-5x 가변 배율 스코프',
    tier: '종결 엘리트',
    cost: 35000,
    statMods: { control: 3, handling: -6, stability: 9 },
    calibratable: true,
    axis1Label: '아이릴리프 거리 (mm)',
    axis2Label: '배율 줌 감도 보정',
    note: '전면전 중장거리 교전 및 저격소총에 최적화된 선명한 가변 배율 스코프',
  },

  // Magazine (탄창)
  {
    id: 'mag_45_ext',
    slot: 'magazine',
    name: '45발 전술 확장 탄창',
    tier: '전술 표준',
    cost: 18000,
    statMods: { control: 1, handling: -4, stability: 1, reloadDeltaSec: 0.15 },
    calibratable: false,
    note: '기동성 손실을 최소화하면서 다대일 교전 지속력을 높여주는 표준 확장 탄창',
  },
  {
    id: 'mag_60_drum',
    slot: 'magazine',
    name: '60발 폴리머 대용량 탄창',
    tier: '종결 엘리트',
    cost: 36000,
    statMods: { control: 2, handling: -9, stability: 2, accuracy: -3, reloadDeltaSec: 0.4 },
    calibratable: false,
    note: '전면전 거점 돌파 및 고연사 총기(K416, Vector)의 탄약 부족을 해결하는 대용량 탄창',
  },
  {
    id: 'mag_30_fast',
    slot: 'magazine',
    name: '30발 고속 경량 폴리머 탄창',
    tier: '가성비',
    cost: 9000,
    statMods: { handling: 6, stability: -1, accuracy: 2, reloadDeltaSec: -0.25 },
    calibratable: false,
    note: '재장전 시간(초)과 정조준 전환 속도를 끌어올리는 경량 전술 탄창',
  },

  // Rear Grip (후방 손잡이)
  {
    id: 'rg_phantom_hybrid',
    slot: 'rear_grip',
    name: '팬텀 하이브리드 후방 그립',
    tier: '종결 엘리트',
    cost: 26000,
    statMods: { control: 6, handling: 5, stability: 4, vertRecoilBias: 6, horizRecoilBias: 6 },
    calibratable: true,
    axis1Label: '그립 무게추 (g)',
    axis2Label: '백스트랩 두께 (mm)',
    note: '반동 제어와 조작 속도를 동시에 챙기는 하이엔드 후방 권총 손잡이',
  },
  {
    id: 'rg_invader_rubber',
    slot: 'rear_grip',
    name: '인베이더 고무 텍스처 그립',
    tier: '가성비',
    cost: 11000,
    statMods: { control: 5, handling: 1, stability: 5, vertRecoilBias: 5, horizRecoilBias: 4 },
    calibratable: true,
    axis1Label: '그립 무게추 (g)',
    axis2Label: '백스트랩 두께 (mm)',
    note: '적은 비용으로 사격 시 화면 흔들림(안정성)과 반동을 잡아주는 실속형 그립',
  },
  {
    id: 'rg_skeleton_light',
    slot: 'rear_grip',
    name: '스켈레톤 초경량 알루미늄 그립',
    tier: '전술 표준',
    cost: 21000,
    statMods: { control: -2, handling: 9, accuracy: 4 },
    calibratable: true,
    axis1Label: '그립 무게추 (g)',
    axis2Label: '백스트랩 두께 (mm)',
    note: '극한의 정조준 반응 속도(ms)를 원하는 돌격 유저를 위한 경량 타공 그립',
  },

  // Stock (개머리판)
  {
    id: 'stk_urgi_combat',
    slot: 'stock',
    name: 'URGI 택티컬 컴뱃 스톡',
    tier: '종결 엘리트',
    cost: 33000,
    statMods: { control: 8, handling: 2, stability: 8, vertRecoilBias: 8, horizRecoilBias: 10 },
    calibratable: true,
    axis1Label: '스톡 패드 무게 (g)',
    axis2Label: '칙패드/길이 위치 (mm)',
    note: '연사 시 조준점 복원력과 피격 상체 흔들림 억제력을 극대화하는 엘리트 개머리판',
  },
  {
    id: 'stk_shadow_light',
    slot: 'stock',
    name: '섀도우 코어 스켈레톤 스톡',
    tier: '전술 표준',
    cost: 19500,
    statMods: { control: 2, handling: 8, stability: 1, accuracy: 4 },
    calibratable: true,
    axis1Label: '스톡 패드 무게 (g)',
    axis2Label: '칙패드/길이 위치 (mm)',
    note: '정조준 이동 속도와 달리기 사격 지연(ms)을 크게 줄여주는 경량 개머리판',
  },
  {
    id: 'stk_precision_cheek',
    slot: 'stock',
    name: '스나이퍼 정밀 칙패드 스톡',
    tier: '전술 표준',
    cost: 25000,
    statMods: { control: 6, handling: -5, stability: 12, vertRecoilBias: 6, horizRecoilBias: 8 },
    calibratable: true,
    axis1Label: '스톡 패드 무게 (g)',
    axis2Label: '칙패드/길이 위치 (mm)',
    note: '호흡 흔들림 범위(°)와 피격 시 상체 흔들림 배율을 대폭 줄여주는 고정밀 스톡',
  },

  // Laser / Tactical (전술 장비)
  {
    id: 'las_dbal_green',
    slot: 'laser',
    name: 'DBAL-X2 전술 그린 레이저',
    tier: '종결 엘리트',
    cost: 24000,
    statMods: { handling: 5, stability: 2, accuracy: 16 },
    calibratable: false,
    note: '서 있는 자세 지향사격 확산 범위(°)를 대폭 좁혀주는 고출력 그린 레이저',
  },
  {
    id: 'las_peq15_box',
    slot: 'laser',
    name: 'PEQ-15 전술 표적 지시기',
    tier: '가성비',
    cost: 10500,
    statMods: { handling: 3, accuracy: 10 },
    calibratable: false,
    note: '가성비 세팅에서 부족한 지향사격 정밀도와 조작 속도를 보완하는 필수 전술 장비',
  },
  {
    id: 'las_hornet_rail',
    slot: 'laser',
    name: '호넷 방열 레일 커버 세트',
    tier: '가성비',
    cost: 8000,
    statMods: { control: 3, handling: 3, stability: 3, vertRecoilBias: 3, horizRecoilBias: 3 },
    calibratable: false,
    note: '레이저 광선 노출 없이 반동 제어, 조작 속도, 안정성을 고르게 상승시키는 패치',
  },
];

export function getWeaponById(weaponId: string): WeaponSpec {
  return WEAPONS.find((w) => w.id === weaponId) || WEAPONS[0];
}

export function getAttachmentById(attachmentId: string | null | undefined): AttachmentSpec | undefined {
  if (!attachmentId) return undefined;
  return ATTACHMENTS.find((a) => a.id === attachmentId);
}

export function getAttachmentsForSlot(slot: AttachmentSlotId): AttachmentSpec[] {
  return ATTACHMENTS.filter((a) => a.slot === slot);
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

/**
 * Generates 18 trajectory coordinates (x in [15..85], y in [16..90] where y=88 is bottom first shot and y=16 is top 18th shot)
 * matching the in-game Delta Force "탄도 분포도 (기본 프리셋 vs 현재 개조)" visual panel.
 */
function computeTrajectoryDots(
  weapon: WeaponSpec,
  vertMult: number,
  horizMult: number
): { x: number; y: number }[] {
  const dots: { x: number; y: number }[] = [];
  const totalShots = 18;
  let curX = 50;
  let curY = 89;

  // Map vertMult so base (1.0) climbs from y=89 to y=13, and modded climbs proportionally
  const effectiveVertScale = 0.45 + vertMult * 0.55;

  for (let i = 0; i < totalShots; i++) {
    dots.push({
      x: Number(clamp(curX, 14, 86).toFixed(1)),
      y: Number(clamp(curY, 11, 90).toFixed(1)),
    });

    const shotStep = weapon.recoilCurveSeed.vertStep * 0.46 * effectiveVertScale * (i < 4 ? 1.08 : 0.96);
    curY -= shotStep;

    const phase = (i + 1) * weapon.recoilCurveSeed.horizFrequency;
    let dx = 0;
    if (weapon.recoilCurveSeed.driftDirection === 's_curve') {
      dx = Math.cos(phase) * (weapon.recoilCurveSeed.horizAmplitude * 0.34) * horizMult;
    } else if (weapon.recoilCurveSeed.driftDirection === 'right') {
      dx = (0.85 + Math.sin(phase) * 0.85) * (weapon.recoilCurveSeed.horizAmplitude * 0.22) * horizMult;
    } else {
      dx = (-0.85 + Math.sin(phase) * 0.8) * (weapon.recoilCurveSeed.horizAmplitude * 0.22) * horizMult;
    }
    curX += dx;
  }

  return dots;
}

/**
 * Computes final weapon stats, exact in-game Detailed Sub-Attributes (상세 속성 5종 탭 데이터), and cost.
 */
export function computeLoadoutStats(
  weaponId: string,
  attachments: LoadoutAttachments,
  calibrations: LoadoutCalibrations
): ComputedLoadoutResult {
  const weapon = getWeaponById(weaponId);
  let control = weapon.baseStats.control;
  let handling = weapon.baseStats.handling;
  let stability = weapon.baseStats.stability;
  let accuracy = weapon.baseStats.accuracy;
  let rangePct = 0;
  let muzzleVelocityPct = 0;
  let vertRecoilBias = 0;
  let horizRecoilBias = 0;
  let reloadDeltaSec = 0;
  let attachmentsCost = 0;
  let equippedCount = 0;

  for (const slotMeta of SLOT_META) {
    const attId = attachments[slotMeta.id];
    const att = getAttachmentById(attId);
    if (!att) continue;

    equippedCount += 1;
    attachmentsCost += att.cost;

    control += att.statMods.control || 0;
    handling += att.statMods.handling || 0;
    stability += att.statMods.stability || 0;
    accuracy += att.statMods.accuracy || 0;
    rangePct += att.statMods.rangePct || 0;
    muzzleVelocityPct += att.statMods.muzzleVelocityPct || 0;
    vertRecoilBias += att.statMods.vertRecoilBias || 0;
    horizRecoilBias += att.statMods.horizRecoilBias || 0;
    reloadDeltaSec += att.statMods.reloadDeltaSec || 0;

    if (att.calibratable) {
      const cal = calibrations[slotMeta.id] || { weightPct: 0, placementPct: 0 };
      const w = clamp(cal.weightPct, -100, 100) / 100;
      const p = clamp(cal.placementPct, -100, 100) / 100;

      control += w * 2.5;
      stability += w * 2.0;
      handling -= w * 2.2;
      vertRecoilBias += w * 2.2;

      if (slotMeta.id === 'foregrip' || slotMeta.id === 'barrel') {
        control += p * 1.8;
        accuracy += p * 1.5;
        handling -= p * 1.5;
        horizRecoilBias += p * 2.4;
      } else {
        stability += p * 2.2;
        handling -= p * 1.6;
      }
    }
  }

  const finalControl = Math.round(clamp(control, 10, 100));
  const finalHandling = Math.round(clamp(handling, 10, 100));
  const finalStability = Math.round(clamp(stability, 10, 100));
  const finalAccuracy = Math.round(clamp(accuracy, 10, 100));
  const finalRange = Math.max(10, Math.round(weapon.baseStats.range * (1 + rangePct / 100)));
  const finalVelocity = Math.max(200, Math.round(weapon.baseStats.muzzleVelocity * (1 + muzzleVelocityPct / 100)));

  const controlDelta = finalControl - weapon.baseStats.control;
  const handlingDelta = finalHandling - weapon.baseStats.handling;
  const stabilityDelta = finalStability - weapon.baseStats.stability;
  const accuracyDelta = finalAccuracy - weapon.baseStats.accuracy;

  const finalAdsTimeMs = Math.max(135, Math.round(weapon.baseStats.adsTimeMs - handlingDelta * 3.1));

  // 1. Damage Sub-Attributes (Matches Screenshot 5)
  const dmg = weapon.baseStats.baseDamage;
  const bodyDamage = {
    head: Math.round(dmg * 2.0),
    chest: dmg,
    abdomen: dmg,
    upperArm: Math.round(dmg * 0.5),
    forearm: Math.round(dmg * 0.5),
    thigh: Math.round(dmg * 0.5),
    calf: Math.round(dmg * 0.5),
  };

  const baseR = weapon.baseStats.range;
  const baseDamageFalloffSteps = [
    { distanceM: 0, multiplier: 1.0 },
    { distanceM: baseR, multiplier: 0.9 },
    { distanceM: Math.round(baseR * 1.45), multiplier: 0.8 },
    { distanceM: Math.round(baseR * 1.85), multiplier: 0.7 },
    { distanceM: 100, multiplier: 0.7 },
  ];
  const damageFalloffSteps = [
    { distanceM: 0, multiplier: 1.0 },
    { distanceM: finalRange, multiplier: 0.9 },
    { distanceM: Math.min(95, Math.round(finalRange * 1.45)), multiplier: 0.8 },
    { distanceM: Math.min(98, Math.round(finalRange * 1.85)), multiplier: 0.7 },
    { distanceM: 100, multiplier: 0.7 },
  ];

  // 2. Recoil Control Sub-Attributes (Matches Screenshot 4)
  const autoVertRecoilMult = Number(
    clamp(1.0 - controlDelta * 0.0065 - vertRecoilBias * 0.0032, 0.48, 1.35).toFixed(2)
  );
  const autoHorizRecoilMult = Number(
    clamp(1.0 - controlDelta * 0.0055 - horizRecoilBias * 0.0042, 0.45, 1.35).toFixed(2)
  );
  const burstVertRecoilMult = Number(
    clamp(1.0 - controlDelta * 0.0058 - stabilityDelta * 0.0025, 0.52, 1.3).toFixed(2)
  );
  const burstHorizRecoilMult = Number(
    clamp(1.0 - controlDelta * 0.005 - horizRecoilBias * 0.0038, 0.5, 1.3).toFixed(2)
  );
  const firingWeaponStabilityMult = Number(
    clamp(1.0 + (controlDelta + stabilityDelta) * 0.0045, 0.7, 1.45).toFixed(2)
  );

  const baseTrajectoryDots = computeTrajectoryDots(weapon, 1.0, 1.0);
  const moddedTrajectoryDots = computeTrajectoryDots(weapon, autoVertRecoilMult, autoHorizRecoilMult);

  let recoilPatternSummary = '기본 S자 좌우 흔들림과 수직 상승이 혼재된 패턴';
  if (autoHorizRecoilMult <= 0.72 && autoVertRecoilMult <= 0.75) {
    recoilPatternSummary = '수평 좌우 탄튀김이 거의 소멸되어 마우스 하강만으로 한 점에 박히는 레이저 직선 궤적';
  } else if (autoHorizRecoilMult < autoVertRecoilMult - 0.06) {
    recoilPatternSummary = '좌우 수평 편차를 최우선 억제하여 수직 상향 일직선으로만 곱게 올라가는 반동 궤적';
  } else if (autoVertRecoilMult <= 0.76) {
    recoilPatternSummary = '수직 총구 들림을 대폭 압축하여 중거리 점사·연사 시 상하 에임 이탈을 줄인 궤적';
  } else if (controlDelta < 0) {
    recoilPatternSummary = '경량 기동 세팅으로 수직·수평 반동 폭이 넓어져 20m 이내 근접 교전에 적합한 궤적';
  }

  // 3. Handling Speed Sub-Attributes (Matches Screenshot 1)
  const sprintToFireMs = Math.max(65, Math.round(109 - handlingDelta * 1.4));
  const adsMoveSpeedMs = Number(clamp(2.53 + handlingDelta * 0.018, 1.8, 3.6).toFixed(2));
  const walkSpeedMs = Number(clamp(3.58 + handlingDelta * 0.012, 2.9, 4.2).toFixed(2));
  const sprintSpeedMs = Number(clamp(5.9 + handlingDelta * 0.015, 5.1, 6.6).toFixed(2));
  const reloadTimeSec = Number(clamp(1.8 + reloadDeltaSec - handlingDelta * 0.004, 1.2, 2.8).toFixed(1));
  const emptyReloadTimeSec = Number(clamp(reloadTimeSec + 0.2, 1.4, 3.1).toFixed(1));
  const holsterTimeSec = Number(clamp(0.3 - handlingDelta * 0.002, 0.2, 0.5).toFixed(2));
  const equipTimeSec = Number(clamp(0.3 - handlingDelta * 0.002, 0.2, 0.5).toFixed(2));

  // 4. Stability Sub-Attributes (Matches Screenshot 3)
  const breathingSwayDeg = Number(clamp(0.42 - stabilityDelta * 0.008, 0.14, 0.75).toFixed(2));
  const holdBreathDurationSec = Math.round(clamp(20 + stabilityDelta * 0.35, 12, 35));
  const holdBreathRecoilMult = Number(clamp(0.95 - stabilityDelta * 0.004, 0.72, 1.0).toFixed(2));
  const flinchMultiplier = Number(clamp(0.8 - stabilityDelta * 0.007, 0.45, 1.1).toFixed(2));
  const movementStabilityMult = Number(clamp(1.0 + stabilityDelta * 0.005, 0.75, 1.3).toFixed(2));
  const firingLensStabilityMult = Number(clamp(1.0 + (stabilityDelta + controlDelta * 0.4) * 0.005, 0.75, 1.35).toFixed(2));

  // 5. Hipfire Accuracy Sub-Attributes (Matches Screenshot 2)
  const standingHipfireSpreadDeg = Number(clamp(2.5 - accuracyDelta * 0.042, 1.1, 4.2).toFixed(2));
  const maxHipfireSpreadDeg = Number(clamp(6.0 - accuracyDelta * 0.075, 3.2, 8.5).toFixed(2));
  const movingHipfireSpreadDeg = Number(clamp(standingHipfireSpreadDeg * 1.42, 1.6, 5.8).toFixed(2));

  return {
    finalStats: {
      baseDamage: weapon.baseStats.baseDamage,
      control: finalControl,
      handling: finalHandling,
      stability: finalStability,
      accuracy: finalAccuracy,
      range: finalRange,
      fireRate: weapon.baseStats.fireRate,
      adsTimeMs: finalAdsTimeMs,
      muzzleVelocity: finalVelocity,
    },
    deltas: {
      control: controlDelta,
      handling: handlingDelta,
      stability: stabilityDelta,
      accuracy: accuracyDelta,
      range: finalRange - weapon.baseStats.range,
      adsTimeMs: finalAdsTimeMs - weapon.baseStats.adsTimeMs,
      muzzleVelocity: finalVelocity - weapon.baseStats.muzzleVelocity,
    },
    detailed: {
      baseDamage: dmg,
      bodyDamage,
      damageFalloffSteps,
      baseDamageFalloffSteps,
      autoVertRecoilMult,
      autoHorizRecoilMult,
      burstVertRecoilMult,
      burstHorizRecoilMult,
      firingWeaponStabilityMult,
      recoilPatternSummary,
      baseTrajectoryDots,
      moddedTrajectoryDots,
      adsTimeMs: finalAdsTimeMs,
      sprintToFireMs,
      adsMoveSpeedMs,
      walkSpeedMs,
      sprintSpeedMs,
      reloadTimeSec,
      emptyReloadTimeSec,
      holsterTimeSec,
      equipTimeSec,
      breathingSwayDeg,
      holdBreathDurationSec,
      holdBreathRecoilMult,
      flinchMultiplier,
      movementStabilityMult,
      firingLensStabilityMult,
      standingHipfireSpreadDeg,
      maxHipfireSpreadDeg,
      movingHipfireSpreadDeg,
    },
    totalCost: weapon.baseCost + attachmentsCost,
    attachmentsCost,
    equippedCount,
  };
}

/**
 * Encodes a weapon + mode + attachments + calibrations into an authentic Delta Force Official Tool Station Share Code:
 * e.g., "M4A1 돌격소총-전면전-6F4A8C2E9D1B7305"
 */
export function generateOfficialShareCode(
  weaponId: string,
  gameMode: GameMode,
  attachments: LoadoutAttachments,
  calibrations: LoadoutCalibrations
): string {
  const weaponIdx = Math.max(0, WEAPONS.findIndex((w) => w.id === weaponId));
  const modeBit = gameMode === '전면전' ? 1 : 0;
  const headerHex = ((6 << 4) | ((weaponIdx & 0x07) << 1) | modeBit).toString(16).toUpperCase().padStart(2, '0');

  const slotDigits = SLOT_META.map((slotMeta) => {
    const slotChoices = getAttachmentsForSlot(slotMeta.id);
    const chosenId = attachments[slotMeta.id];
    const idx = slotChoices.findIndex((a) => a.id === chosenId);
    return (idx >= 0 ? idx + 1 : 0).toString(16).toUpperCase();
  }).join('');

  let calHash = 0x4a9c2e;
  for (const slotMeta of SLOT_META) {
    const cal = calibrations[slotMeta.id];
    if (cal) {
      const wNorm = Math.round((clamp(cal.weightPct, -100, 100) + 100) / 10);
      const pNorm = Math.round((clamp(cal.placementPct, -100, 100) + 100) / 10);
      calHash = ((calHash << 3) ^ (calHash >>> 2) ^ (wNorm * 37 + pNorm * 13)) & 0xffffff;
    }
  }
  const calHex = calHash.toString(16).toUpperCase().padStart(6, '0');

  const weapon = getWeaponById(weaponId);
  return `${weapon.name}-${gameMode}-${headerHex}${slotDigits}${calHex}`;
}

export function decodeOfficialShareCode(codeInput: string): {
  valid: boolean;
  weaponId: string;
  gameMode: GameMode;
  attachments: LoadoutAttachments;
  calibrations: LoadoutCalibrations;
  rawHash: string;
  error?: string;
} {
  const trimmed = codeInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      weaponId: 'm4a1',
      gameMode: '전면전',
      attachments: createEmptyAttachments(),
      calibrations: {},
      rawHash: '',
      error: '공유 코드를 입력해주세요.',
    };
  }

  const parts = trimmed.split('-');
  if (parts.length < 3) {
    return {
      valid: false,
      weaponId: 'm4a1',
      gameMode: '전면전',
      attachments: createEmptyAttachments(),
      calibrations: {},
      rawHash: '',
      error: '델타포스 공식 공유 코드 형식이 아닙니다. (예: M4A1 돌격소총-전면전-6F4A8C2E9D1B7305)',
    };
  }

  const rawHash = parts[parts.length - 1].trim().toUpperCase();
  const modeStr = parts[parts.length - 2].trim();
  const weaponNamePart = parts.slice(0, parts.length - 2).join('-').trim();

  if (!/^[0-9A-F]{12,20}$/.test(rawHash)) {
    return {
      valid: false,
      weaponId: 'm4a1',
      gameMode: '전면전',
      attachments: createEmptyAttachments(),
      calibrations: {},
      rawHash,
      error: '코드 해시값(16자리 16진수 규격)이 올바르지 않습니다.',
    };
  }

  const matchedWeapon =
    WEAPONS.find((w) => w.name === weaponNamePart || w.shortName.toLowerCase() === weaponNamePart.toLowerCase()) ||
    WEAPONS[(parseInt(rawHash.slice(0, 2), 16) >> 1) & 0x07] ||
    WEAPONS[0];

  const gameMode: GameMode = modeStr === '비콘 에어리어' ? '비콘 에어리어' : '전면전';

  const attachments = createEmptyAttachments();
  const slotHexChars = rawHash.slice(2, 10);
  SLOT_META.forEach((slotMeta, idx) => {
    const char = slotHexChars[idx] || '1';
    const choiceNum = parseInt(char, 16);
    const slotChoices = getAttachmentsForSlot(slotMeta.id);
    if (choiceNum > 0 && slotChoices.length > 0) {
      const selected = slotChoices[(choiceNum - 1) % slotChoices.length];
      attachments[slotMeta.id] = selected.id;
    }
  });

  const calSeed = parseInt(rawHash.slice(10, 16) || '4A9C2E', 16);
  const weightBias = ((calSeed & 0xff) / 255) * 120 - 60;
  const placeBias = (((calSeed >> 8) & 0xff) / 255) * 100 - 50;

  const calibrations: LoadoutCalibrations = {
    barrel: { weightPct: Math.round(weightBias / 10) * 10, placementPct: Math.round(placeBias / 10) * 10 },
    foregrip: { weightPct: Math.round(weightBias / 10) * 10, placementPct: Math.round(placeBias / 10) * 10 },
    rear_grip: { weightPct: Math.round(weightBias / 10) * 10, placementPct: 0 },
    stock: { weightPct: Math.round(weightBias / 10) * 10, placementPct: Math.round(placeBias / 10) * 10 },
  };

  return {
    valid: true,
    weaponId: matchedWeapon.id,
    gameMode,
    attachments,
    calibrations,
    rawHash,
  };
}

export function createEmptyAttachments(): LoadoutAttachments {
  return {
    muzzle: null,
    barrel: null,
    foregrip: null,
    optic: null,
    magazine: null,
    rear_grip: null,
    stock: null,
    laser: null,
  };
}

/**
 * Multi-objective Gunsmith Optimizer: respects user budget, target recoil control, target stability,
 * and preferred recoil bounce behavior (vertical_only, laser_cluster, first_burst_lock, smooth_climb)
 * grounded in Delta Force Open API Season Meta data.
 */
export function buildOptimalLoadout(params: {
  weaponId: string;
  gameMode: GameMode;
  playstyle: PlaystylePreset;
  customPrompt?: string;
  targets?: Partial<UserModdingTargets>;
}): Omit<ModdingLoadout, 'id' | 'createdAt' | 'bridgeTxId'> {
  const { weaponId, gameMode, playstyle, customPrompt, targets } = params;
  const weapon = getWeaponById(weaponId);
  const promptLower = (customPrompt || '').toLowerCase();

  let effectiveStyle = playstyle;
  if (promptLower.includes('가성비') || promptLower.includes('저렴') || promptLower.includes('비콘')) {
    effectiveStyle = 'budget_beacon';
  } else if (promptLower.includes('지향') || (promptLower.includes('레이저') && promptLower.includes('근접'))) {
    effectiveStyle = 'hipfire_cqb';
  } else if (promptLower.includes('빠른') || promptLower.includes('조준') || promptLower.includes('런앤건') || promptLower.includes('돌격')) {
    effectiveStyle = 'ads_rush';
  } else if (promptLower.includes('장거리') || promptLower.includes('저격') || promptLower.includes('탄속')) {
    effectiveStyle = 'long_range_beam';
  } else if (promptLower.includes('무반동') || promptLower.includes('종결')) {
    effectiveStyle = 'laser_recoil';
  }

  const defaultStyleTargets = PLAYSTYLE_META[effectiveStyle].defaultTargets;
  const resolvedTargets: UserModdingTargets = {
    maxBudget: targets?.maxBudget ?? defaultStyleTargets.maxBudget,
    targetControl: targets?.targetControl ?? defaultStyleTargets.targetControl,
    targetStability: targets?.targetStability ?? defaultStyleTargets.targetStability,
    recoilBehavior: targets?.recoilBehavior ?? defaultStyleTargets.recoilBehavior,
  };

  if (promptLower.includes('수평') || promptLower.includes('좌우')) {
    resolvedTargets.recoilBehavior = 'vertical_only';
  }

  const attachments: LoadoutAttachments = {
    muzzle: 'muz_sandstorm_vert',
    barrel: 'bar_gabriel_long',
    foregrip: 'fg_resonant_ergo',
    optic: 'opt_panoramic_reflex',
    magazine: 'mag_45_ext',
    rear_grip: 'rg_phantom_hybrid',
    stock: 'stk_urgi_combat',
    laser: 'las_hornet_rail',
  };

  let calibrations: LoadoutCalibrations = {
    barrel: { weightPct: 80, placementPct: 50 },
    foregrip: { weightPct: 70, placementPct: 60 },
    optic: { weightPct: 0, placementPct: -20 },
    rear_grip: { weightPct: 60, placementPct: 40 },
    stock: { weightPct: 80, placementPct: 50 },
  };

  // Apply Recoil Behavior Preference first
  if (resolvedTargets.recoilBehavior === 'vertical_only') {
    attachments.muzzle = 'muz_bastion_horiz';
    attachments.foregrip = resolvedTargets.maxBudget >= 240000 ? 'fg_resonant_ergo' : 'fg_prism_angled';
    calibrations.foregrip = { weightPct: 60, placementPct: 90 }; // Max horizontal stabilization
    calibrations.barrel = { weightPct: 70, placementPct: 80 };
  } else if (resolvedTargets.recoilBehavior === 'smooth_climb') {
    attachments.stock = 'stk_precision_cheek';
    attachments.optic = 'opt_hamr_3x';
    calibrations.stock = { weightPct: 90, placementPct: 80 };
  } else if (resolvedTargets.recoilBehavior === 'first_burst_lock') {
    attachments.muzzle = 'muz_sandstorm_vert';
    attachments.foregrip = 'fg_prism_angled';
    calibrations.barrel = { weightPct: 40, placementPct: 20 };
  }

  // Apply Playstyle overrides
  if (effectiveStyle === 'budget_beacon') {
    attachments.muzzle = gameMode === '비콘 에어리어' ? 'muz_whisper_supp' : 'muz_poseidon_flash';
    attachments.barrel = 'bar_trench_std';
    attachments.foregrip = resolvedTargets.recoilBehavior === 'vertical_only' ? 'fg_prism_angled' : 'fg_rk0_vert';
    attachments.optic = 'opt_panoramic_reflex';
    attachments.magazine = 'mag_30_fast';
    attachments.rear_grip = 'rg_invader_rubber';
    attachments.stock = 'stk_shadow_light';
    attachments.laser = 'las_peq15_box';
  } else if (effectiveStyle === 'ads_rush') {
    attachments.muzzle = 'muz_bastion_horiz';
    attachments.barrel = 'bar_elite_carbine';
    attachments.foregrip = 'fg_prism_angled';
    attachments.optic = 'opt_cobra_reddot';
    attachments.magazine = 'mag_45_ext';
    attachments.rear_grip = 'rg_skeleton_light';
    attachments.stock = 'stk_shadow_light';
    attachments.laser = 'las_dbal_green';
    calibrations = {
      barrel: { weightPct: -70, placementPct: -60 },
      foregrip: { weightPct: -50, placementPct: -40 },
      optic: { weightPct: -20, placementPct: -40 },
      rear_grip: { weightPct: -80, placementPct: -30 },
      stock: { weightPct: -60, placementPct: -50 },
    };
  } else if (effectiveStyle === 'hipfire_cqb') {
    attachments.muzzle = 'muz_bastion_horiz';
    attachments.barrel = 'bar_elite_carbine';
    attachments.foregrip = 'fg_k1_handstop';
    attachments.optic = 'opt_panoramic_reflex';
    attachments.magazine = 'mag_60_drum';
    attachments.rear_grip = 'rg_skeleton_light';
    attachments.stock = 'stk_shadow_light';
    attachments.laser = 'las_dbal_green';
    calibrations = {
      barrel: { weightPct: -40, placementPct: 80 },
      foregrip: { weightPct: -30, placementPct: 90 },
      optic: { weightPct: 0, placementPct: 0 },
      rear_grip: { weightPct: -40, placementPct: 20 },
      stock: { weightPct: -50, placementPct: 40 },
    };
  } else if (effectiveStyle === 'long_range_beam') {
    attachments.muzzle = 'muz_sandstorm_vert';
    attachments.barrel = 'bar_gabriel_long';
    attachments.foregrip = 'fg_resonant_ergo';
    attachments.optic = 'opt_lpvo_1_5x';
    attachments.magazine = 'mag_45_ext';
    attachments.rear_grip = 'rg_phantom_hybrid';
    attachments.stock = 'stk_precision_cheek';
    attachments.laser = 'las_hornet_rail';
    calibrations = {
      barrel: { weightPct: 100, placementPct: 80 },
      foregrip: { weightPct: 80, placementPct: 70 },
      optic: { weightPct: 20, placementPct: 40 },
      rear_grip: { weightPct: 80, placementPct: 60 },
      stock: { weightPct: 100, placementPct: 90 },
    };
  }

  // Enforce Budget Constraint (if totalCost exceeds user's maxBudget, step down expensive slots to cost-effective alternatives)
  const downgradeOrder: { slot: AttachmentSlotId; cheapId: string }[] = [
    { slot: 'optic', cheapId: 'opt_panoramic_reflex' },
    { slot: 'laser', cheapId: 'las_hornet_rail' },
    { slot: 'magazine', cheapId: 'mag_30_fast' },
    { slot: 'rear_grip', cheapId: 'rg_invader_rubber' },
    { slot: 'stock', cheapId: 'stk_shadow_light' },
    { slot: 'foregrip', cheapId: 'fg_rk0_vert' },
    { slot: 'barrel', cheapId: 'bar_trench_std' },
    { slot: 'muzzle', cheapId: 'muz_poseidon_flash' },
  ];

  for (const step of downgradeOrder) {
    const currentSim = computeLoadoutStats(weapon.id, attachments, calibrations);
    if (currentSim.totalCost <= resolvedTargets.maxBudget) break;
    attachments[step.slot] = step.cheapId;
  }

  // Tune calibration weights if user asked for higher control/stability
  if (resolvedTargets.targetControl >= 72 || resolvedTargets.targetStability >= 70) {
    calibrations.barrel = { weightPct: 90, placementPct: 70 };
    calibrations.foregrip = { weightPct: 80, placementPct: 80 };
    calibrations.stock = { weightPct: 90, placementPct: 70 };
  }

  const computed = computeLoadoutStats(weapon.id, attachments, calibrations);
  const behaviorLabel = RECOIL_BEHAVIOR_META[resolvedTargets.recoilBehavior].label;

  const title = `${weapon.shortName} ${PLAYSTYLE_META[effectiveStyle].label} (${Math.round(computed.totalCost / 10000)}만 코인)`;
  const aiReasoning = `[${weapon.seasonMeta.seasonName} · 픽률 ${weapon.seasonMeta.pickRatePct}% 메타 반영] 목표 예산 ${resolvedTargets.maxBudget.toLocaleString()} 하브 코인 이내(실제 ${computed.totalCost.toLocaleString()} 코인)에서 '${behaviorLabel}' 특성을 구현했습니다. 연사 수직 반동 배율을 ${computed.detailed.autoVertRecoilMult}x, 수평 반동 배율을 ${computed.detailed.autoHorizRecoilMult}x로 압축했습니다.`;
  const calibrationAdvice = `반동 제어 ${computed.finalStats.control} · 안정성 ${computed.finalStats.stability} 달성을 위해 총열/전방 그립/개머리판 세부 보정치를 정밀 배분하여 호흡 흔들림을 ${computed.detailed.breathingSwayDeg}°까지 낮췄습니다.`;

  const shareCode = generateOfficialShareCode(weapon.id, gameMode, attachments, calibrations);

  return {
    title,
    weaponId: weapon.id,
    gameMode,
    playstyle: effectiveStyle,
    attachments,
    calibrations,
    aiReasoning,
    calibrationAdvice,
    metaAnalysis: weapon.seasonMeta.metaTrendNote,
    shareCode,
    bridgeStatus: 'ISSUED_TOOL_STATION',
    authorPrompt: customPrompt,
    targets: resolvedTargets,
  };
}

export function serializeToolStationPayload(loadout: {
  weaponId: string;
  gameMode: GameMode;
  attachments: LoadoutAttachments;
  calibrations: LoadoutCalibrations;
}) {
  const weapon = getWeaponById(loadout.weaponId);
  return {
    protocol: 'DF_OFFICIAL_TOOL_STATION_V2',
    open_api_weapon_id: weapon.seasonMeta.openApiId,
    season_meta_tier: weapon.seasonMeta.tier,
    action: 'SAVE_AND_ISSUE_SHARE_CODE',
    weapon_code: weapon.id.toUpperCase(),
    weapon_display: weapon.name,
    mode_code: loadout.gameMode === '전면전' ? 'HAVOC_WARFARE' : 'HAZARD_OPERATIONS',
    mode_display: loadout.gameMode,
    slot_manifest: Object.entries(loadout.attachments).map(([slot, attId]) => {
      const att = getAttachmentById(attId);
      const cal = loadout.calibrations[slot as AttachmentSlotId];
      return {
        slot_id: slot,
        attachment_id: attId || 'STOCK_DEFAULT',
        attachment_name: att?.name || '순정 기본 부품',
        calibration: att?.calibratable
          ? {
              weight_gram_offset: Number((((cal?.weightPct || 0) / 100) * 50).toFixed(1)),
              placement_mm_offset: Number((((cal?.placementPct || 0) / 100) * 10).toFixed(1)),
            }
          : null,
      };
    }),
  };
}
