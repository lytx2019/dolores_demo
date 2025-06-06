import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';

// Cherry point system configuration interface
interface CherryPointConfig {
  配置ID: string;
  樱计量上限: number;
  春度持续时间s: number;
  春度触发阈值: number;
  残机奖励首次阈值: number;
  残机奖励后续间隔: number;
}

// Background step - cherry point system configuration table
Given('系统已定义「樱点系统配置表」:', function (this: CustomWorld, dataTable: DataTable) {
  const rawConfigs = dataTable.hashes();
  const configs: CherryPointConfig[] = rawConfigs.map(row => ({
    配置ID: row['配置ID'],
    樱计量上限: parseInt(row['樱计量上限']),
    春度持续时间s: parseInt(row['春度持续时间(s)']),
    春度触发阈值: parseInt(row['春度触发阈值']),
    残机奖励首次阈值: parseInt(row['残机奖励首次阈值']),
    残机奖励后续间隔: parseInt(row['残机奖励后续间隔'])
  }));
  
  this.gameState.cherryPointConfigs = configs;
  
  // Use default config
  const defaultConfig = configs.find(config => config.配置ID === 'DEFAULT');
  if (defaultConfig) {
    this.gameState.cherryPointSystem = {
      maxGauge: defaultConfig.樱计量上限,
      springDuration: defaultConfig.春度持续时间s,
      springThreshold: defaultConfig.春度触发阈值,
      firstLifeBonusThreshold: defaultConfig.残机奖励首次阈值,
      lifeBonusInterval: defaultConfig.残机奖励后续间隔,
      currentGauge: 0,
      springCount: 0,
      livesEarned: 0,
      isInSpringState: false
    };
  }
  
  console.log('Cherry point system configured with default settings');
});

// Cherry point collection rules
Given('当前樱计量为 {int}', function (this: CustomWorld, initialValue: number) {
  if (!this.gameState.cherryPointSystem) {
    // Initialize default system if not exists
    this.gameState.cherryPointSystem = {
      maxGauge: 50000,
      springDuration: 10,
      springThreshold: 50000,
      firstLifeBonusThreshold: 3,
      lifeBonusInterval: 5,
      currentGauge: initialValue,
      springCount: 0,
      livesEarned: 0,
      isInSpringState: false
    };
  } else {
    this.gameState.cherryPointSystem.currentGauge = initialValue;
  }
  
  console.log('Current cherry gauge set to:', initialValue);
});

When('玩家收集了 {int} 个樱点', function (this: CustomWorld, collectedPoints: number) {
  const system = this.gameState.cherryPointSystem;
  if (!system) return;
  
  const previousGauge = system.currentGauge;
  system.currentGauge += collectedPoints;
  
  // Check if spring threshold is reached
  const thresholdCrossed = previousGauge < system.springThreshold && 
                           system.currentGauge >= system.springThreshold;
  
  if (thresholdCrossed) {
    // Trigger spring state
    system.isInSpringState = true;
    system.springCount++;
    
    // Reset gauge (overflow continues)
    const overflow = system.currentGauge - system.springThreshold;
    system.currentGauge = overflow;
    
    console.log('Spring state triggered! Overflow:', overflow);
    
    // Check for life bonus
    if (system.springCount === system.firstLifeBonusThreshold ||
        (system.springCount > system.firstLifeBonusThreshold && 
         (system.springCount - system.firstLifeBonusThreshold) % system.lifeBonusInterval === 0)) {
      system.livesEarned++;
      console.log('Life bonus awarded! Total lives earned:', system.livesEarned);
    }
  }
  
  console.log('Collected', collectedPoints, 'cherry points. Current gauge:', system.currentGauge);
});

Then('樱计量应为 {int}', function (this: CustomWorld, expectedGauge: number) {
  const system = this.gameState.cherryPointSystem;
  expect(system?.currentGauge).to.equal(expectedGauge);
  
  console.log('Cherry gauge verified:', expectedGauge);
});

Then('是否触发春度状态 = {string}', function (this: CustomWorld, shouldTrigger: string) {
  const system = this.gameState.cherryPointSystem;
  const springTriggered = system?.isInSpringState === true;
  
  if (shouldTrigger === '是') {
    expect(springTriggered).to.be.true;
  } else {
    expect(springTriggered).to.be.false;
  }
  
  console.log('Spring state trigger verified:', shouldTrigger);
});

// Spring state accumulation for life bonus
Given('已累计获得 {int} 次春度状态', function (this: CustomWorld, springCount: number) {
  if (!this.gameState.cherryPointSystem) {
    this.gameState.cherryPointSystem = {
      maxGauge: 50000,
      springDuration: 10,
      springThreshold: 50000,
      firstLifeBonusThreshold: 3,
      lifeBonusInterval: 5,
      currentGauge: 0,
      springCount: springCount,
      livesEarned: 0,
      isInSpringState: false
    };
  } else {
    this.gameState.cherryPointSystem.springCount = springCount;
  }
  
  console.log('Spring state count set to:', springCount);
});

When('再次进入春度状态', function (this: CustomWorld) {
  const system = this.gameState.cherryPointSystem;
  if (!system) return;
  
  const previousSpringCount = system.springCount;
  system.springCount++;
  system.isInSpringState = true;
  
  // Check for life bonus
  if (system.springCount === system.firstLifeBonusThreshold ||
      (system.springCount > system.firstLifeBonusThreshold && 
       (system.springCount - system.firstLifeBonusThreshold) % system.lifeBonusInterval === 0)) {
    system.livesEarned++;
    this.gameState.lifeBonus = true;
  }
  
  console.log('Entered spring state again. Count:', previousSpringCount, '->', system.springCount);
});

Then('玩家增加 {int} 残机', function (this: CustomWorld, expectedLives: number) {
  expect(this.gameState.lifeBonus).to.be.true;
  
  const system = this.gameState.cherryPointSystem;
  expect(system?.livesEarned).to.be.greaterThan(0);
  
  console.log('Life bonus verified. Expected lives:', expectedLives);
}); 