import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export interface ICustomWorld extends World {
  gameState: {
    selectedCharacter?: string;
    selectedShipType?: string;
    currentScreen?: string;
    difficulty?: string;
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