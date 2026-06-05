import { Prisma } from '@prisma/client'
import {
  WHOLESALE_MINIMUM_ORDER_AUD,
  assertWholesaleMinimumOrder,
  isWholesaleMinimumMet,
} from '../config/wholesaleOrderRules'
import { ApiError } from '../utils/apiError'

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

function testRetailNotBlocked() {
  assertWholesaleMinimumOrder(null, new Prisma.Decimal('50'))
  assertWholesaleMinimumOrder(
    { role: 'CUSTOMER', wholesaleApprovalStatus: 'NONE' },
    new Prisma.Decimal('50'),
  )
}

function testPendingWholesaleNotBlocked() {
  assertWholesaleMinimumOrder(
    { role: 'WHOLESALE', wholesaleApprovalStatus: 'PENDING' },
    new Prisma.Decimal('50'),
  )
}

function testApprovedWholesaleBlocksUnderMinimum() {
  let threw = false
  try {
    assertWholesaleMinimumOrder(
      { role: 'WHOLESALE', wholesaleApprovalStatus: 'APPROVED' },
      new Prisma.Decimal('299.99'),
    )
  } catch (e) {
    threw = e instanceof ApiError && e.code === 'WHOLESALE_MINIMUM_NOT_MET'
  }
  assert(threw, '299.99 should block approved wholesale')
}

function testApprovedWholesaleAllowsAtMinimum() {
  assertWholesaleMinimumOrder(
    { role: 'WHOLESALE', wholesaleApprovalStatus: 'APPROVED' },
    new Prisma.Decimal('300.00'),
  )
}

function testApprovedWholesaleAllowsAboveMinimum() {
  assertWholesaleMinimumOrder(
    { role: 'WHOLESALE', wholesaleApprovalStatus: 'APPROVED' },
    new Prisma.Decimal('450.50'),
  )
}

function testMinimumConstant() {
  assert(WHOLESALE_MINIMUM_ORDER_AUD === 300, 'minimum should be 300')
  assert(isWholesaleMinimumMet(new Prisma.Decimal('300')), '300 should meet minimum')
  assert(!isWholesaleMinimumMet(new Prisma.Decimal('299.99')), '299.99 should not meet minimum')
}

function main() {
  testMinimumConstant()
  testRetailNotBlocked()
  testPendingWholesaleNotBlocked()
  testApprovedWholesaleBlocksUnderMinimum()
  testApprovedWholesaleAllowsAtMinimum()
  testApprovedWholesaleAllowsAboveMinimum()
  console.log('wholesaleMinimumOrderRules: all tests passed')
}

main()
