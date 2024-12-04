import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Create badge test - owner only",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            // Owner creating badge should succeed
            Tx.contractCall('badge-system', 'create-badge', [
                types.uint(1),
                types.ascii("First Achievement"),
                types.ascii("First achievement badge"),
                types.ascii("Complete first task"),
                types.uint(100)
            ], deployer.address),
            
            // Non-owner creating badge should fail
            Tx.contractCall('badge-system', 'create-badge', [
                types.uint(2),
                types.ascii("Second Achievement"),
                types.ascii("Second achievement badge"),
                types.ascii("Complete second task"),
                types.uint(200)
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        block.receipts[1].result.expectErr(types.uint(100));
    }
});

Clarinet.test({
    name: "Award badge test",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // First create a badge
        let setup = chain.mineBlock([
            Tx.contractCall('badge-system', 'create-badge', [
                types.uint(1),
                types.ascii("First Achievement"),
                types.ascii("First achievement badge"),
                types.ascii("Complete first task"),
                types.uint(100)
            ], deployer.address)
        ]);
        
        setup.receipts[0].result.expectOk();
        
        // Test awarding badge
        let block = chain.mineBlock([
            Tx.contractCall('badge-system', 'award-badge', [
                types.principal(wallet1.address),
                types.uint(1)
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Verify badge ownership
        let verifyBlock = chain.mineBlock([
            Tx.contractCall('badge-system', 'has-badge', [
                types.principal(wallet1.address),
                types.uint(1)
            ], deployer.address)
        ]);
        
        verifyBlock.receipts[0].result.expectOk().expectBool(true);
    }
});
