import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

// Difficulty configuration interface
interface DifficultyConfig {
  难度名称: string;
  解锁条件: string;
  弹速系数: number;
  弹幕密度系数: number;
  符卡时长系数: number;
  是否默认解锁: string;
}

// Game parameters interface
interface GameParams {
  bulletSpeedMultiplier: number;
  bulletDensityMultiplier: number;
  spellCardDurationMultiplier: number;
}

// Dialogue mapping interface
interface DialogueMapping {
  关卡: string;
  自机: string;
  对手: string;
  对话脚本ID: string;
}

// Current dialogue interface
interface CurrentDialogue {
  scriptId: string;
  player: string;
  opponent: string;
  stage: string;
}

// Cherry point system configuration interface
interface CherryPointConfig {
  配置ID: string;
  樱计量上限: number;
  春度持续时间s: number;
  春度触发阈值: number;
  残机奖励首次阈值: number;
  残机奖励后续间隔: number;
}

// Cherry point system state interface
interface CherryPointSystem {
  maxGauge: number;
  springDuration: number;
  springThreshold: number;
  firstLifeBonusThreshold: number;
  lifeBonusInterval: number;
  currentGauge: number;
  springCount: number;
  livesEarned: number;
  isInSpringState: boolean;
}

// Stage progression interfaces
interface StageConfig {
  关卡类型: string;
  关卡号: string;
  关卡名称: string;
  背景音乐ID: string;
  BOSS名称: string;
}

interface MapBackgroundConfig {
  关卡号: string;
  主背景: string;
  前景元素: string;
  滚动速度: string;
  环境效果: string;
  特殊装饰: string;
}

interface MapBoundaryConfig {
  关卡号: string;
  游戏区域宽度: string;
  游戏区域高度: string;
  玩家移动边界左: string;
  玩家移动边界右: string;
  玩家移动边界上: string;
  玩家移动边界下: string;
}

interface EnemyConfig {
  关卡号: string;
  敌机类型: string;
  出现时机: string;
  HP: number;
  移动模式: string;
  弹幕类型: string;
}

interface BossConfig {
  BOSS名称: string;
  关卡号: string;
  通常攻击阶段数: number;
  符卡数量: number;
  总HP: number;
}

interface SpecialAreaConfig {
  关卡号: string;
  特殊区域类型: string;
  位置坐标: string;
  触发效果: string;
  持续时间: string;
}

interface PlayerPosition {
  x: number;
  y: number;
}

interface MapState {
  scrollSpeed: number;
  scrollPosition: number;
  isPaused: boolean;
  backgroundLoaded: boolean;
  environmentEffects: string[];
  specialDecorations: string[];
}

interface BossState {
  name: string;
  currentHP: number;
  maxHP: number;
  phase: 'normal_attack' | 'spell_card' | 'transition';
  currentPhase: number;
  maxPhases: number;
  spellCards: number;
  isMoving: boolean;
}

interface StageProgress {
  currentStage: string;
  difficulty: string;
  enemiesDefeated: number;
  totalEnemies: number;
  allEnemiesDefeated: boolean;
  bossActive: boolean;
  stageCompleted: boolean;
}

export interface ICustomWorld extends World {
  gameState: {
    selectedCharacter?: string;
    selectedShipType?: string;
    currentScreen?: string;
    difficulty?: string;
    selectedDifficulty?: string;
    difficultyConfigs?: DifficultyConfig[];
    unlockedDifficulties?: string[];
    clearedDifficulties?: string[];
    hardClearedWithoutContinue?: boolean;
    gameParams?: GameParams;
    lastError?: string;
    
    // Dialogue system
    dialogueMappings?: DialogueMapping[];
    currentStage?: string;
    gamePhase?: string;
    currentDialogue?: CurrentDialogue;
    displayedPortraits?: string[];
    textBoxAnimationPlaying?: boolean;
    dialogueAnimationState?: string;
    
    // Stage progression and unlock
    completedStages?: string[];
    lastClearDifficulty?: string;
    lastClearCharacter?: string;
    usedContinue?: boolean;
    normalClearedWithoutContinue?: boolean;
    unlockedStages?: string[];
    
    // Cherry point system
    cherryPointConfigs?: CherryPointConfig[];
    cherryPointSystem?: CherryPointSystem;
    lifeBonus?: boolean;
    
    // Stage progression system
    stageConfigs?: StageConfig[];
    mapBackgroundConfigs?: MapBackgroundConfig[];
    mapBoundaryConfigs?: MapBoundaryConfig[];
    enemyConfigs?: EnemyConfig[];
    bossConfigs?: BossConfig[];
    specialAreaConfigs?: SpecialAreaConfig[];
    
    // Game state for stage progression
    playerPosition?: PlayerPosition;
    mapState?: MapState;
    bossState?: BossState;
    stageProgress?: StageProgress;
    specialAreaEffects?: Record<string, any>;
    clearStatistics?: {
      defeatedEnemies: number;
      grazedBullets: number;
      collectedCherryPoints: number;
    };
    
    [key: string]: any;
  };
  appUrl: string;
}

export class CustomWorld extends World implements ICustomWorld {
  public gameState: ICustomWorld['gameState'];
  public appUrl: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.gameState = {};
    this.appUrl = options.parameters?.appUrl || 'http://localhost:3000';
  }

  // Helper method to reset game state
  resetGameState() {
    this.gameState = {};
  }

  // Helper method to simulate screen transitions
  navigateToScreen(screen: string) {
    this.gameState.currentScreen = screen;
  }
}

setWorldConstructor(CustomWorld); 