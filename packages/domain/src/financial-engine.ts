import {Decimal} from 'decimal.js';
import {lineAmount, roundQuantity, roundXof, toDecimal, type DecimalLike} from './money.js';

/**
 * Financial Calculation Engine — Section 70 du cahier des charges.
 * Fonctions pures, testées indépendamment de la base et du framework.
 * Toutes les valeurs monétaires sont en XOF (entiers), quantités et coûts unitaires en Decimal(18,6).
 */

export interface RecipeCostLine {
  materialId: string;
  quantity: DecimalLike;      // quantité dans l'unité de base de la matière
  unitCost: DecimalLike;      // coût unitaire CMP/FIFO dans l'unité de base
  wastagePct?: DecimalLike;   // % de perte appliqué à la ligne
}

export interface RecipeCostInput {
  lines: RecipeCostLine[];
  yieldQuantity: DecimalLike; // production attendue par lot (unités)
  lossRatePct?: DecimalLike;  // perte globale du lot (%)
  laborCost?: DecimalLike;    // main d'œuvre par lot (XOF)
  energyCost?: DecimalLike;   // énergie par lot (XOF)
  overheadCost?: DecimalLike; // frais fixes alloués par lot (XOF)
}

export interface RecipeCostResult {
  materialCost: Decimal;   // coût matière total du lot, pertes incluses
  addedCosts: Decimal;     // main d'œuvre + énergie + overhead
  totalCost: Decimal;      // coût complet du lot
  unitCost: Decimal;       // coût complet par unité produite (sur le rendement attendu)
  costPerUnitMaterial: Decimal;
  theoreticalYield: Decimal;
}

/** Coût de revient d'une recette : §16. Le coût unitaire est calculé sur la quantité réellement attendue (rendement déduit). */
export function calculateRecipeCost(input: RecipeCostInput): RecipeCostResult {
  const lossRate = toDecimal(input.lossRatePct ?? 0);
  let materialCost = new Decimal(0);
  for (const line of input.lines) {
    const qty = toDecimal(line.quantity);
    const wastage = toDecimal(line.wastagePct ?? 0);
    const effectiveQty = qty.times(new Decimal(1).plus(wastage.div(100)));
    materialCost = materialCost.plus(effectiveQty.times(toDecimal(line.unitCost)));
  }
  materialCost = materialCost.times(new Decimal(1).plus(lossRate.div(100)));

  const addedCosts = toDecimal(input.laborCost ?? 0)
    .plus(toDecimal(input.energyCost ?? 0))
    .plus(toDecimal(input.overheadCost ?? 0));

  const totalCost = materialCost.plus(addedCosts);
  const yieldQty = toDecimal(input.yieldQuantity);
  if (yieldQty.lte(0)) throw new Error('Le rendement d\u2019une recette doit être strictement positif');

  return {
    materialCost: roundQuantity(materialCost),
    addedCosts: roundXof(addedCosts),
    totalCost: roundXof(totalCost),
    unitCost: roundQuantity(totalCost.div(yieldQty)),
    costPerUnitMaterial: roundQuantity(materialCost.div(yieldQty)),
    theoreticalYield: yieldQty,
  };
}

export interface ProductionCostInput extends RecipeCostInput {
  batches: number | string; // nombre de lots produits
}

/** Coût de production agrégé pour N lots. */
export function calculateProductionCost(input: ProductionCostInput): {recipe: RecipeCostResult; totalCost: Decimal; materialCost: Decimal} {
  const recipe = calculateRecipeCost(input);
  const batches = toDecimal(input.batches);
  if (batches.lt(0)) throw new Error('Nombre de lots négatif interdit');
  return {recipe, totalCost: roundXof(recipe.totalCost.times(batches)), materialCost: roundXof(recipe.materialCost.times(batches))};
}

/** Coût unitaire : coût total / quantité produite (quantité > 0). */
export function calculateUnitCost(totalCost: DecimalLike, producedQuantity: DecimalLike): Decimal {
  const qty = toDecimal(producedQuantity);
  if (qty.lte(0)) throw new Error('Quantité produite strictement positive requise');
  return roundQuantity(toDecimal(totalCost).div(qty));
}

/** Marge brute en valeur et en %. */
export function calculateGrossMargin(salePrice: DecimalLike, costPrice: DecimalLike): {value: Decimal; pct: Decimal | null} {
  const price = toDecimal(salePrice);
  const value = roundXof(price.minus(toDecimal(costPrice)));
  const pct = price.isZero() ? null : value.div(price).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return {value, pct};
}

/** Marge nette : CA - coût de revient - charges directes. */
export function calculateNetMargin(revenue: DecimalLike, cogs: DecimalLike, opex: DecimalLike): {value: Decimal; pct: Decimal | null} {
  const rev = toDecimal(revenue);
  const value = roundXof(rev.minus(toDecimal(cogs)).minus(toDecimal(opex)));
  const pct = rev.isZero() ? null : value.div(rev).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return {value, pct};
}

export interface BreakEvenInput {
  fixedCosts: DecimalLike;          // XOF période
  averageSalePrice: DecimalLike;    // XOF / unité
  averageVariableCost: DecimalLike; // XOF / unité
}

/** Seuil de rentabilité (§32) : unités et montant. Si marge sur coût variable <= 0 => infini signalé par null. */
export function calculateBreakEven(input: BreakEvenInput): {units: Decimal | null; revenue: Decimal | null; contributionPerUnit: Decimal} {
  const contribution = toDecimal(input.averageSalePrice).minus(toDecimal(input.averageVariableCost));
  if (contribution.lte(0)) return {units: null, revenue: null, contributionPerUnit: roundXof(contribution)};
  const units = roundQuantity(toDecimal(input.fixedCosts).div(contribution));
  return {units, revenue: roundXof(units.times(toDecimal(input.averageSalePrice))), contributionPerUnit: roundXof(contribution)};
}

export interface CashFlowEntry {date: string; amount: DecimalLike; direction: 'IN' | 'OUT'}

/** Flux net de trésorerie (§34) sur une liste d'entrées ; le solde cumulé n'est pas arrondi prématurément. */
export function calculateCashFlow(entries: CashFlowEntry[]): {inflows: Decimal; outflows: Decimal; net: Decimal} {
  let inflows = new Decimal(0);
  let outflows = new Decimal(0);
  for (const entry of entries) {
    const amount = toDecimal(entry.amount);
    if (entry.direction === 'IN') inflows = inflows.plus(amount); else outflows = outflows.plus(amount);
  }
  return {inflows: roundXof(inflows), outflows: roundXof(outflows), net: roundXof(inflows.minus(outflows))};
}

export interface StockLayer {quantity: DecimalLike; unitCost: DecimalLike}

/** Valorisation des stocks (§13/§65) : FIFO (premières couches consommées => reste les dernières), LIFO inverse, CMP pondéré. */
export function calculateInventoryValue(layers: StockLayer[], mode: 'FIFO' | 'LIFO' | 'CMP', remainingQuantity?: DecimalLike): Decimal {
  const priced = layers.map((layer) => ({qty: toDecimal(layer.quantity), cost: toDecimal(layer.unitCost)}));
  const total = priced.reduce((sum, layer) => sum.plus(layer.qty), new Decimal(0));
  if (!remainingQuantity) {
    const value = priced.reduce((sum, layer) => sum.plus(layer.qty.times(layer.cost)), new Decimal(0));
    return roundXof(value);
  }
  let remaining = toDecimal(remainingQuantity);
  if (remaining.gt(total)) remaining = total;
  // Les couches sont ordonnees de la plus ancienne a la plus recente.
  // FIFO : on consomme d'abord les couches anciennes -> la valeur restante vient des couches recentes (on parcourt a l'envers).
  // LIFO : on consomme d'abord les couches recentes -> la valeur restante vient des couches anciennes (on parcourt a l'endroit).
  const ordered = mode === 'FIFO' ? [...priced].reverse() : priced;
  let value = new Decimal(0);
  if (mode === 'CMP') {
    const cmp = total.isZero() ? new Decimal(0) : priced.reduce((sum, layer) => sum.plus(layer.qty.times(layer.cost)), new Decimal(0)).div(total);
    value = remaining.times(cmp);
  } else {
    let remainingValue = remaining;
    for (const layer of ordered) {
      const take = Decimal.min(layer.qty, remainingValue);
      value = value.plus(take.times(layer.cost));
      remainingValue = remainingValue.minus(take);
      if (remainingValue.isZero()) break;
    }
  }
  return roundXof(value);
}

/** Variation de prix fournisseur (§10) entre deux périodes. */
export function calculateSupplierPriceVariation(previousPrice: DecimalLike, currentPrice: DecimalLike): Decimal | null {
  const previous = toDecimal(previousPrice);
  if (previous.isZero()) return null;
  return toDecimal(currentPrice).minus(previous).div(previous).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** Coût des invendus/pertes (§21) : quantité × valeur de revient, avec option prix de vente perdu. */
export function calculateWasteCost(quantity: DecimalLike, unitCost: DecimalLike, unitPrice?: DecimalLike): {cost: Decimal; lostRevenue: Decimal | null} {
  const qty = toDecimal(quantity);
  const cost = roundXof(qty.times(toDecimal(unitCost)));
  const lostRevenue = unitPrice === undefined ? null : lineAmount(unitPrice, qty);
  return {cost, lostRevenue};
}

/** ROI (§42) : (gain net - investissement) / investissement × 100. */
export function calculateROI(investment: DecimalLike, netGain: DecimalLike): Decimal | null {
  const invest = toDecimal(investment);
  if (invest.isZero()) return null;
  return toDecimal(netGain).minus(invest).div(invest).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** Prévision simple (§20) : moyenne mobile sur les N dernières observations, pondérée vers le récent. */
export function calculateForecast(history: DecimalLike[], windowSize = 4): Decimal {
  if (history.length === 0) throw new Error('Historique vide : prévision impossible');
  const size = Math.max(1, Math.min(windowSize, history.length));
  const recent = history.slice(-size).map(toDecimal);
  let weightedSum = new Decimal(0);
  let weightTotal = new Decimal(0);
  recent.forEach((value, index) => {
    const weight = new Decimal(index + 1);
    weightedSum = weightedSum.plus(value.times(weight));
    weightTotal = weightTotal.plus(weight);
  });
  return roundQuantity(weightedSum.div(weightTotal));
}

/** Écart budgétaire (§44) : réalisé vs prévu, en valeur et %. */
export function calculateBudgetVariance(planned: DecimalLike, actual: DecimalLike): {value: Decimal; pct: Decimal | null} {
  const plan = toDecimal(planned);
  const value = roundXof(toDecimal(actual).minus(plan));
  const pct = plan.isZero() ? null : value.div(plan).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return {value, pct};
}
