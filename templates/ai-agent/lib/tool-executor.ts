/**
 * Agent Tool Executor
 *
 * Handles the execution of tools called by the AI model.
 * Add new tool handlers here when you add new tools to tools.ts.
 */

import { publishJson, downloadJson, sha256Hex } from '@/lib/0g/storage';
import { anchorHash } from '@/lib/0g/chain';
import { listServices } from '@/lib/0g/compute';
import { checkHealth } from '@/lib/0g/health';

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  switch (name) {
    case 'store_data': {
      const result = await publishJson(args.data);
      return {
        success: true,
        label: args.label || null,
        ...result,
      };
    }

    case 'retrieve_data': {
      const result = await downloadJson(args.rootHash as string);
      return {
        success: true,
        ...result,
      };
    }

    case 'anchor_proof': {
      const dataHash = sha256Hex(args.data as string);
      const result = await anchorHash(dataHash);
      return {
        success: true,
        dataHash,
        ...result,
      };
    }

    case 'list_compute_services': {
      const services = await listServices((args.limit as number) || 10);
      return {
        success: true,
        count: services.length,
        services,
      };
    }

    case 'check_health': {
      const health = await checkHealth();
      return {
        success: true,
        ...health,
      };
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}
