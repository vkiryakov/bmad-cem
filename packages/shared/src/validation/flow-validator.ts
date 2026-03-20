import { ISurveyFlow } from '../types/survey-flow.type';

export enum FlowValidationErrorType {
  DEAD_END = 'DEAD_END',
  CYCLE = 'CYCLE',
  DISCONNECTED_START = 'DISCONNECTED_START',
  UNREACHABLE_NODE = 'UNREACHABLE_NODE',
}

export interface IFlowValidationError {
  type: FlowValidationErrorType;
  message: string;
  nodeIds: string[];
  edgeIds?: string[];
}

export interface IFlowValidationResult {
  valid: boolean;
  errors: IFlowValidationError[];
}

export function findDeadEndNodes(flow: ISurveyFlow): string[] {
  const nodesWithOutgoing = new Set(flow.edges.map((e) => e.source));
  return flow.nodes
    .filter((n) => n.type !== 'thankYou' && !nodesWithOutgoing.has(n.id))
    .map((n) => n.id);
}

export function findCycles(flow: ISurveyFlow): string[][] {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;

  const color = new Map<string, number>();
  const parent = new Map<string, string | null>();
  const adj = new Map<string, string[]>();

  for (const node of flow.nodes) {
    color.set(node.id, WHITE);
    adj.set(node.id, []);
  }

  for (const edge of flow.edges) {
    const targets = adj.get(edge.source);
    if (targets) {
      targets.push(edge.target);
    }
  }

  const cycles: string[][] = [];

  function dfs(nodeId: string, path: string[]): void {
    color.set(nodeId, GRAY);
    path.push(nodeId);

    const neighbors = adj.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      const neighborColor = color.get(neighbor);
      if (neighborColor === GRAY) {
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
      } else if (neighborColor === WHITE) {
        parent.set(neighbor, nodeId);
        dfs(neighbor, path);
      }
    }

    path.pop();
    color.set(nodeId, BLACK);
  }

  for (const node of flow.nodes) {
    if (color.get(node.id) === WHITE) {
      dfs(node.id, []);
    }
  }

  return cycles;
}

export function findDisconnectedStart(flow: ISurveyFlow): boolean {
  const welcomeNode = flow.nodes.find((n) => n.type === 'welcome');
  if (!welcomeNode) {
    return true;
  }
  return !flow.edges.some((e) => e.source === welcomeNode.id);
}

export function findUnreachableNodes(flow: ISurveyFlow): string[] {
  const welcomeNode = flow.nodes.find((n) => n.type === 'welcome');
  if (!welcomeNode) {
    return flow.nodes.map((n) => n.id);
  }

  const adj = new Map<string, string[]>();
  for (const node of flow.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of flow.edges) {
    const targets = adj.get(edge.source);
    if (targets) {
      targets.push(edge.target);
    }
  }

  const visited = new Set<string>();
  const queue: string[] = [welcomeNode.id];
  visited.add(welcomeNode.id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adj.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return flow.nodes
    .filter((n) => !visited.has(n.id))
    .map((n) => n.id);
}

export function validateFlow(flow: ISurveyFlow): IFlowValidationResult {
  const errors: IFlowValidationError[] = [];

  const deadEnds = findDeadEndNodes(flow);
  if (deadEnds.length > 0) {
    errors.push({
      type: FlowValidationErrorType.DEAD_END,
      message: `Найдены тупиковые ноды без исходящих рёбер: ${deadEnds.join(', ')}`,
      nodeIds: deadEnds,
    });
  }

  const cycles = findCycles(flow);
  if (cycles.length > 0) {
    for (const cycle of cycles) {
      errors.push({
        type: FlowValidationErrorType.CYCLE,
        message: `Обнаружен цикл: ${cycle.join(' → ')}`,
        nodeIds: cycle,
      });
    }
  }

  if (findDisconnectedStart(flow)) {
    const welcomeNode = flow.nodes.find((n) => n.type === 'welcome');
    errors.push({
      type: FlowValidationErrorType.DISCONNECTED_START,
      message: 'WelcomeNode не соединена ни с одной нодой',
      nodeIds: welcomeNode ? [welcomeNode.id] : [],
    });
  }

  const unreachable = findUnreachableNodes(flow);
  if (unreachable.length > 0) {
    errors.push({
      type: FlowValidationErrorType.UNREACHABLE_NODE,
      message: `Недостижимые ноды: ${unreachable.join(', ')}`,
      nodeIds: unreachable,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
