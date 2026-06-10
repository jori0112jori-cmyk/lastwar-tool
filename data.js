// Auto-split from single-file build (v1.4).
// Master data / constants
const HEROES = {
    empty: {n:"未設定", t:"none", r:"none", ur:false, pr:0},
    kimberly: {n:"キンバリー", t:"tank", r:"atk", ur:false, pr:100, carry:true}, dva: {n:"DVA", t:"air", r:"atk", ur:false, pr:100, carry:true}, tesla: {n:"テスラ", t:"mis", r:"atk", ur:false, pr:100, carry:true}, murphy: {n:"マーフィ", t:"tank", r:"wall", ur:false, pr:90}, lucius: {n:"ルシウス", t:"air", r:"wall", ur:false, pr:90}, mcgregor: {n:"マクレガー", t:"mis", r:"wall", ur:false, pr:90}, stetmann: {n:"ステッドマン", t:"tank", r:"atk", ur:false, pr:80}, schuyler: {n:"スカイラー", t:"air", r:"atk", ur:false, pr:80}, fiona: {n:"フィオナ", t:"mis", r:"atk", ur:false, pr:80}, morrison: {n:"モリソン", t:"air", r:"atk", ur:false, pr:75}, swift: {n:"スウィフト", t:"mis", r:"atk", ur:false, pr:75}, mason: {n:"メイソン", t:"tank", r:"atk", ur:true, pr:70}, sarah: {n:"サラ", t:"air", r:"atk", ur:true, pr:70}, venom: {n:"ベノム", t:"mis", r:"atk", ur:true, pr:70}, williams: {n:"ウィリアムズ", t:"tank", r:"wall", ur:false, pr:60}, carlie: {n:"カーリー", t:"air", r:"wall", ur:false, pr:60}, adam: {n:"アダム", t:"mis", r:"wall", ur:false, pr:60}, scarlett: {n:"スカーレット", t:"tank", r:"wall", ur:true, pr:55}, violet: {n:"ヴィオラ", t:"tank", r:"wall", ur:true, pr:55}, marshall: {n:"マーシャル", t:"tank", r:"sup", ur:false, pr:50}
};
const GEAR_TYPES = ['Gun', 'Data', 'Armor', 'Radar'];
const GEAR_NAMES = { 'Gun':'🔫レールガン', 'Data':'💾チップ', 'Armor':'🛡️装甲', 'Radar':'📡レーダー' };
const SHARD_ICON = 'img/original.webp';


// ===============================
// ⭐ メタ育成優先（兵種コア / tier）
// ===============================
const META_TIER = {
  // 🚜 戦車
  kimberly:{ tier:'atk1', ew:'SSS', ewTarget:30 },
  williams:{ tier:'tank1', ew:'S',  ewTarget:20 },
  stetmann:{ tier:'atk2', ew:'S',  ewTarget:20 },
  marshall:{ tier:'sup',  ew:'B',  ewTarget:0  },
  murphy:{   tier:'tank2',ew:'C',  ewTarget:0  },

  // ✈️ 航空
  lucius:{   tier:'tank1',ew:'SSS',ewTarget:30 },
  dva:{      tier:'atk1', ew:'SSS',ewTarget:30 },
  morrison:{ tier:'atk2', ew:'S',  ewTarget:20 },
  schuyler:{ tier:'atk2', ew:'A',  ewTarget:10 },
  carlie:{   tier:'tank2',ew:'A',  ewTarget:10 },

  // 🚀 ミサイル（ロケラン）
  fiona:{    tier:'atk1', ew:'SSS',ewTarget:30 },
  tesla:{    tier:'atk1', ew:'SS', ewTarget:20 },
  mcgregor:{ tier:'tank1',ew:'S',  ewTarget:20 },
  swift:{    tier:'atk2', ew:'A',  ewTarget:10 },
  adam:{     tier:'tank2',ew:'B',  ewTarget:10 }
};


// ===============================
// ⭐ 兵種シフト（完全自動推定）用の設定
// ※閾値は app.js 側で毎回推定（ここは係数とコア定義だけ）
// ===============================
const META_SHIFT = {
  core: {
    tank:   { ids:['kimberly','williams','stetmann'], targets:[30,20,20] },
    air:    { ids:['lucius','dva'],                   targets:[30,20] },  // DVAはLv20で覚醒前提を満たす
    missile:{ ids:['fiona','tesla','mcgregor'],        targets:[30,20,20] }
  },
  mult: {
    boostNext: 1.08,   // 次兵種を押し上げ（控えめ）
    dampPrev:  0.98,   // 前兵種を少し抑える（抑えすぎ防止）
    seedBoost: 1.05,   // 種まき段階（やや慎重）
    shiftBoost: 1.10,  // 本格移行段階
    weakOfftypeDamp: 0.90
  },
  progress: {
    maxWp: 30,
    minMult: 0.92,     // wp=0
    maxMult: 1.08      // wp=max
  }
};

const META_SHIFT_STAGE = {
  weakMain: 0.58,
  matureMain: 0.74,
  seedStart: 0.38,
  shiftStart: 0.60,
  fullShift: 0.82,
  keepCurrentCost: 1.06,
  keepCurrentFuture: 1.03,
  seedFuture: 1.04,
  shiftFuture: 1.10,
  lowMainOfftypeCost: 0.94,
  lowMainOfftypeFuture: 0.92
};


// ===============================
// ⭐ 汎用化ロジック用マスタ
// ===============================
const HERO_ROLE_PROFILE = {
  kimberly:{ role:'main_dps', lane:'back', core:true },
  murphy:{ role:'front_tank', lane:'front', core:true },
  williams:{ role:'front_tank', lane:'front', core:false },
  marshall:{ role:'support', lane:'back', core:true },
  stetmann:{ role:'sub_dps', lane:'back', core:true },
  mason:{ role:'sub_dps', lane:'back', core:false, promotedUr:true },
  scarlett:{ role:'front_tank', lane:'front', core:false, promotedUr:true },
  violet:{ role:'front_tank', lane:'front', core:false, promotedUr:true },

  dva:{ role:'main_dps', lane:'back', core:true },
  lucius:{ role:'front_tank', lane:'front', core:true },
  carlie:{ role:'front_tank', lane:'front', core:false },
  schuyler:{ role:'control', lane:'back', core:true },
  morrison:{ role:'sub_dps', lane:'back', core:true },
  sarah:{ role:'support', lane:'back', core:false, promotedUr:true },

  fiona:{ role:'main_dps', lane:'back', core:true },
  tesla:{ role:'sub_dps', lane:'back', core:true },
  mcgregor:{ role:'front_tank', lane:'front', core:true },
  swift:{ role:'sub_dps', lane:'back', core:true },
  adam:{ role:'front_tank', lane:'front', core:false },
  venom:{ role:'sub_dps', lane:'back', core:false, promotedUr:true }
};

const HERO_LONGTERM_VALUE = {
  kimberly:1.00, dva:1.00, fiona:0.96,
  lucius:0.88, stetmann:0.86, morrison:0.85,
  tesla:0.84, mcgregor:0.83, williams:0.80,
  schuyler:0.79, adam:0.76, marshall:0.74,
  murphy:0.72, carlie:0.70, swift:0.68,
  scarlett:0.72, mason:0.64, venom:0.62, sarah:0.58, violet:0.46
};

const HERO_EVAL_META = {
  // tank
  kimberly:{ milestone10Fit:1.03 },
  marshall:{ milestone10Fit:1.05 },
  murphy:{ milestone10Fit:1.06 },
  williams:{ milestone10Fit:1.06 },
  stetmann:{ milestone10Fit:1.01 },
  scarlett:{ milestone10Fit:1.06, promotedUrImmediateFit:1.08 },
  mason:{ milestone10Fit:1.05, promotedUrImmediateFit:1.07 },
  violet:{ milestone10Fit:1.02, promotedUrImmediateFit:0.98 },

  // air
  dva:{ milestone10Fit:1.03 },
  lucius:{ milestone10Fit:1.07 },
  morrison:{ milestone10Fit:1.01 },
  schuyler:{ milestone10Fit:1.06 },
  carlie:{ milestone10Fit:1.02 },
  sarah:{ milestone10Fit:1.04, promotedUrImmediateFit:1.01 },

  // missile
  tesla:{ milestone10Fit:1.05 },
  fiona:{ milestone10Fit:1.05 },
  mcgregor:{ milestone10Fit:1.05 },
  adam:{ milestone10Fit:1.01 },
  swift:{ milestone10Fit:1.03 },
  venom:{ milestone10Fit:1.04, promotedUrImmediateFit:1.02 }
};


const HERO_PAIR_SYNERGY = {
  // Air core
  dva: {
    lucius:   { base: 1.05, lv10: 1.06, lv20: 1.08, lv30: 1.10 },
    morrison: { base: 1.03, lv10: 1.04, lv20: 1.06, lv30: 1.07 },
    schuyler: { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 },
    murphy:   { base: 1.01, lv10: 1.02, lv20: 1.03, lv30: 1.04 } // 4+1想定
  },
  lucius: {
    dva:      { base: 1.05, lv10: 1.06, lv20: 1.08, lv30: 1.10 },
    schuyler: { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    morrison: { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 },
    murphy:   { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 } // 4+1想定
  },
  morrison: {
    dva:      { base: 1.03, lv10: 1.04, lv20: 1.06, lv30: 1.07 },
    lucius:   { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 },
    schuyler: { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 }
  },
  schuyler: {
    lucius:   { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    dva:      { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 }
  },

  // Tank core
  kimberly: {
    marshall: { base: 1.04, lv10: 1.06, lv20: 1.08, lv30: 1.09 },
    murphy:   { base: 1.03, lv10: 1.04, lv20: 1.06, lv30: 1.06 },
    williams: { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    stetmann: { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 }
  },
  marshall: {
    kimberly: { base: 1.04, lv10: 1.06, lv20: 1.08, lv30: 1.09 },
    stetmann: { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    dva:      { base: 1.01, lv10: 1.02, lv20: 1.03, lv30: 1.04 } // 汎用支援
  },
  murphy: {
    williams: { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    kimberly: { base: 1.03, lv10: 1.04, lv20: 1.06, lv30: 1.06 },
    marshall: { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 }
  },
  williams: {
    murphy:   { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    kimberly: { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    marshall: { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 }
  },
  stetmann: {
    kimberly: { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    marshall: { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 }
  },

  // Missile core
  adam: {
    tesla:    { base: 1.04, lv10: 1.05, lv20: 1.07, lv30: 1.08 },
    fiona:    { base: 1.04, lv10: 1.05, lv20: 1.07, lv30: 1.08 },
    mcgregor: { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 },
    swift:    { base: 1.01, lv10: 1.02, lv20: 1.03, lv30: 1.04 },
    venom:    { base: 1.02, lv10: 1.03, lv20: 1.05, lv30: 1.06 }
  },
  fiona: {
    tesla:    { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    adam:     { base: 1.04, lv10: 1.05, lv20: 1.07, lv30: 1.08 },
    mcgregor: { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 },
    venom:    { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 }
  },
  tesla: {
    fiona:    { base: 1.03, lv10: 1.04, lv20: 1.05, lv30: 1.06 },
    adam:     { base: 1.04, lv10: 1.05, lv20: 1.07, lv30: 1.08 }
  },
  mcgregor: {
    adam:     { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 },
    fiona:    { base: 1.02, lv10: 1.03, lv20: 1.04, lv30: 1.05 }
  }
};

// 互換用（既存 app.js 参照名）
const HERO_SYNERGY = HERO_PAIR_SYNERGY;

const FORMATION_SYNERGY = {
  front2: 1.06,
  monoType5: 1.10,
  monoType4plus1: 1.05,
  carryPlusSubDps: 1.04,
  carryPlusSupport: 1.03,
  controlPlusCarry: 1.03,
  tankCarryCore: 1.08,    // Kim + front2 + Marshall
  airBurstCore: 1.10,     // Lucius + DVA + Morrison
  airControlCore: 1.06,   // Lucius + Schuyler
  missileCore: 1.09,      // Adam + 2 missile attackers
  promotedUrBridge: 1.02  // 手持ち事情でのつなぎ採用
};

const MATCHUP_MODIFIER = {
  morrison: { vsEnemy: { murphy: 0.94 } },
  dvaFront: { vsEnemy: { williams: 0.93 } },
  lucius: { withEW30: 1.05 }
};

const HERO_AI_PROFILE = {
  kimberly:{ immediate:1.08, longterm:1.00, cost10:1.03, cost20:1.06, cost30:1.04, coverage:1.04, future:1.08, mainTypeBonus:1.04, promotedUrPenalty:1.00 },
  dva:{ immediate:1.08, longterm:1.00, cost10:1.03, cost20:1.06, cost30:0.95, coverage:1.03, future:1.08, mainTypeBonus:1.04, promotedUrPenalty:1.00 },
  fiona:{ immediate:1.06, longterm:0.96, cost10:1.03, cost20:1.05, cost30:1.03, coverage:1.02, future:1.07, mainTypeBonus:1.03, promotedUrPenalty:1.00 },
  lucius:{ immediate:1.07, longterm:0.88, cost10:1.05, cost20:1.08, cost30:0.98, coverage:1.07, future:1.05, mainTypeBonus:1.05, promotedUrPenalty:1.00 },
  williams:{ immediate:1.05, longterm:0.80, cost10:1.04, cost20:1.06, cost30:0.96, coverage:1.06, future:1.00, mainTypeBonus:1.03, promotedUrPenalty:1.00 },
  stetmann:{ immediate:1.04, longterm:0.86, cost10:1.02, cost20:1.05, cost30:0.97, coverage:1.03, future:1.02, mainTypeBonus:1.03, promotedUrPenalty:1.00 },
  morrison:{ immediate:1.03, longterm:0.85, cost10:1.01, cost20:1.04, cost30:0.97, coverage:1.02, future:1.02, mainTypeBonus:1.03, promotedUrPenalty:1.00 },
  tesla:{ immediate:1.03, longterm:0.84, cost10:1.03, cost20:1.05, cost30:0.98, coverage:1.02, future:1.03, mainTypeBonus:1.03, promotedUrPenalty:1.00 },
  mcgregor:{ immediate:1.03, longterm:0.83, cost10:1.03, cost20:1.05, cost30:0.98, coverage:1.04, future:1.01, mainTypeBonus:1.03, promotedUrPenalty:1.00 },
  schuyler:{ immediate:1.02, longterm:0.79, cost10:1.04, cost20:1.03, cost30:0.96, coverage:1.03, future:1.00, mainTypeBonus:1.02, promotedUrPenalty:1.00 },
  adam:{ immediate:1.03, longterm:0.76, cost10:1.03, cost20:1.04, cost30:0.96, coverage:1.05, future:1.01, mainTypeBonus:1.03, promotedUrPenalty:1.00 },
  marshall:{ immediate:1.02, longterm:0.74, cost10:1.05, cost20:1.03, cost30:0.88, coverage:1.05, future:0.98, mainTypeBonus:1.01, promotedUrPenalty:1.00 },
  murphy:{ immediate:1.03, longterm:0.72, cost10:1.05, cost20:1.03, cost30:0.94, coverage:1.05, future:0.97, mainTypeBonus:1.01, promotedUrPenalty:1.00 },
  carlie:{ immediate:1.01, longterm:0.70, cost10:1.02, cost20:1.02, cost30:0.94, coverage:1.02, future:0.97, mainTypeBonus:1.01, promotedUrPenalty:1.00 },
  swift:{ immediate:1.01, longterm:0.68, cost10:1.03, cost20:1.02, cost30:0.94, coverage:1.01, future:0.97, mainTypeBonus:1.01, promotedUrPenalty:1.00 },
  scarlett:{ immediate:1.06, longterm:0.72, cost10:1.05, cost20:1.01, cost30:0.90, coverage:1.04, future:0.90, mainTypeBonus:1.02, promotedUrPenalty:0.90 },
  mason:{ immediate:1.07, longterm:0.64, cost10:1.05, cost20:1.02, cost30:0.90, coverage:1.03, future:0.88, mainTypeBonus:1.02, promotedUrPenalty:0.88 },
  venom:{ immediate:1.02, longterm:0.62, cost10:1.04, cost20:1.01, cost30:0.89, coverage:1.02, future:0.87, mainTypeBonus:1.02, promotedUrPenalty:0.87 },
  sarah:{ immediate:1.01, longterm:0.58, cost10:1.03, cost20:1.00, cost30:0.88, coverage:1.02, future:0.85, mainTypeBonus:1.01, promotedUrPenalty:0.85 },
  violet:{ immediate:0.98, longterm:0.46, cost10:1.02, cost20:0.98, cost30:0.86, coverage:0.99, future:0.82, mainTypeBonus:1.00, promotedUrPenalty:0.82 }
};

const TYPE_COUNTER_WEIGHT = {
  tank:{ tank:0.30, air:1.00, mis:0.50 },
  air:{ tank:0.50, air:0.30, mis:1.00 },
  mis:{ tank:1.00, air:0.50, mis:0.30 },
  none:{ tank:0.50, air:0.50, mis:0.50 }
};

const ROUTE_WEIGHT_PRESET = {
  overall:{ cost:0.45, coverage:0.30, future:0.25 },
  safe:{ cost:0.60, coverage:0.25, future:0.15 }
};


// ===============================
// ⭐ 専用武装タグ（簡易判定用）
// ===============================
const HERO_WEAPON_TAGS = {
  murphy: ['shield_like_protect','frontline_protect','low_hp_protect','team_guard','damage_mitigation'],
  kimberly: ['single_burst','energy_damage','stack_scaling','skill_multi_hit','aoe_bonus_30'],
  marshall: ['atk_buff','crit_buff','focus_fire_support','target_mark','cooldown_reset_30'],
  williams: ['interrupt','frontline_control','backline_control','team_def_buff','energy_vuln'],
  stetmann: ['anti_shield','backline_hit','energy_bonus_hit','charge_scaling','cc_guard_30'],

  dva: ['opening_burst','attack_speed','air_synergy','instant_opening_30','tempo_accel'],
  carlie: ['anti_energy','enemy_atk_down','enemy_energy_down','frontline_stability','death_effect_30'],
  schuyler: ['cc_stun','disrupt','backline_hit','anti_backline','guaranteed_cc_30'],
  lucius: ['shield','energy_resist','low_hp_protect','team_barrier','atk_speed_on_break_30'],
  morrison: ['hp_percent_damage','anti_tank','high_hp_target','def_down','finisher'],

  tesla: ['dot','energy_dot','stack_dot','backline_pressure_30','dot_scaling'],
  mcgregor: ['taunt','dot_amp','enemy_atk_down','frontline_stability','iron_wall_30'],
  adam: ['counter','team_counter','frontline_protect','counter_amp','armor_break_counter_30'],
  fiona: ['dot','physical_dot','aoe','dispel','anti_buff'],
  swift: ['burn_dot','physical_dot','dot_synergy','sustained_damage'],

  // promoted UR
  scarlett: ['promoted_ur_no_ew','frontline_stability','budget_wall','early_pvp_hold'],
  mason: ['promoted_ur_no_ew','boss_focus','budget_sub_dps','pve_value'],
  sarah: ['promoted_ur_no_ew','budget_support','air_bridge','tempo_support'],
  venom: ['promoted_ur_no_ew','dot_bridge','missile_bridge','sustained_damage'],
  violet: ['promoted_ur_no_ew','budget_wall','early_hold','low_ceiling'],
};


// ===============================
// ⭐ 表示理由ラベル辞書（UI文言は data.js 管理）
// ===============================
const REASON_LABELS = {
  policy: {
    build_main: "主力維持",
    hold: "主力維持",
    seed: "次兵種準備",
    seed_air: "航空種まき",
    seed_mis: "ロケラン種まき",
    shift: "本格移行",
    shift_air: "航空移行",
    shift_mis: "ロケラン移行",
    full_shift: "兵種移行"
  },
  efficiency: {
    low_cost: "低コスト",
    mid_cost: "中コスト",
    high_cost: "高コスト",
    ew_milestone: "節目強化",
    lv30: "30投資"
  },
  timing: {
    immediate: "即戦力",
    future: "長期向き",
    promoted_ur: "昇格UR"
  }
};

const IMPACT_LABELS = {
  tankiness: "耐久補強",
  stability: "編成安定",
  carry: "火力強化",
  subdps: "後衛火力",
  support: "支援強化",
  burst: "爆発力",
  efficiency: "コスパ良"
};

const REASON_BADGE_STYLE = {
  build_main: "neutral",
  hold: "neutral",
  seed: "accent",
  seed_air: "accent",
  seed_mis: "accent",
  shift: "accent",
  shift_air: "accent",
  shift_mis: "accent",
  full_shift: "accent",
  low_cost: "good",
  mid_cost: "neutral",
  high_cost: "warn",
  ew_milestone: "neutral",
  lv30: "warn",
  immediate: "good",
  future: "future",
  promoted_ur: "neutral"
};

const IMPACT_BADGE_STYLE = {
  tankiness: "defense",
  stability: "neutral",
  carry: "attack",
  subdps: "attack",
  support: "support",
  burst: "attack",
  efficiency: "good"
};

const REASON_BADGE_PRIORITY = [
  "policy",
  "efficiency",
  "timing"
];

const REASON_EXCLUDE_BY_IMPACT = {
  tankiness: ["front_fill", "sustain"],
  stability: ["coverage"],
  carry: ["carry_boost"],
  subdps: ["subdps_boost"],
  support: ["support_value"],
  burst: [],
  efficiency: []
};


const SUMMARY_TEMPLATES = {
  build_main: {
    tankiness: "主力部隊の安定化を進めやすい",
    stability: "今の編成を崩さず戦力を底上げしやすい",
    carry: "主力部隊の完成度を高めやすい",
    subdps: "主力部隊の火力補強を進めやすい",
    support: "主力部隊の回りを良くしやすい",
    burst: "主力部隊の突破力を高めやすい",
    default: "主力部隊の強化を進めやすい"
  },
  hold: {
    tankiness: "主力部隊の安定化を進めやすい",
    stability: "今の編成を崩さず戦力を底上げしやすい",
    carry: "主力部隊の完成度を高めやすい",
    support: "主力部隊の回りを良くしやすい",
    default: "主力部隊の強化を進めやすい"
  },
  seed: {
    tankiness: "次兵種への移行準備を進めやすい",
    stability: "将来の編成転換に向けた土台を作りやすい",
    carry: "次の主力軸を先行して育てやすい",
    subdps: "次兵種の火力補強を進めやすい",
    support: "将来の編成転換に向けた土台を作りやすい",
    burst: "次兵種の勝ち筋を作りやすい",
    default: "次兵種への移行準備を進めやすい"
  },
  shift: {
    tankiness: "次の主力兵種への移行を進めやすい",
    stability: "編成の主軸を切り替える段階で効果が大きい",
    carry: "主力兵種の切り替えに直結しやすい",
    subdps: "新しい主軸の火力を補いやすい",
    support: "兵種移行後の編成を支えやすい",
    default: "次の主力兵種への移行を進めやすい"
  },
  full_shift: {
    tankiness: "兵種移行を本格化させやすい",
    stability: "新しい主軸の安定化を進めやすい",
    carry: "新しい主軸の完成度を高めやすい",
    support: "兵種移行後の編成を支えやすい",
    default: "兵種移行を本格化させやすい"
  },
  low_cost: {
    default: "低コストで戦力の底上げを狙いやすい"
  },
  high_cost: {
    default: "高コストだが伸び幅が大きい"
  },
  lv30: {
    carry: "高コストだが主力火力の伸びが大きい",
    subdps: "高コストだが火力面の伸びが期待しやすい",
    support: "高コストだが中長期の戦力強化につながりやすい",
    default: "高コストだが伸び幅が大きい"
  },
  future: {
    default: "中長期の戦力強化につながりやすい"
  },
  immediate: {
    default: "比較的早く戦力化しやすい"
  }
};


// ===============================
// ⭐ S6 英雄覚醒システム
// ===============================
// 覚醒の構造：
//   ★0 = 未覚醒
//   ★1〜5：各★に5段階ティア（★1だけは4ティア）
//   表記例：awTier = { star:1, tier:3 } → 「★1-3」
//
// シャードコスト（cpt-hedge.com検証済み）:
//   解放     : 50個（名前付き）
//   ★1 ティア1〜4 : 各20個（計80個）  → ★1合計130
//   ★2 ティア1〜5 : 各40個（計200個） → ★2追加200
//   ★3 ティア1〜5 : 各70個（計350個） → ★3追加350
//   ★4 ティア1〜5 : 各80個（計400個） → ★4追加400（未公式推定）
//   ★5 ティア1〜5 : 各100個（計500個）→ ★5追加500（未公式推定）
//   最大合計 : 1,580個
//
// awTier の保存形式: "star-tier" 文字列（例 "1-3"）
//   未覚醒 = "0-0"  解放済み（★0完了）= "1-0"（★1への途中）

// 覚醒ティア構造：★0〜★5、各★に1〜5の5ティア
// "star-tier" 文字列で管理（例: "0-1"=★0-1, "1-3"=★1-3）
// 未覚醒 = "none"
//
// シャードコスト（cpt-hedge.com確認済み）:
//   ★0-1 : 専用覚醒かけら×50（名前付き、解放）
//   ★0-2〜★0-5 : 各20個（汎用可）
//   ★1-1〜★1-5 : 各40個
//   ★2-1〜★2-5 : 各70個
//   ★3-1〜★3-5 : 各80個（未公式・推定）
//   ★4-1〜★4-5 : 各100個（未公式・推定）
//   ★0合計130・★1〜4追加200/350/400/500、総計1,580個

// ★ごとのティアあたりシャードコスト（★0-1のみ特殊）
const AW_SHARD_PER_TIER = { 0:20, 1:40, 2:70, 3:80, 4:100 };
// ★0-1だけ専用かけら50（named:true で区別）

// 覚醒対象英雄（S6）
// starBonuses のキーは "star-tier" 文字列
const AWAKENING_HEROES = {
  kimberly: {
    available: true,
    skillName: '燃ゆる決意',
    ewMinRequired: 20,
    starRequired: 5,
    // 覚醒スキル「燃ゆる決意」Lv40：敵に10回発砲、1回につき攻撃力×244.81%エネルギーダメージ
    // エネルギー増幅1スタックにつき追加4発（最大30回・計攻撃力×7,342.76%）
    // 引き継いだ特技「超絶感知」：体力・攻撃力・防御力+20%、スキルヘイスト+10%
    tierBonuses: {
      '0-0': '覚醒スキル「燃ゆる決意」解放・超絶感知（体力/攻撃/防御+20%、スキルヘイスト+10%）',
      '0-5': 'エネルギー増幅パッシブ（与エネルギーダメージ+3%、最大+15%）→★1到達',
      '1-1': '★1解放：戦闘開始時に自動で「決意」状態に入る（防御力-10%・会心率+10%、20秒間）',
      '1-5': '★2解放：追加ダメージ+20%→★2到達',
      '2-5': '★3解放：覚醒スキル発動前にエネルギー増幅を2スタック即獲得→★3到達',
      '3-5': '★4解放：追加ダメージさらに+40%（合計+60%）→★4到達',
      '4-5': '★5解放：エネルギー増幅1スタックにつき追加1発発砲（MAX）→★5到達'
    },
    communityNotes: '★1（決意状態の自動発動）と★3（エネルギー増幅2スタック先行獲得）が特に強力。EW Lv30前提ならキム覚醒が最優先。',
    // scoreBonus 根拠：
    // ★0: 超絶感知（体力/攻撃/防御+20%）即適用 → ×1.20
    // ★1: 決意状態自動発動（会心+10%）実戦インパクト中 → ×1.26
    // ★2: 追加ダメージ+20% → ×1.38
    // ★3: エネルギー増幅2スタック先行（発数最大化に直結、最大火力インパクト大） → ×1.55
    // ★4: 追加ダメージ+40%（合計+60%） → ×1.68
    scoreBonus: { 0:1.20, 1:1.26, 2:1.38, 3:1.55, 4:1.68, 5:1.82 } // ★5: 増幅スタックごと追加1発
  },
  dva: {
    available: true,
    skillName: 'エーススター',
    ewMinRequired: 20,
    starRequired: 5,
    // 覚醒スキル「エーススター」Lv40：DVAが5秒間空へ突進、その間「エースの矜持」獲得
    // 通常攻撃1回につき追加でランダムな敵1体（前衛優先）に攻撃力×251.09%エネルギーダメージ
    // エースの矜持：味方航空機英雄1体につき1スタック獲得、攻撃速度+20%（最大5スタック）
    // 引き継いだ特技「超絶感知」：体力・攻撃力・防御力+20%、スキルヘイスト+10%
    tierBonuses: {
      '0-0': '覚醒スキル「エーススター」解放・超絶感知（体力/攻撃/防御+20%、スキルヘイスト+10%）',
      '0-5': 'エースの矜持パッシブ強化（攻撃速度+20%/スタック、最大5スタック）→★1到達',
      '1-1': '★1解放：エースの矜持1スタックにつき攻撃速度さらに+10%上昇',
      '1-5': '★2解放：追撃攻撃のダメージ+20%→★2到達',
      '2-5': '★3解放：エースの矜持1スタックにつき攻撃力+5%→★3到達',
      '3-5': '★4解放：追撃攻撃のダメージさらに+40%→★4到達',
      '4-5': '★5解放：滞空時間を1秒延長（最大強化）→★5到達'
    },
    communityNotes: '航空機英雄が多いほどスタックが積みやすい。★0解放だけで超絶感知による基礎ステ+20%が即適用されるため解放コスパが高い。',
    // scoreBonus 根拠：
    // ★0: 超絶感知（体力/攻撃/防御+20%）即適用 → ×1.20
    // ★1: エースの矜持スタック追加強化（航空機数依存、平均2体想定） → ×1.28
    // ★2: 追撃ダメージ+20% → ×1.36
    // ★3: エースの矜持1スタックにつき攻撃力+5% → ×1.44
    // ★4: 追撃+40%・滞空+1秒（MAX） → ×1.56
    scoreBonus: { 0:1.20, 1:1.28, 2:1.36, 3:1.44, 4:1.56, 5:1.68 } // ★5: 滞空+1秒
  },
  tesla: {
    available: true,
    skillName: '電磁共鳴',
    ewMinRequired: 20,
    starRequired: 5,
    // 覚醒スキル「電磁共鳴」Lv40：ライトニングチェーンを放ち、敵の間でランダムに7回反射
    // 毎回攻撃力×1,069.55%エネルギーダメージ
    // 引き継いだ特技「超絶感知」：体力・攻撃力・防御力+20%、スキルヘイスト+10%
    tierBonuses: {
      '0-0': '覚醒スキル「電磁共鳴」解放・超絶感知（体力/攻撃/防御+20%、スキルヘイスト+10%）',
      '0-5': '誘導電流パッシブ（反射のたびに対象へ誘導電流2スタック付与）→★1到達',
      '1-1': '★1解放：誘導電流（攻撃力×3%の継続エネルギーダメージ/秒、30秒間、最大15スタック）',
      '1-5': '★2解放：追加ダメージ+20%→★2到達',
      '2-5': '★3解放：反射回数+1（計8回）→★3到達',
      '3-5': '★4解放：追加ダメージさらに+40%→★4到達',
      '4-5': '★5解放：反射回数さらに+1（計9回）（MAX）→★5到達'
    },
    communityNotes: '★1の誘導電流DoTとフィオナの組み合わせが強力。スタック上限は味方ロケラン英雄数×3（最大15）。ロケラン軸ガチ勢は最優先候補。',
    // scoreBonus 根拠：
    // ★0: 超絶感知（体力/攻撃/防御+20%）即適用 → ×1.20
    // ★1: 誘導電流DoT（攻撃力×3%/秒×30秒、ロケラン数×3スタック上限）→ ×1.28
    // ★2: 追加ダメージ+20% → ×1.35
    // ★3: 反射回数+1（7→8回）→ ×1.44
    // ★4: 追加ダメージ+40%・反射さらに+1（9回）→ ×1.58
    scoreBonus: { 0:1.20, 1:1.28, 2:1.35, 3:1.44, 4:1.58, 5:1.72 } // ★5: 反射+1（計9回）
  }
};

// シャード取得方法（F2P・2026年時点）
const AWAKENING_SHARD_SOURCES = [
  { name: 'ヒーロー覚醒試練', shards: 10, note: 'Basic/Advanced/Ultimate（各1個）英雄ごと' },
  { name: 'グローバル遠征',   shards: 40, note: 'Week1/3/5に解放。55M〜60M進軍力推奨' }
];

// --- ユーティリティ ---

// awTier文字列 → {star, tier}
function parseAwTier(val) {
  if (!val || val === 'none') return { star:-1, tier:0 };
  const m = String(val).match(/^(\d+)-(\d+)$/);
  if (!m) return { star:-1, tier:0 };
  return { star: parseInt(m[1]), tier: parseInt(m[2]) };
}

// {star, tier} → 表示文字列（例: "★1-3"）
function formatAwTier(at) {
  if (!at || at.star < 0) return '未覚醒';
  return '★' + at.star + '-' + at.tier;
}

// 覚醒前提チェック
function checkAwakeningEligible(heroId, ewLv, heroStars) {
  const aw = AWAKENING_HEROES[heroId];
  if (!aw || !aw.available) return { eligible: false, reason: '覚醒非対応英雄' };
  if ((heroStars || 5) < aw.starRequired)
    return { eligible: false, reason: '英雄★' + aw.starRequired + 'が必要' };
  if ((ewLv || 0) < aw.ewMinRequired)
    return { eligible: false, reason: 'EW Lv' + aw.ewMinRequired + '以上が必要' };
  return { eligible: true };
}

// 覚醒スコア補正（star単位で線形補間、tier0-5で進行度）
function getAwakeningScoreBonus(heroId, awTierStr) {
  const aw = AWAKENING_HEROES[heroId];
  if (!aw) return 1.0;
  const at = parseAwTier(awTierStr);
  if (at.star < 0) return 1.0;
  const base = aw.scoreBonus[at.star] || 1.0;
  const next = aw.scoreBonus[Math.min(5, at.star + 1)] || base;
  const frac = at.tier / 5;
  return base + (next - base) * frac;  // ティア進行度をフルに反映
}

// 次のティアへのコスト
function awNextTierCost(awTierStr) {
  const at = parseAwTier(awTierStr);
  // 未覚醒 → ★0-1（名前付きかけら×50）
  if (at.star < 0) return { cost:50, named:true, nextStar:0, nextTier:1 };
  // ★4-5 = MAX
  if (at.star >= 4 && at.tier >= 5) return null;
  if (at.tier < 5) {
    // 同じ★の次ティアへ（★0-1のみ名前付き、それ以外は汎用）
    const named = (at.star === 0 && at.tier === 0); // ★0-0→★0-1は該当しないが念のため
    return { cost: AW_SHARD_PER_TIER[at.star], named: false, nextStar: at.star, nextTier: at.tier + 1 };
  }
  // 次の★-1へ
  const nextStar = at.star + 1;
  return { cost: AW_SHARD_PER_TIER[nextStar], named: false, nextStar, nextTier: 1 };
}

// ティアに対応するボーナス文を取得
function getAwTierBonus(heroId, awTierStr) {
  const aw = AWAKENING_HEROES[heroId];
  if (!aw) return '';
  const at = parseAwTier(awTierStr);
  if (at.star < 0) return '';
  const key = at.star + '-' + at.tier;
  // 完全一致→なければ同じ★内で直近のキーを探す
  if (aw.tierBonuses[key]) return aw.tierBonuses[key];
  for (let t = at.tier - 1; t >= 1; t--) {
    const k = at.star + '-' + t;
    if (aw.tierBonuses[k]) return aw.tierBonuses[k] + '（継続中）';
  }
  return '';
}
