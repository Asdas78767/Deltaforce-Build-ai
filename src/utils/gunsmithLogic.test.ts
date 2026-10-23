import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLoadoutStats,
  generateOfficialShareCode,
  decodeOfficialShareCode,
  buildOptimalLoadout,
  createEmptyAttachments,
  serializeToolStationPayload,
} from './gunsmithLogic';

test('computeLoadoutStats returns exact base stats and 5-tab detailed sub-attributes when no attachments are equipped', () => {
  const empty = createEmptyAttachments();
  const result = computeLoadoutStats('m4a1', empty, {});
  assert.equal(result.equippedCount, 0);
  assert.equal(result.attachmentsCost, 0);
  assert.equal(result.totalCost, 48000);
  assert.equal(result.deltas.control, 0);
  assert.equal(result.finalStats.control, 46);
  assert.equal(result.finalStats.handling, 60);
  assert.equal(result.finalStats.stability, 51);
  assert.equal(result.finalStats.accuracy, 50);

  // Verify exact in-game Detailed Attributes (상세 속성)
  assert.equal(result.detailed.baseDamage, 34);
  assert.equal(result.detailed.bodyDamage.head, 68);
  assert.equal(result.detailed.bodyDamage.chest, 34);
  assert.equal(result.detailed.bodyDamage.upperArm, 17);
  assert.equal(result.detailed.adsTimeMs, 289);
  assert.equal(result.detailed.sprintToFireMs, 109);
  assert.equal(result.detailed.breathingSwayDeg, 0.42);
  assert.equal(result.detailed.standingHipfireSpreadDeg, 2.5);
  assert.equal(result.detailed.baseTrajectoryDots.length, 18);
  assert.equal(result.detailed.moddedTrajectoryDots.length, 18);
});

test('computeLoadoutStats applies attachment stats, recoil multipliers, and fine calibration offsets', () => {
  const attachments = {
    ...createEmptyAttachments(),
    muzzle: 'muz_sandstorm_vert', // +11 control, 34000 cost
    barrel: 'bar_gabriel_long',   // +10 control, 46000 cost, calibratable
  };
  const withoutCal = computeLoadoutStats('m4a1', attachments, {});
  const withHeavyCal = computeLoadoutStats('m4a1', attachments, {
    barrel: { weightPct: 100, placementPct: 100 },
  });

  assert.equal(withoutCal.equippedCount, 2);
  assert.equal(withoutCal.attachmentsCost, 80000);
  assert.ok(withHeavyCal.finalStats.control > withoutCal.finalStats.control);
  assert.ok(withHeavyCal.detailed.autoVertRecoilMult < 1.0);
  assert.ok(withHeavyCal.detailed.adsTimeMs > withoutCal.detailed.adsTimeMs);
});

test('generateOfficialShareCode and decodeOfficialShareCode round-trip weapon, mode, and slots', () => {
  const built = buildOptimalLoadout({
    weaponId: 'k416',
    gameMode: '비콘 에어리어',
    playstyle: 'budget_beacon',
  });

  assert.ok(built.shareCode.startsWith('K416 돌격소총-비콘 에어리어-'));

  const decoded = decodeOfficialShareCode(built.shareCode);
  assert.equal(decoded.valid, true);
  assert.equal(decoded.weaponId, 'k416');
  assert.equal(decoded.gameMode, '비콘 에어리어');
  assert.deepEqual(decoded.attachments, built.attachments);
});

test('decodeOfficialShareCode rejects malformed code strings', () => {
  const invalid = decodeOfficialShareCode('INVALID_CODE_STRING');
  assert.equal(invalid.valid, false);
  assert.ok(invalid.error);
});

test('buildOptimalLoadout respects budget cap, recoil behavior, and Open API metadata', () => {
  const loadout = buildOptimalLoadout({
    weaponId: 'm4a1',
    gameMode: '비콘 에어리어',
    playstyle: 'laser_recoil',
    targets: {
      maxBudget: 160000,
      targetControl: 70,
      targetStability: 68,
      recoilBehavior: 'vertical_only',
    },
  });

  const stats = computeLoadoutStats(loadout.weaponId, loadout.attachments, loadout.calibrations);
  assert.ok(stats.totalCost <= 160000);
  assert.equal(loadout.targets?.recoilBehavior, 'vertical_only');

  const payload = serializeToolStationPayload(loadout);
  assert.equal(payload.protocol, 'DF_OFFICIAL_TOOL_STATION_V2');
  assert.equal(payload.open_api_weapon_id, 'DF-WPN-AR-001');
  assert.equal(payload.slot_manifest.length, 8);
});
