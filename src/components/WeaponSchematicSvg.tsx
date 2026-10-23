import React from 'react';
import {
  AttachmentSlotId,
  LoadoutAttachments,
  SLOT_META,
  getAttachmentById,
  getWeaponById,
} from '../utils/gunsmithLogic';

interface WeaponSchematicSvgProps {
  weaponId: string;
  attachments: LoadoutAttachments;
  activeSlot: AttachmentSlotId;
  onSelectSlot: (slot: AttachmentSlotId) => void;
}

const SLOT_COORDS: Record<AttachmentSlotId, { x: number; y: number; anchorX: number; anchorY: number }> = {
  muzzle: { x: 86, y: 120, anchorX: 145, anchorY: 120 },
  barrel: { x: 225, y: 62, anchorX: 245, anchorY: 116 },
  laser: { x: 355, y: 56, anchorX: 315, anchorY: 108 },
  foregrip: { x: 265, y: 206, anchorX: 295, anchorY: 144 },
  optic: { x: 475, y: 48, anchorX: 465, anchorY: 94 },
  magazine: { x: 445, y: 224, anchorX: 448, anchorY: 168 },
  rear_grip: { x: 590, y: 218, anchorX: 556, anchorY: 164 },
  stock: { x: 725, y: 118, anchorX: 665, anchorY: 124 },
};

export const WeaponSchematicSvg: React.FC<WeaponSchematicSvgProps> = ({
  weaponId,
  attachments,
  activeSlot,
  onSelectSlot,
}) => {
  const weapon = getWeaponById(weaponId);
  const isSmg = weapon.category === '기관단총';
  const isSniper = weapon.category === '저격소총';

  return (
    <div className="relative w-full bg-[#0B1120] border border-slate-800 rounded-lg p-4 overflow-hidden">
      {/* Subtle tactical grid background */}
      <svg
        viewBox="0 0 820 265"
        className="w-full h-auto select-none"
        role="img"
        aria-label={`${weapon.name} 총기 개조 슬롯 도면`}
      >
        <defs>
          <pattern id="gunsmith-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1E293B" strokeWidth="0.7" />
          </pattern>
        </defs>

        <rect width="820" height="265" fill="url(#gunsmith-grid)" />

        {/* Crosshair reference lines */}
        <line x1="40" y1="122" x2="780" y2="122" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />
        <line x1="465" y1="20" x2="465" y2="245" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />

        {/* Weapon Silhouette Receiver & Assembly */}
        <g className="transition-opacity duration-150">
          {/* Muzzle Device */}
          <rect
            x={isSniper ? 105 : isSmg ? 185 : 132}
            y="112"
            width={attachments.muzzle ? 42 : 24}
            height="16"
            rx="2"
            fill={attachments.muzzle ? '#F59E0B' : '#334155'}
            fillOpacity={attachments.muzzle ? '0.28' : '0.4'}
            stroke={attachments.muzzle ? '#F59E0B' : '#64748B'}
            strokeWidth="1.5"
          />

          {/* Barrel & Handguard */}
          <rect
            x={isSniper ? 145 : isSmg ? 225 : 174}
            y="115"
            width={isSniper ? 235 : isSmg ? 155 : 206}
            height="10"
            fill="#475569"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          <polygon
            points={
              isSmg
                ? '265,104 380,104 380,138 265,138'
                : '235,103 385,103 385,137 225,132'
            }
            fill="#1E293B"
            stroke={attachments.barrel ? '#38BDF8' : '#64748B'}
            strokeWidth="1.5"
          />

          {/* Tactical Laser Box on top/side rail */}
          {attachments.laser && (
            <rect
              x="295"
              y="91"
              width="38"
              height="11"
              rx="2"
              fill="#10B981"
              fillOpacity="0.25"
              stroke="#10B981"
              strokeWidth="1.5"
            />
          )}

          {/* Foregrip under handguard */}
          {attachments.foregrip && (
            <polygon
              points="282,137 308,137 302,174 285,174"
              fill="#F59E0B"
              fillOpacity="0.25"
              stroke="#F59E0B"
              strokeWidth="1.5"
            />
          )}

          {/* Upper & Lower Receiver */}
          <polygon
            points="380,98 565,98 575,144 420,148 380,138"
            fill="#1E293B"
            stroke="#94A3B8"
            strokeWidth="1.8"
          />
          {/* Ejection port detail */}
          <rect x="442" y="108" width="46" height="10" rx="1" fill="#0F172A" stroke="#475569" strokeWidth="1" />

          {/* Optic on Upper Picatinny Rail */}
          {attachments.optic && (
            <g>
              <polygon
                points="435,76 502,76 495,98 442,98"
                fill="#38BDF8"
                fillOpacity="0.25"
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              <line x1="430" y1="84" x2="508" y2="84" stroke="#38BDF8" strokeWidth="1.2" />
            </g>
          )}

          {/* Magazine */}
          <polygon
            points={
              isSmg
                ? '436,146 462,146 448,206 424,204'
                : '430,146 474,146 462,208 416,202'
            }
            fill={attachments.magazine ? '#38BDF8' : '#1E293B'}
            fillOpacity={attachments.magazine ? '0.22' : '0.8'}
            stroke={attachments.magazine ? '#38BDF8' : '#64748B'}
            strokeWidth="1.5"
          />

          {/* Rear Pistol Grip */}
          <polygon
            points="532,144 568,144 586,196 550,198"
            fill={attachments.rear_grip ? '#F59E0B' : '#1E293B'}
            fillOpacity={attachments.rear_grip ? '0.22' : '0.8'}
            stroke={attachments.rear_grip ? '#F59E0B' : '#64748B'}
            strokeWidth="1.5"
          />

          {/* Buttstock Assembly */}
          <polygon
            points="568,104 705,104 705,164 672,164 645,136 572,136"
            fill={attachments.stock ? '#38BDF8' : '#1E293B'}
            fillOpacity={attachments.stock ? '0.22' : '0.8'}
            stroke={attachments.stock ? '#38BDF8' : '#64748B'}
            strokeWidth="1.5"
          />
        </g>

        {/* Interactive Attachment Callout Nodes */}
        {SLOT_META.map((slotMeta) => {
          const coord = SLOT_COORDS[slotMeta.id];
          const equippedAtt = getAttachmentById(attachments[slotMeta.id]);
          const isSelected = activeSlot === slotMeta.id;
          const strokeColor = isSelected ? '#F59E0B' : equippedAtt ? '#38BDF8' : '#475569';

          return (
            <g
              key={slotMeta.id}
              onClick={() => onSelectSlot(slotMeta.id)}
              className="cursor-pointer"
            >
              {/* Leader line from weapon part to node */}
              <line
                x1={coord.anchorX}
                y1={coord.anchorY}
                x2={coord.x}
                y2={coord.y}
                stroke={strokeColor}
                strokeWidth={isSelected ? '1.6' : '1'}
                strokeDasharray={equippedAtt ? 'none' : '3 3'}
              />
              <circle
                cx={coord.anchorX}
                cy={coord.anchorY}
                r="3.5"
                fill={strokeColor}
              />

              {/* Callout Box */}
              <rect
                x={coord.x - 62}
                y={coord.y - 18}
                width="124"
                height="36"
                rx="4"
                fill={isSelected ? '#1E293B' : '#0F172A'}
                stroke={strokeColor}
                strokeWidth={isSelected ? '1.8' : '1.1'}
              />
              <text
                x={coord.x}
                y={coord.y - 3}
                textAnchor="middle"
                fill={isSelected ? '#FBBF24' : '#94A3B8'}
                fontSize="10"
                fontWeight="600"
              >
                {slotMeta.label}
              </text>
              <text
                x={coord.x}
                y={coord.y + 11}
                textAnchor="middle"
                fill={equippedAtt ? '#F8FAFC' : '#64748B'}
                fontSize="9.5"
              >
                {equippedAtt
                  ? equippedAtt.name.length > 11
                    ? `${equippedAtt.name.slice(0, 11)}…`
                    : equippedAtt.name
                  : '순정 기본'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Bottom Legend Bar */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          <span>대상 플랫폼: {weapon.name}</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>사용 탄약: {weapon.caliber}</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>도면 슬롯을 클릭하여 파츠 및 세부 보정을 즉시 변경할 수 있습니다</span>
        </div>
        <div className="font-mono tabular-nums text-slate-300">
          기본 연사력 {weapon.baseStats.fireRate} RPM · 기본 사거리 {weapon.baseStats.range}m
        </div>
      </div>
    </div>
  );
};
