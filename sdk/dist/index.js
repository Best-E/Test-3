"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegistry = createRegistry;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const abi_1 = require("./abi");
function toIdentityType(raw) {
    if (raw === 1)
        return 'Human';
    if (raw === 2)
        return 'Agent';
    return 'None';
}
function createRegistry(rpcUrl = 'https://bsc-dataseed.binance.org', contractAddress) {
    const client = (0, viem_1.createPublicClient)({ chain: chains_1.bsc, transport: (0, viem_1.http)(rpcUrl) });
    return {
        verify: async ({ address, claimedId }) => {
            if (!claimedId) {
                const [identifier, idTypeRaw, , expired] = await client.readContract({
                    address: contractAddress, abi: abi_1.abi, functionName: 'resolveAddress', args: [address]
                });
                if (!identifier)
                    return { status: 'unverified', actualId: '', idType: 'None', riskLevel: 'warn', canProceed: false, message: '⚠️ No identifier linked. High risk' };
                return { status: 'no_id_given', actualId: identifier, idType: toIdentityType(idTypeRaw), riskLevel: 'info', canProceed: true, message: `ℹ️ This address is ${identifier}. Confirm?` };
            }
            const [match, actualId, idTypeRaw, expired] = await client.readContract({
                address: contractAddress, abi: abi_1.abi, functionName: 'verifyPair', args: [address, claimedId]
            });
            const idType = toIdentityType(idTypeRaw);
            if (expired)
                return { status: 'expired', actualId, idType, riskLevel: 'danger', canProceed: false, message: '⛔ Identifier expired' };
            if (!match)
                return { status: 'mismatch', actualId, idType, riskLevel: 'danger', canProceed: false, message: `⛔ MISMATCH: Address belongs to ${actualId}` };
            if (claimedId.startsWith('@') && idTypeRaw !== 1)
                return { status: 'type_mismatch', actualId, idType: 'Agent', riskLevel: 'danger', canProceed: false, message: '⛔ TYPE ERROR: Address is Agent but you entered @human' };
            if (claimedId.startsWith('#') && idTypeRaw !== 2)
                return { status: 'type_mismatch', actualId, idType: 'Human', riskLevel: 'danger', canProceed: false, message: '⛔ TYPE ERROR: Address is Human but you entered #agent' };
            return { status: 'match', actualId, idType: idTypeRaw === 1 ? 'Human' : 'Agent', riskLevel: 'safe', canProceed: true, message: `✅ Verified: ${actualId}` };
        }
    };
}
