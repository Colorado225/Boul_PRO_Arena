import test from 'node:test';
import assert from 'node:assert/strict';
import {Decimal} from 'decimal.js';
import {applyDiscount, grossMarginPct, lineAmount, roundQuantity, roundXof, toDecimal} from './money.js';
import {
  calculateBreakEven,
  calculateBudgetVariance,
  calculateCashFlow,
  calculateForecast,
  calculateGrossMargin,
  calculateInventoryValue,
  calculateNetMargin,
  calculateProductionCost,
  calculateRecipeCost,
  calculateROI,
  calculateSupplierPriceVariation,
  calculateUnitCost,
  calculateWasteCost,
} from './financial-engine.js';

test('roundXof applique l\u2019arrondi commercial demi-vers-le-haut', () => {
  assert.equal(roundXof(1500.4).toString(), '1500');
  assert.equal(roundXof(1500.5).toString(), '1501');
  assert.equal(roundXof('1500.5').toString(), '1501');
});

test('lineAmount ne perd pas de precision sur les gros volumes', () => {
  // 123456789 * 3 = 370370367 : safe integer, verifie que Decimal est utilise partout
  assert.equal(lineAmount(123456789, 3).toString(), '370370367');
  assert.equal(lineAmount('250', '3.5').toString(), '875');
});

test('toDecimal refuse les valeurs non finies', () => {
  assert.throws(() => toDecimal(Number.NaN));
  assert.throws(() => toDecimal(Number.POSITIVE_INFINITY));
});

test('grossMarginPct et applyDiscount', () => {
  assert.equal(grossMarginPct(250, 100)?.toString(), '60');
  assert.equal(grossMarginPct(0, 100), null);
  assert.equal(applyDiscount(1000, 'PERCENT', 15).toString(), '150');
  assert.equal(applyDiscount(1000, 'AMOUNT', 1500).toString(), '1000', 'la remise est plafonnee au sous-total');
});

test('calculateRecipeCost inclut pertes ligne, perte lot et couts ajoutés', () => {
  const result = calculateRecipeCost({
    lines: [
      {materialId: 'farine', quantity: 10, unitCost: 300, wastagePct: 2},   // 10*1.02*300 = 3060
      {materialId: 'levure', quantity: 0.2, unitCost: 2500},                // 500
    ],
    yieldQuantity: 100,
    lossRatePct: 5,          // (3060+500)*1.05 = 3738
    laborCost: 1000,
    energyCost: 500,
    overheadCost: 262,
  });
  assert.equal(result.materialCost.toString(), '3738');
  assert.equal(result.addedCosts.toString(), '1762');
  assert.equal(result.totalCost.toString(), '5500');
  assert.equal(result.unitCost.toString(), '55');
});

test('calculateRecipeCost refuse un rendement nul', () => {
  assert.throws(() => calculateRecipeCost({lines: [], yieldQuantity: 0}), /strictement positif/);
});

test('calculateProductionCost agrege N lots', () => {
  const result = calculateProductionCost({
    lines: [{materialId: 'f', quantity: 1, unitCost: 100}],
    yieldQuantity: 10,
    batches: 3,
  });
  assert.equal(result.recipe.totalCost.toString(), '100');
  assert.equal(result.totalCost.toString(), '300');
});

test('calculateUnitCost / margins', () => {
  assert.equal(calculateUnitCost(1000, 8).toString(), '125');
  assert.throws(() => calculateUnitCost(1000, 0));
  assert.deepEqual({...calculateGrossMargin(250, 100)}, {value: new Decimal(150), pct: new Decimal('60')});
  assert.equal(calculateNetMargin(1_000_000, 600_000, 300_000).value.toString(), '100000');
  assert.equal(calculateNetMargin(1_000_000, 600_000, 300_000).pct?.toString(), '10');
});

test('calculateBreakEven', () => {
  const be = calculateBreakEven({fixedCosts: 1_500_000, averageSalePrice: 250, averageVariableCost: 100});
  assert.equal(be.contributionPerUnit.toString(), '150');
  assert.equal(be.units?.toString(), '10000');
  assert.equal(be.revenue?.toString(), '2500000');
  const impossible = calculateBreakEven({fixedCosts: 1000, averageSalePrice: 100, averageVariableCost: 120});
  assert.equal(impossible.units, null);
});

test('calculateCashFlow somme entrees et sorties', () => {
  const flow = calculateCashFlow([
    {date: '2026-10-01', amount: 50_000, direction: 'IN'},
    {date: '2026-10-02', amount: 20_000, direction: 'OUT'},
    {date: '2026-10-03', amount: 5_500, direction: 'OUT'},
  ]);
  assert.equal(flow.inflows.toString(), '50000');
  assert.equal(flow.outflows.toString(), '25500');
  assert.equal(flow.net.toString(), '24500');
});

test('calculateInventoryValue FIFO vs LIFO vs CMP', () => {
  const layers = [
    {quantity: 10, unitCost: 100}, // ancien
    {quantity: 10, unitCost: 200}, // recent
  ];
  assert.equal(calculateInventoryValue(layers, 'FIFO').toString(), '3000');
  // il reste 10 -> en FIFO on a consomme la couche ancienne, la valeur restante est la couche recente
  assert.equal(calculateInventoryValue(layers, 'FIFO', 10).toString(), '2000');
  assert.equal(calculateInventoryValue(layers, 'LIFO', 10).toString(), '1000');
  assert.equal(calculateInventoryValue(layers, 'CMP', 10).toString(), '1500');
});

test('calculateSupplierPriceVariation / ROI / waste / budget / forecast', () => {
  assert.equal(calculateSupplierPriceVariation(250, 270)?.toString(), '8');
  assert.equal(calculateSupplierPriceVariation(0, 10), null);
  assert.equal(calculateROI(1_000_000, 1_250_000)?.toString(), '25');
  assert.equal(calculateWasteCost(12, 150, 250).cost.toString(), '1800');
  assert.equal(calculateWasteCost(12, 150, 250).lostRevenue.toString(), '3000');
  assert.equal(calculateBudgetVariance(500_000, 550_000).value.toString(), '50000');
  assert.equal(calculateBudgetVariance(500_000, 550_000).pct?.toString(), '10');
  // moyenne mobile ponderee [100,110,120,130] poids 1..4 => (100+220+360+520)/10 = 120
  assert.equal(calculateForecast([100, 110, 120, 130], 4).toString(), '120');
  assert.throws(() => calculateForecast([]));
});
