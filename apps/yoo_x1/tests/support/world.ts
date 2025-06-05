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