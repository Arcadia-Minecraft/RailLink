/**
 * sdhcp-common
 * Shared types, constants, interfaces, and utility functions for the SDHCP project.
 *
 * This module defines:
 * - The Address64 type: A 64-bit address split into four 16-bit segments.
 * - DHCP message types and interfaces.
 * - Common constants and configuration defaults.
 * - Interfaces for subnet configuration and lease information.
 * - A custom DHCPError class for consistent error handling.
 * - Utility functions for address conversion and network calculations.
 *
 * @module sdhcp-common
 */

/**
 * Represents a 64-bit address divided into four 16-bit segments.
 * Each segment ranges from 0 to 65535.
 *
 * @typedef { [number, number, number, number] } Address64
 */
export type Address64 = [number, number, number, number];

/**
 * DHCP message types.
 *
 * @enum {string}
 */
export type DHCPMessageType =
  | 'DHCP_DISCOVER'
  | 'DHCP_OFFER'
  | 'DHCP_REQUEST'
  | 'DHCP_ACK';

/**
 * Base interface for all DHCP messages.
 *
 * @interface DHCPMessage
 */
export interface DHCPMessage {
  /** Type of the DHCP message */
  type: DHCPMessageType;
  /** Unique identifier of the client */
  clientId: string;
}

/**
 * DHCP Discover message sent by clients to request an address.
 *
 * @interface DHCPDiscover
 * @extends DHCPMessage
 */
export interface DHCPDiscover extends DHCPMessage {
  type: 'DHCP_DISCOVER';
  /** Optional requested lease time in seconds */
  requestedLeaseTime?: number;
  /** Optional desired prefix length (e.g., 48) */
  desiredPrefixLength?: number;
}

/**
 * DHCP Offer message sent by the server with an available address.
 *
 * @interface DHCPOffer
 * @extends DHCPMessage
 */
export interface DHCPOffer extends DHCPMessage {
  type: 'DHCP_OFFER';
  /** Unique identifier of the server */
  serverId: string;
  /** Offered 64-bit address */
  offeredAddress: Address64;
  /** The prefix length for the offered address (e.g., 48) */
  prefixLength: number;
  /** Lease time in seconds */
  leaseTime: number;
}

/**
 * DHCP Request message sent by the client to accept an offered address.
 *
 * @interface DHCPRequest
 * @extends DHCPMessage
 */
export interface DHCPRequest extends DHCPMessage {
  type: 'DHCP_REQUEST';
  /** Unique identifier of the server */
  serverId: string;
  /** The requested 64-bit address */
  requestedAddress: Address64;
  /** The prefix length associated with the requested address */
  prefixLength: number;
}

/**
 * DHCP Acknowledge message sent by the server to confirm the lease.
 *
 * @interface DHCPAck
 * @extends DHCPMessage
 */
export interface DHCPAck extends DHCPMessage {
  type: 'DHCP_ACK';
  /** Unique identifier of the server */
  serverId: string;
  /** The assigned 64-bit address */
  assignedAddress: Address64;
  /** The prefix length associated with the assigned address */
  prefixLength: number;
  /** Lease time in seconds */
  leaseTime: number;
}

/**
 * Union type for all DHCP packets.
 *
 * @typedef {DHCPDiscover | DHCPOffer | DHCPRequest | DHCPAck} DHCPPacket
 */
export type DHCPPacket = DHCPDiscover | DHCPOffer | DHCPRequest | DHCPAck;

/**
 * Default lease time in seconds.
 * @constant {number}
 */
export const DEFAULT_LEASE_TIME = 3600;

/**
 * Default prefix length.
 * @constant {number}
 */
export const DEFAULT_PREFIX_LENGTH = 48;

/**
 * Default DHCP server port.
 * @constant {number}
 */
export const DEFAULT_DHCP_PORT = 67;

/**
 * Represents a subnet configuration.
 *
 * @interface SubnetConfig
 */
export interface SubnetConfig {
  /** The base address for the subnet */
  baseAddress: Address64;
  /** The prefix length for the subnet (0 to 64) */
  prefixLength: number;
  /** The starting value for the host portion */
  poolStart: number;
  /** The ending value for the host portion */
  poolEnd: number;
}

/**
 * Represents lease information for a client.
 *
 * @interface LeaseInfo
 */
export interface LeaseInfo {
  /** Unique identifier of the client */
  clientId: string;
  /** The leased 64-bit address */
  address: Address64;
  /** Expiry time as a Unix timestamp (milliseconds) */
  expiry: number;
  /** Prefix length associated with the leased address */
  prefixLength: number;
}

/**
 * Custom error class for DHCP-related errors.
 *
 * @class DHCPError
 * @extends {Error}
 */
export class DHCPError extends Error {
  /**
   * Creates a new DHCPError.
   * @param {string} message - Error message.
   */
  constructor(message: string) {
    super(message);
    this.name = 'DHCPError';
  }
}

/**
 * Converts a 64-bit address into a human-readable string.
 *
 * @param {Address64} address - The 64-bit address as a tuple of four numbers.
 * @returns {string} The address in dot-separated format (e.g., "0.10.1024.65535").
 */
export function addressToString(address: Address64): string {
  return address.join('.');
}

/**
 * Parses a human-readable address string into a 64-bit address.
 *
 * @param {string} addressStr - The address in dot-separated format (e.g., "0.10.1024.65535").
 * @returns {Address64} The 64-bit address as a tuple of four numbers.
 * @throws {Error} If the address format is invalid.
 */
export function stringToAddress(addressStr: string): Address64 {
  const parts = addressStr.split('.').map(part => parseInt(part, 10));
  if (parts.length !== 4 || parts.some(num => isNaN(num))) {
    throw new Error(`Invalid address format: ${addressStr}`);
  }
  return parts as Address64;
}

/**
 * Computes a 64-bit subnet mask given a prefix length.
 *
 * @param {number} prefixLength - The number of bits for the network portion (0 to 64).
 * @returns {Address64} The computed subnet mask as a 64-bit address.
 */
export function getSubnetMask(prefixLength: number): Address64 {
  const mask: number[] = [];
  let remainingBits = prefixLength;
  for (let i = 0; i < 4; i++) {
    if (remainingBits >= 16) {
      mask.push(0xFFFF);
      remainingBits -= 16;
    } else if (remainingBits > 0) {
      // Create a mask for the remaining bits in this segment.
      const segMask = (0xFFFF << (16 - remainingBits)) & 0xFFFF;
      mask.push(segMask);
      remainingBits = 0;
    } else {
      mask.push(0);
    }
  }
  return mask as Address64;
}

/**
 * Serializes a DHCP packet into a JSON string.
 *
 * @param {DHCPPacket} packet - The DHCP packet to serialize.
 * @returns {string} The JSON string representation of the packet.
 */
export function serializeDHCPPacket(packet: DHCPPacket): string {
  return JSON.stringify(packet);
}

/**
 * Deserializes a JSON string into a DHCP packet.
 *
 * @param {string} json - The JSON string representation of a DHCP packet.
 * @returns {DHCPPacket} The deserialized DHCP packet.
 * @throws {Error} If the JSON is invalid or does not represent a proper DHCP packet.
 */
export function deserializeDHCPPacket(json: string): DHCPPacket {
  try {
    const obj = JSON.parse(json);
    // Here you might add further validation if necessary.
    return obj as DHCPPacket;
  } catch (err) {
    throw new DHCPError("Invalid DHCP packet JSON");
  }
}
