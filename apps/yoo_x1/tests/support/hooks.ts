import { Before, After, BeforeAll, AfterAll, ITestCaseHookParameter } from '@cucumber/cucumber';
import { CustomWorld } from './world';

BeforeAll(async function () {
  console.log('🎮 Starting Touhou Youyoumu Cucumber Test Suite');
  console.log('=====================================');
});

AfterAll(async function () {
  console.log('=====================================');
  console.log('🎮 Touhou Youyoumu Test Suite Complete');
});

Before(async function (this: CustomWorld) {
  // Reset game state before each scenario
  this.resetGameState();
  console.log(`\n🎯 Starting new scenario`);
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === 'FAILED') {
    console.log(`❌ Scenario failed: ${scenario.pickle.name}`);
    console.log('Game State:', JSON.stringify(this.gameState, null, 2));
  } else {
    console.log(`✅ Scenario passed: ${scenario.pickle.name}`);
  }
  
  // Clean up after each scenario
  this.resetGameState();
}); 