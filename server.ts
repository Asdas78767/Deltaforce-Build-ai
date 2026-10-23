import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  SLOT_META,
  ModdingLoadout,
  GameMode,
  PlaystylePreset,
  LoadoutAttachments,
  LoadoutCalibrations,
  AttachmentSlotId,
  UserModdingTargets,
  RECOIL_BEHAVIOR_META,
  buildOptimalLoadout,
  generateOfficialShareCode,
  decodeOfficialShareCode,
  serializeToolStationPayload,
  getWeaponById,
  getAttachmentsForSlot,
  computeLoadoutStats,
} from './src/utils/gunsmithLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const LOADOUTS_FILE = path.join(DATA_DIR, 'loadouts.json');
const BRIDGE_CONFIG_FILE = path.join(DATA_DIR, 'bridge_config.json');

export interface BridgeConfig {
  mode: 'OFFICIAL_TOOL_STATION_API' | 'HEADLESS_BOT_ACCOUNT_RELAY';
  toolStationRegion: 'KR_GLOBAL_GARE' | 'CN_WEGAME_STATION';
  botAccountUid: string;
  customRelayEndpoint: string;
  autoRegisterOnAiMod: boolean;
  totalIssuedCount: number;
}

const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  mode: 'OFFICIAL_TOOL_STATION_API',
  toolStationRegion: 'KR_GLOBAL_GARE',
  botAccountUid: 'DF-BOT-KR-8849201',
  customRelayEndpoint: 'https://toolstation-relay.deltaforce.internal/v2/gunsmith/share',
  autoRegisterOnAiMod: true,
  totalIssuedCount: 142,
};

function ensureSeedData(): { loadouts: ModdingLoadout[]; bridgeConfig: BridgeConfig } {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let bridgeConfig = { ...DEFAULT_BRIDGE_CONFIG };
  if (fs.existsSync(BRIDGE_CONFIG_FILE)) {
    try {
      bridgeConfig = { ...DEFAULT_BRIDGE_CONFIG, ...JSON.parse(fs.readFileSync(BRIDGE_CONFIG_FILE, 'utf-8')) };
    } catch {
      bridgeConfig = { ...DEFAULT_BRIDGE_CONFIG };
    }
  } else {
    fs.writeFileSync(BRIDGE_CONFIG_FILE, JSON.stringify(bridgeConfig, null, 2), 'utf-8');
  }

  const seed1 = buildOptimalLoadout({
    weaponId: 'm4a1',
    gameMode: '전면전',
    playstyle: 'laser_recoil',
    customPrompt: 'M4A1 전면전 S자 수평 반동 제거 및 70m 무반동 레이저 풀모딩 세팅',
    targets: {
      maxBudget: 420000,
      targetControl: 82,
      targetStability: 78,
      recoilBehavior: 'laser_cluster',
    },
  });
  const seed2 = buildOptimalLoadout({
    weaponId: 'k416',
    gameMode: '비콘 에어리어',
    playstyle: 'budget_beacon',
    customPrompt: 'K416 비콘 에어리어 16만 코인 이하 우측 수평 반동 억제 가성비 모딩',
    targets: {
      maxBudget: 165000,
      targetControl: 68,
      targetStability: 64,
      recoilBehavior: 'vertical_only',
    },
  });
  const seed3 = buildOptimalLoadout({
    weaponId: 'vector',
    gameMode: '비콘 에어리어',
    playstyle: 'hipfire_cqb',
    customPrompt: '벡터 행정구역 실내전 무줌 지향사격 확산 범위 1.6° 이내 세팅',
    targets: {
      maxBudget: 260000,
      targetControl: 58,
      targetStability: 55,
      recoilBehavior: 'vertical_only',
    },
  });
  const seed4 = buildOptimalLoadout({
    weaponId: 'scar_h',
    gameMode: '전면전',
    playstyle: 'long_range_beam',
    customPrompt: 'SCAR-H 어센션 중장거리 호흡 흔들림 제거 및 고탄속 모딩',
    targets: {
      maxBudget: 450000,
      targetControl: 80,
      targetStability: 86,
      recoilBehavior: 'smooth_climb',
    },
  });

  const initialLoadouts: ModdingLoadout[] = [
    {
      ...seed1,
      id: 'ld_seed_m4a1_laser',
      bridgeTxId: 'TS-KR-90841A',
      createdAt: '2026-10-22T09:15:00.000Z',
    },
    {
      ...seed2,
      id: 'ld_seed_k416_beacon',
      bridgeTxId: 'TS-KR-90842B',
      createdAt: '2026-10-22T10:30:00.000Z',
    },
    {
      ...seed3,
      id: 'ld_seed_vector_cqb',
      bridgeTxId: 'BOT-RL-77419C',
      bridgeStatus: 'SYNCED_BOT_RELAY',
      createdAt: '2026-10-22T12:45:00.000Z',
    },
    {
      ...seed4,
      id: 'ld_seed_scar_beam',
      bridgeTxId: 'TS-KR-90849D',
      createdAt: '2026-10-22T14:20:00.000Z',
    },
  ];

  fs.writeFileSync(LOADOUTS_FILE, JSON.stringify(initialLoadouts, null, 2), 'utf-8');
  return { loadouts: initialLoadouts, bridgeConfig };
}

const state = ensureSeedData();

function saveLoadouts() {
  try {
    fs.writeFileSync(LOADOUTS_FILE, JSON.stringify(state.loadouts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist loadouts:', err);
  }
}

function saveBridgeConfig() {
  try {
    fs.writeFileSync(BRIDGE_CONFIG_FILE, JSON.stringify(state.bridgeConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist bridge config:', err);
  }
}

function createBridgeTxId(mode: BridgeConfig['mode']): string {
  const prefix = mode === 'OFFICIAL_TOOL_STATION_API' ? 'TS-KR' : 'BOT-RL';
  const randHex = Math.floor(0x100000 + Math.random() * 0xefffff)
    .toString(16)
    .toUpperCase();
  return `${prefix}-${randHex}`;
}

async function generateModdingWithGemini(params: {
  weaponId: string;
  gameMode: GameMode;
  playstyle: PlaystylePreset;
  customPrompt?: string;
  targets?: Partial<UserModdingTargets>;
}): Promise<Omit<ModdingLoadout, 'id' | 'createdAt' | 'bridgeTxId'>> {
  const fallback = buildOptimalLoadout(params);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const weapon = getWeaponById(params.weaponId);
    const resolvedTargets = fallback.targets!;
    const recoilBehaviorInfo = RECOIL_BEHAVIOR_META[resolvedTargets.recoilBehavior];

    const catalogDesc = SLOT_META.map((slot) => {
      const choices = getAttachmentsForSlot(slot.id)
        .map(
          (a) =>
            `${a.id} (${a.name}, ${a.tier}, 비용:${a.cost}코인, 스탯:${JSON.stringify(a.statMods)}, 보정가능:${a.calibratable})`
        )
        .join(' | ');
      return `[${slot.id} (${slot.label})]: ${choices}`;
    }).join('\n');

    const promptText = `당신은 델타포스(Delta Force) 오픈 API 시즌 메타 데이터 및 총기 개조(Gunsmith) 전문 AI 설계 엔진입니다.
현재 시즌 메타 정보와 사용자의 목표 가격, 목표 반동 제어, 목표 안정성, 원하는 반동 탄도 궤적 특성을 정확히 반영하여 파츠 카탈로그 내에서 최적의 총기 모딩 조합과 슬롯별 세부 보정치(-100 ~ +100, 10단위 정수)를 설계하세요.

[델타포스 오픈 API 총기 텔레메트리 & 시즌 메타]
- 대상 총기: ${weapon.name} (Open API ID: ${weapon.seasonMeta.openApiId}, 기본 가격: ${weapon.baseCost} 하브 코인)
- 시즌 메타 등급: ${weapon.seasonMeta.tier} (${weapon.seasonMeta.seasonName}, 픽률 ${weapon.seasonMeta.pickRatePct}%, 교전 승률 ${weapon.seasonMeta.winRatePct}%)
- 메타 분석 요약: ${weapon.seasonMeta.metaTrendNote}
- 기본 스탯: 대미지 ${weapon.baseStats.baseDamage}, 반동 제어 ${weapon.baseStats.control}, 조작 속도 ${weapon.baseStats.handling}, 안정성 ${weapon.baseStats.stability}, 지향사격 정밀도 ${weapon.baseStats.accuracy}, 기본 정조준 시간 ${weapon.baseStats.adsTimeMs}ms

[사용자 맞춤 모딩 요구 조건]
- 게임 모드: ${params.gameMode}
- 선호 스타일 프리셋: ${params.playstyle}
- 목표 총기 모딩 예산 상한 (기본 총기 포함): ${resolvedTargets.maxBudget.toLocaleString()} 하브 코인 이하
- 목표 반동 제어 수치: ${resolvedTargets.targetControl} 이상 지향
- 목표 안정성 수치: ${resolvedTargets.targetStability} 이상 지향
- 원하는 반동 튀는 방식 제어: ${recoilBehaviorInfo.label} (${recoilBehaviorInfo.desc})
- 사용자 추가 요청사항: ${params.customPrompt || '위 예산과 반동/안정성 조건에 가장 부합하는 시즌 메타 빌드를 설계해주세요.'}

[사용 가능한 슬롯별 파츠 카탈로그]
${catalogDesc}

반드시 각 슬롯에 위 카탈로그에 존재하는 파츠 ID만 선택하고, 총 비용이 목표 예산을 초과하지 않도록 구성하세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: '모딩 빌드 제목 (한국어, 25자 이내)' },
            aiReasoning: {
              type: Type.STRING,
              description: '시즌 메타 데이터와 목표 가격/반동 제어/탄도 궤적을 어떻게 충족했는지 설명 (한국어 2~3문장)',
            },
            calibrationAdvice: {
              type: Type.STRING,
              description: '세부 보정(무게추/장착 위치)을 통해 수직/수평 반동 배율과 호흡 흔들림을 어떻게 잡았는지 요약 (한국어 1~2문장)',
            },
            metaAnalysis: {
              type: Type.STRING,
              description: '현재 시즌 오픈 API 메타 기준 이 총기와 모딩의 실전 교전 팁 (한국어 1~2문장)',
            },
            muzzle: { type: Type.STRING },
            barrel: { type: Type.STRING },
            foregrip: { type: Type.STRING },
            optic: { type: Type.STRING },
            magazine: { type: Type.STRING },
            rear_grip: { type: Type.STRING },
            stock: { type: Type.STRING },
            laser: { type: Type.STRING },
            barrelWeightPct: { type: Type.INTEGER },
            barrelPlacementPct: { type: Type.INTEGER },
            foregripWeightPct: { type: Type.INTEGER },
            foregripPlacementPct: { type: Type.INTEGER },
            rearGripWeightPct: { type: Type.INTEGER },
            rearGripPlacementPct: { type: Type.INTEGER },
            stockWeightPct: { type: Type.INTEGER },
            stockPlacementPct: { type: Type.INTEGER },
          },
          required: [
            'title',
            'aiReasoning',
            'calibrationAdvice',
            'metaAnalysis',
            'muzzle',
            'barrel',
            'foregrip',
            'optic',
            'magazine',
            'rear_grip',
            'stock',
            'laser',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) return fallback;
    const parsed = JSON.parse(rawText);

    const validateSlot = (slot: AttachmentSlotId, candidateId: string | undefined): string | null => {
      const validChoices = getAttachmentsForSlot(slot);
      const found = validChoices.find((c) => c.id === candidateId);
      return found ? found.id : fallback.attachments[slot];
    };

    const attachments: LoadoutAttachments = {
      muzzle: validateSlot('muzzle', parsed.muzzle),
      barrel: validateSlot('barrel', parsed.barrel),
      foregrip: validateSlot('foregrip', parsed.foregrip),
      optic: validateSlot('optic', parsed.optic),
      magazine: validateSlot('magazine', parsed.magazine),
      rear_grip: validateSlot('rear_grip', parsed.rear_grip),
      stock: validateSlot('stock', parsed.stock),
      laser: validateSlot('laser', parsed.laser),
    };

    const clampCal = (v: unknown, def: number) => {
      if (typeof v !== 'number' || Number.isNaN(v)) return def;
      return Math.max(-100, Math.min(100, Math.round(v / 10) * 10));
    };

    const calibrations: LoadoutCalibrations = {
      barrel: {
        weightPct: clampCal(parsed.barrelWeightPct, fallback.calibrations.barrel?.weightPct ?? 50),
        placementPct: clampCal(parsed.barrelPlacementPct, fallback.calibrations.barrel?.placementPct ?? 40),
      },
      foregrip: {
        weightPct: clampCal(parsed.foregripWeightPct, fallback.calibrations.foregrip?.weightPct ?? 50),
        placementPct: clampCal(parsed.foregripPlacementPct, fallback.calibrations.foregrip?.placementPct ?? 40),
      },
      optic: { weightPct: 0, placementPct: 0 },
      rear_grip: {
        weightPct: clampCal(parsed.rearGripWeightPct, fallback.calibrations.rear_grip?.weightPct ?? 40),
        placementPct: clampCal(parsed.rearGripPlacementPct, fallback.calibrations.rear_grip?.placementPct ?? 20),
      },
      stock: {
        weightPct: clampCal(parsed.stockWeightPct, fallback.calibrations.stock?.weightPct ?? 50),
        placementPct: clampCal(parsed.stockPlacementPct, fallback.calibrations.stock?.placementPct ?? 40),
      },
    };

    // Ensure budget cap is respected even if LLM picked pricier items
    const sim = computeLoadoutStats(weapon.id, attachments, calibrations);
    if (sim.totalCost > resolvedTargets.maxBudget) {
      return {
        ...fallback,
        title: parsed.title || fallback.title,
        aiReasoning: parsed.aiReasoning || fallback.aiReasoning,
        calibrationAdvice: parsed.calibrationAdvice || fallback.calibrationAdvice,
        metaAnalysis: parsed.metaAnalysis || weapon.seasonMeta.metaTrendNote,
      };
    }

    const shareCode = generateOfficialShareCode(weapon.id, params.gameMode, attachments, calibrations);

    return {
      title: parsed.title || fallback.title,
      weaponId: weapon.id,
      gameMode: params.gameMode,
      playstyle: params.playstyle,
      attachments,
      calibrations,
      aiReasoning: parsed.aiReasoning || fallback.aiReasoning,
      calibrationAdvice: parsed.calibrationAdvice || fallback.calibrationAdvice,
      metaAnalysis: parsed.metaAnalysis || weapon.seasonMeta.metaTrendNote,
      shareCode,
      bridgeStatus:
        state.bridgeConfig.mode === 'OFFICIAL_TOOL_STATION_API' ? 'ISSUED_TOOL_STATION' : 'SYNCED_BOT_RELAY',
      authorPrompt: params.customPrompt,
      targets: resolvedTargets,
    };
  } catch (err) {
    console.warn('Using deterministic Gunsmith AI engine fallback:', err);
    return {
      ...fallback,
      bridgeStatus:
        state.bridgeConfig.mode === 'OFFICIAL_TOOL_STATION_API' ? 'ISSUED_TOOL_STATION' : 'SYNCED_BOT_RELAY',
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Get all saved server loadouts & bridge configuration
  app.get('/api/loadouts', (_req, res) => {
    res.json({
      loadouts: state.loadouts,
      bridgeConfig: state.bridgeConfig,
    });
  });

  // 2. AI Gunsmith Modding + Tool Station / Bot Bridge Code Issuance
  app.post('/api/modding/generate', async (req, res) => {
    try {
      const {
        weaponId = 'm4a1',
        gameMode = '전면전',
        playstyle = 'laser_recoil',
        customPrompt = '',
        targets,
      } = req.body || {};

      const generated = await generateModdingWithGemini({
        weaponId,
        gameMode,
        playstyle,
        customPrompt,
        targets,
      });

      const bridgeTxId = createBridgeTxId(state.bridgeConfig.mode);
      const newLoadout: ModdingLoadout = {
        ...generated,
        id: `ld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        bridgeTxId,
        createdAt: new Date().toISOString(),
      };

      state.loadouts.unshift(newLoadout);
      state.bridgeConfig.totalIssuedCount += 1;
      saveLoadouts();
      saveBridgeConfig();

      const toolStationPayload = serializeToolStationPayload(newLoadout);

      res.json({
        loadout: newLoadout,
        toolStationPayload,
        bridgeReceipt: {
          txId: bridgeTxId,
          mode: state.bridgeConfig.mode,
          botUid: state.bridgeConfig.botAccountUid,
          endpoint: state.bridgeConfig.customRelayEndpoint,
          issuedAt: newLoadout.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'AI 모딩 및 코드 발급 중 오류가 발생했습니다.',
      });
    }
  });

  // 3. Re-issue official share code when user customizes slots or calibration sliders manually
  app.post('/api/bridge/issue-code', (req, res) => {
    try {
      const {
        weaponId = 'm4a1',
        gameMode = '전면전',
        playstyle = 'laser_recoil',
        title,
        attachments,
        calibrations,
        aiReasoning,
        calibrationAdvice,
        targets,
      } = req.body || {};

      const weapon = getWeaponById(weaponId);
      const shareCode = generateOfficialShareCode(weapon.id, gameMode, attachments, calibrations || {});
      const bridgeTxId = createBridgeTxId(state.bridgeConfig.mode);

      const newLoadout: ModdingLoadout = {
        id: `ld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: title || `${weapon.shortName} 커스텀 개조 빌드`,
        weaponId: weapon.id,
        gameMode,
        playstyle,
        attachments,
        calibrations: calibrations || {},
        aiReasoning:
          aiReasoning ||
          `${weapon.name}의 장착 파츠 및 세부 보정치를 수동 커스텀하여 툴 스테이션 서버에 신규 등록한 빌드입니다.`,
        calibrationAdvice:
          calibrationAdvice || '사용자 지정 무게 배분 및 장착 위치 보정값이 공유 코드에 반영되었습니다.',
        metaAnalysis: weapon.seasonMeta.metaTrendNote,
        shareCode,
        bridgeStatus:
          state.bridgeConfig.mode === 'OFFICIAL_TOOL_STATION_API' ? 'ISSUED_TOOL_STATION' : 'SYNCED_BOT_RELAY',
        bridgeTxId,
        createdAt: new Date().toISOString(),
        targets,
      };

      state.loadouts.unshift(newLoadout);
      state.bridgeConfig.totalIssuedCount += 1;
      saveLoadouts();
      saveBridgeConfig();

      res.json({
        loadout: newLoadout,
        toolStationPayload: serializeToolStationPayload(newLoadout),
        bridgeReceipt: {
          txId: bridgeTxId,
          mode: state.bridgeConfig.mode,
          botUid: state.bridgeConfig.botAccountUid,
          endpoint: state.bridgeConfig.customRelayEndpoint,
          issuedAt: newLoadout.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : '공유 코드 발급에 실패했습니다.',
      });
    }
  });

  // 4. Decode an existing Share Code from Server Registry or Official Hex Hash
  app.post('/api/bridge/decode', (req, res) => {
    const { shareCode = '' } = req.body || {};
    const trimmed = String(shareCode).trim();

    const existing = state.loadouts.find((l) => l.shareCode.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      return res.json({
        valid: true,
        source: 'SERVER_REGISTRY',
        loadout: existing,
      });
    }

    const decoded = decodeOfficialShareCode(trimmed);
    if (!decoded.valid) {
      return res.status(400).json({
        valid: false,
        error: decoded.error || '유효하지 않은 공유 코드입니다.',
      });
    }

    const weapon = getWeaponById(decoded.weaponId);
    const reconstructed: ModdingLoadout = {
      id: `decoded_${Date.now()}`,
      title: `${weapon.shortName} 코드 역설계 로드아웃`,
      weaponId: decoded.weaponId,
      gameMode: decoded.gameMode,
      playstyle: 'laser_recoil',
      attachments: decoded.attachments,
      calibrations: decoded.calibrations,
      aiReasoning: '공유 코드 해시 데이터를 역분석하여 복원한 총기 개조 및 세부 보정 세팅입니다.',
      calibrationAdvice: '코드 내 보정 시그니처에서 무게추 및 위치 오프셋을 복원했습니다.',
      metaAnalysis: weapon.seasonMeta.metaTrendNote,
      shareCode: trimmed,
      bridgeStatus: 'ISSUED_TOOL_STATION',
      bridgeTxId: `DEC-${decoded.rawHash.slice(0, 6)}`,
      createdAt: new Date().toISOString(),
    };

    return res.json({
      valid: true,
      source: 'HASH_DECODER',
      loadout: reconstructed,
    });
  });

  // 5. Delete a saved loadout from the server registry
  app.delete('/api/loadouts/:id', (req, res) => {
    const { id } = req.params;
    const beforeLen = state.loadouts.length;
    state.loadouts = state.loadouts.filter((l) => l.id !== id);
    if (state.loadouts.length !== beforeLen) {
      saveLoadouts();
    }
    res.json({ ok: true, loadouts: state.loadouts });
  });

  // 6. Update Tool Station / Bot Relay configuration
  app.post('/api/bridge/config', (req, res) => {
    const { mode, toolStationRegion, botAccountUid, customRelayEndpoint, autoRegisterOnAiMod } = req.body || {};
    if (mode === 'OFFICIAL_TOOL_STATION_API' || mode === 'HEADLESS_BOT_ACCOUNT_RELAY') {
      state.bridgeConfig.mode = mode;
    }
    if (toolStationRegion === 'KR_GLOBAL_GARE' || toolStationRegion === 'CN_WEGAME_STATION') {
      state.bridgeConfig.toolStationRegion = toolStationRegion;
    }
    if (typeof botAccountUid === 'string' && botAccountUid.trim()) {
      state.bridgeConfig.botAccountUid = botAccountUid.trim();
    }
    if (typeof customRelayEndpoint === 'string' && customRelayEndpoint.trim()) {
      state.bridgeConfig.customRelayEndpoint = customRelayEndpoint.trim();
    }
    if (typeof autoRegisterOnAiMod === 'boolean') {
      state.bridgeConfig.autoRegisterOnAiMod = autoRegisterOnAiMod;
    }
    saveBridgeConfig();
    res.json({ ok: true, bridgeConfig: state.bridgeConfig });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DeltaSmith AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
