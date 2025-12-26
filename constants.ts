
import { Acupoint, Case } from './types';

export const COLORS = {
  CYBER_CYAN: '#00f3ff',
  INK_BLACK: '#050505',
  GOLD: '#ffcc33',
  CRIMSON: '#ff0055',
  WHITE: '#ffffff'
};

// Simplified human body points - 361 points are usually mapped to a model. 
export const ACUPOINTS_DATA: Acupoint[] = [
  { id: 'LI4', name: 'Hegu', chineseName: '合谷', meridian: '手阳明大肠经', position: [0.8, 0, 0.2], description: '清热解表，疏散风邪，镇静止痛。' },
  { id: 'ST36', name: 'Zusanli', chineseName: '足三里', meridian: '足阳明胃经', position: [0.3, -1.2, 0.4], description: '燥化脾湿，生发胃气。' },
  { id: 'PC6', name: 'Neiguan', chineseName: '内关', meridian: '手厥阴心包经', position: [0.7, 0.2, 0.2], description: '宁心安神，理气止痛。' },
  { id: 'GV20', name: 'Baihui', chineseName: '百会', meridian: '督脉', position: [0, 1.8, 0], description: '平肝熄风，升阳举陷。' },
  { id: 'LR3', name: 'Taichong', chineseName: '太冲', meridian: '足厥阴肝经', position: [0.2, -1.8, 0.3], description: '平肝熄风，清热利湿。' },
  { id: 'SP6', name: 'Sanyinjiao', chineseName: '三阴交', meridian: '足太阴脾经', position: [0.3, -1.5, 0.3], description: '健脾理气，补肝益肾。' },
  { id: 'KI3', name: 'Taixi', chineseName: '太溪', meridian: '足少阴肾经', position: [0.2, -1.7, 0.2], description: '滋阴益肾，壮阳强腰。' },
  { id: 'LU7', name: 'Lieque', chineseName: '列缺', meridian: '手太阴肺经', position: [0.75, 0.15, 0.2], description: '宣肺解表，通经活络。' },
  { id: 'GB20', name: 'Fengchi', chineseName: '风池', meridian: '足少阳胆经', position: [0.15, 1.5, -0.2], description: '壮阳益气。' },
  { id: 'CV17', name: 'Danzhong', chineseName: '膻中', meridian: '任脉', position: [0, 0.5, 0.4], description: '理气止痛，生化汗液。' },
  { id: 'BL23', name: 'Shenshu', chineseName: '肾俞', meridian: '足太阳膀胱经', position: [0.2, -0.3, -0.4], description: '益肾助阳，强腰利水。' },
  { id: 'HT7', name: 'Shenmen', chineseName: '神门', meridian: '手少阴心经', position: [0.65, 0.1, 0.2], description: '补心益气，安神定志。' },
  { id: 'LI11', name: 'Quchi', chineseName: '曲池', meridian: '手阳明大肠经', position: [0.5, 0.4, 0.3], description: '转化脾土，生发胃气。' },
  { id: 'ST25', name: 'Tianshu', chineseName: '天枢', meridian: '足阳明胃经', position: [0.2, -0.2, 0.4], description: '理气止痛，健脾和胃。' },
  { id: 'CV4', name: 'Guanyuan', chineseName: '关元', meridian: '任脉', position: [0, -0.6, 0.4], description: '培肾固本，补气回阳。' }
];

export const CASES: Case[] = [
  { id: 1, title: '风寒感冒', symptoms: '恶寒发热，头痛身痛，无汗而喘。', requiredPoints: ['LI4', 'LU7'], difficulty: 1, reward: 10 },
  { id: 2, title: '失眠困扰', symptoms: '入睡困难，心悸不安，多梦易惊。', requiredPoints: ['HT7', 'SP6', 'PC6'], difficulty: 1, reward: 15 },
  { id: 3, title: '食积不化', symptoms: '脘腹胀满，食欲不振，大便不调。', requiredPoints: ['ST36', 'ST25', 'CV4'], difficulty: 2, reward: 20 },
  { id: 4, title: '外感头痛', symptoms: '头痛连及项背，畏风恶寒。', requiredPoints: ['GV20', 'GB20', 'LI4'], difficulty: 2, reward: 20 },
  { id: 5, title: '元气补给', symptoms: '久病体虚，畏寒肢冷，神疲乏力。', requiredPoints: ['ST36', 'KI3', 'CV4', 'BL23'], difficulty: 3, reward: 25 },
  { id: 6, title: '肝火上炎', symptoms: '急躁易怒，头晕目赤，口苦咽干。', requiredPoints: ['LR3', 'GB20', 'LI11', 'SP6'], difficulty: 3, reward: 25 },
  { id: 7, title: '胸痹气短', symptoms: '胸闷气短，甚则胸痛彻背。', requiredPoints: ['CV17', 'PC6', 'LU7', 'HT7'], difficulty: 4, reward: 30 },
  { id: 8, title: '全真调理', symptoms: '五行失调，阴阳俱损，经络闭塞。', requiredPoints: ['GV20', 'ST36', 'LI4', 'PC6', 'LR3', 'SP6'], difficulty: 5, reward: 50 }
];

export const ACHIEVEMENTS = [
  { id: 'FIRST_HEAL', title: '初窥医道', description: '完成首个病例诊疗。' },
  { id: 'SHARP_EYE', title: '金针入穴', description: '连续命中10个穴位且无失误。' },
  { id: 'ZEN_MASTER', title: '真气流转', description: '积分达到200点。' }
];
