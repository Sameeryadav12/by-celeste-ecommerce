import {
  WHOLESALE_MINIMUM_ORDER_AUD,
  evaluateWholesaleMinimum,
  wholesaleMinimumStatusMessage,
} from './wholesaleOrderRules'

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

function testRetailNotAffected() {
  const s = evaluateWholesaleMinimum({ isApprovedWholesale: false, productSubtotal: 50 })
  assert(!s.applies, 'retail should not apply rule')
}

function testApprovedBlocksUnderMinimum() {
  const s = evaluateWholesaleMinimum({ isApprovedWholesale: true, productSubtotal: 299.99 })
  assert(s.applies && !s.meetsMinimum, '299.99 should block')
  assert(s.remaining === 0.01, 'remaining should be 0.01')
}

function testApprovedAllowsAtMinimum() {
  const s = evaluateWholesaleMinimum({ isApprovedWholesale: true, productSubtotal: 300 })
  assert(s.applies && s.meetsMinimum, '300 should allow')
  assert(wholesaleMinimumStatusMessage(s) === 'Wholesale minimum reached.', 'status message')
}

function testCouponDoesNotChangeEligibilityInput() {
  // Caller passes pre-discount subtotal; 280 with coupon still uses 280 for eligibility.
  const s = evaluateWholesaleMinimum({ isApprovedWholesale: true, productSubtotal: 280 })
  assert(!s.meetsMinimum, 'pre-discount subtotal under 300 blocks')
}

function main() {
  assert(WHOLESALE_MINIMUM_ORDER_AUD === 300, 'constant is 300')
  testRetailNotAffected()
  testApprovedBlocksUnderMinimum()
  testApprovedAllowsAtMinimum()
  testCouponDoesNotChangeEligibilityInput()
  console.log('frontend wholesaleOrderRules: all tests passed')
}

main()
