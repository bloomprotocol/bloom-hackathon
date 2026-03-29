/**
 * BloomSkillEscrow contract ABI and helpers.
 * Uses viem for keccak256 hashing and ABI encoding.
 */
import { keccak256, toHex, parseUnits, parseAbi } from 'viem';

// Contract address from env
export const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '';

// USDC on Base
const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_DECIMALS = 6;

// ============ ABI Definitions ============

export const ESCROW_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function deposit(bytes32 skillHash, uint256 amount)',
  'function depositBatch(bytes32[] skillHashes, uint256[] amounts)',
  'function builderWithdraw(bytes32 skillHash, uint256 amount)',
  'function claimRefund(bytes32 skillHash)',
  'function getDeposit(bytes32 skillHash, address backer) view returns (uint256)',
  'function getAvailableEscrow(bytes32 skillHash) view returns (uint256)',
  'function isRefundEligible(bytes32 skillHash, address backer) view returns (bool eligible, uint256 eligibleAt)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
]);

export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
]);

export const EXCLUSIVE_PASS_ABI = parseAbi([
  'function mint(bytes32 skillHash)',
  'function minted(bytes32 skillHash) view returns (bool)',
]);

// ============ Helpers ============

/**
 * Convert a skill slug to its keccak256 hash (bytes32).
 * Uses viem's keccak256 — same result as Solidity keccak256(abi.encodePacked(slug)).
 */
export function slugToSkillHash(slug: string): `0x${string}` {
  return keccak256(toHex(slug));
}

/**
 * Parse a USDC amount (float) to its wei BigInt representation.
 */
export function parseUsdcAmount(amount: number): bigint {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid USDC amount: ${amount}`);
  }
  return parseUnits(amount.toFixed(USDC_DECIMALS), USDC_DECIMALS);
}

export { BASE_USDC_ADDRESS, USDC_DECIMALS };
