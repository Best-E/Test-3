import { type Address } from 'viem';
export type IdentityType = 'None' | 'Human' | 'Agent';
export type CheckResult = {
    status: 'match' | 'mismatch' | 'unverified' | 'expired' | 'no_id_given' | 'type_mismatch';
    actualId: string;
    idType: IdentityType;
    riskLevel: 'safe' | 'warn' | 'danger' | 'info';
    canProceed: boolean;
    message: string;
};
export declare function createRegistry(rpcUrl: string | undefined, contractAddress: Address): {
    verify: ({ address, claimedId }: {
        address: Address;
        claimedId?: string;
    }) => Promise<CheckResult>;
};
