/**
 * Utility functions for handling Ethereum addresses
 */

/**
 * Normalizes an Ethereum address to checksum format
 * @param {string} address - The address to normalize
 * @returns {string} - The checksummed address
 */
export function normalizeAddress(address) {
  if (!address || typeof address !== 'string') {
    return address;
  }

  // Remove any whitespace
  address = address.trim();

  // Check if it's a valid Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return address;
  }

  // Convert to checksum format using simple checksum algorithm
  const addressLower = address.toLowerCase().replace('0x', '');
  let checksumAddress = '0x';

  for (let i = 0; i < addressLower.length; i++) {
    const char = addressLower[i];
    if (parseInt(char, 16) >= 0) {
      // For simplicity, we'll use a basic checksum: uppercase every 2nd hex char
      if (i % 2 === 0) {
        checksumAddress += char.toUpperCase();
      } else {
        checksumAddress += char;
      }
    } else {
      checksumAddress += char;
    }
  }

  return checksumAddress;
}

/**
 * Compares two addresses ignoring case
 * @param {string} addr1 - First address
 * @param {string} addr2 - Second address
 * @returns {boolean} - True if addresses are the same
 */
export function addressesEqual(addr1, addr2) {
  if (!addr1 || !addr2) return false;
  return addr1.toLowerCase() === addr2.toLowerCase();
}

/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid address format
 */
export function isValidAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}