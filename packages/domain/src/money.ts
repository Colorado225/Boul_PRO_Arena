import {Decimal} from 'decimal.js';

/**
 * Money & quantity primitives — Section 71 du cahier des charges.
 * Les montants XOF sont stockés sous forme d'entiers (le XOF n'a pas de sous-unité usuelle).
 * Les quantités et coûts unitaires utilisent Decimal(18,6) : jamais de float pour un calcul critique.
 */

export const XOF_DECIMAL_PLACES = 0;
export const QUANTITY_PRECISION = 6;

export type DecimalLike = string | number | Decimal;

/** Convertit une valeur quelconque en Decimal sans passer par le binaire de façon silencieuse. */
export function toDecimal(value: DecimalLike): Decimal {
  if (value instanceof Decimal) return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Montant non fini interdit');
    return new Decimal(value);
  }
  return new Decimal(value);
}

/** Arrondi commercial XOF : entier le plus proche, demi vers le haut (banker's arrondi refusé ici, documenté). */
export function roundXof(value: DecimalLike): Decimal {
  return toDecimal(value).toDecimalPlaces(XOF_DECIMAL_PLACES, Decimal.ROUND_HALF_UP);
}

/** Quantité / coût unitaire : 6 décimales, arrondi demi vers le haut. */
export function roundQuantity(value: DecimalLike): Decimal {
  return toDecimal(value).toDecimalPlaces(QUANTITY_PRECISION, Decimal.ROUND_HALF_UP);
}

/** Multiplie un prix unitaire par une quantité et retourne un montant XOF arrondi. */
export function lineAmount(unitPrice: DecimalLike, quantity: DecimalLike): Decimal {
  return roundXof(toDecimal(unitPrice).times(toDecimal(quantity)));
}

/** Taux de marge brute en pourcentage : (prix - coût) / prix * 100. Retourne null si prix nul. */
export function grossMarginPct(salePrice: DecimalLike, costPrice: DecimalLike): Decimal | null {
  const price = toDecimal(salePrice);
  if (price.isZero()) return null;
  return price.minus(toDecimal(costPrice)).div(price).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** Remise : pourcentage appliqué au sous-total ou montant fixe. */
export function applyDiscount(subtotal: DecimalLike, type: 'AMOUNT' | 'PERCENT', value: DecimalLike): Decimal {
  const base = toDecimal(subtotal);
  const raw = type === 'PERCENT' ? base.times(toDecimal(value)).div(100) : toDecimal(value);
  const discount = Decimal.min(raw, base); // la remise ne peut excéder le sous-total
  return roundXof(Decimal.max(discount, 0));
}
