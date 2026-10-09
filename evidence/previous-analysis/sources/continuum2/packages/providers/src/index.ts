export class GitHubProvider {
  supportsIdempotencyKeys = false;

  async prepare(op: any): Promise<{ effect: unknown; natural_key?: string }> {
    // Determine natural key for reconciliation
    let naturalKey: string | undefined = undefined;
    if (op.action === 'pull_request.create') {
        const params = JSON.parse(op.params_digest || '{}');
        naturalKey = params.head || `continuum/op_${op.operation_id}`;
    }

    return {
      effect: {
         action: op.action,
         resource: op.resource,
         params: op.params_digest
      },
      natural_key: naturalKey
    };
  }

  async execute(effect: any, cred: { token: string; expires_at: string }): Promise<any> {
     // Simulated execution for tests/demo
     return {
       v: 1,
       receipt_id: `rcp_sim${Date.now()}`,
       tenant_id: 'ten_sim',
       operation_id: 'op_sim',
       outcome: 'COMMITTED',
       observed_via: 'response',
       at: new Date().toISOString()
     };
  }

  async reconcile(op: any): Promise<"COMMITTED" | "ABSENT" | "UNDETERMINED"> {
     if (!op.natural_key) {
        return "UNDETERMINED";
     }

     // Simulated read-back based on natural_key
     if (op.natural_key.includes("continuum/op_")) {
         return "COMMITTED"; // Simulate finding it
     }

     return "ABSENT";
  }
}

// Agent Gateway configuration representation
export class RunloopContainment {
  static getAgentGatewayConfig() {
    return {
      network_policy: {
        allow_devbox_to_devbox: false,
        allowlist: [
          "registry.npmjs.org",
          "pypi.org"
        ],
        denylist: [
          "api.github.com" // Must go through EB
        ],
        default: "deny"
      },
      credential_broker: {
         enabled: true,
         inject_canaries: true
      }
    };
  }
}
