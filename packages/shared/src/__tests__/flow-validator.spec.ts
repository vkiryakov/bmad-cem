import {
  validateFlow,
  findDeadEndNodes,
  findCycles,
  findDisconnectedStart,
  findUnreachableNodes,
  FlowValidationErrorType,
} from '../validation/flow-validator';
import { ISurveyFlow } from '../types/survey-flow.type';

function makeNode(id: string, type: string): ISurveyFlow['nodes'][0] {
  return { id, type, position: { x: 0, y: 0 }, data: { label: id, outputs: [] } };
}

function makeEdge(source: string, target: string): ISurveyFlow['edges'][0] {
  return { id: `${source}-${target}`, source, sourceHandle: 'default', target };
}

describe('flow-validator', () => {
  const validFlow: ISurveyFlow = {
    nodes: [
      makeNode('welcome', 'welcome'),
      makeNode('q1', 'survey'),
      makeNode('thanks', 'thankYou'),
    ],
    edges: [
      makeEdge('welcome', 'q1'),
      makeEdge('q1', 'thanks'),
    ],
  };

  describe('validateFlow', () => {
    it('should return valid for a correct flow', () => {
      const result = validateFlow(validFlow);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect all errors in an invalid flow', () => {
      const invalidFlow: ISurveyFlow = {
        nodes: [
          makeNode('welcome', 'welcome'),
          makeNode('q1', 'survey'),
          makeNode('orphan', 'survey'),
        ],
        edges: [],
      };
      const result = validateFlow(invalidFlow);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('findDeadEndNodes', () => {
    it('should find nodes without outgoing edges (excluding thankYou)', () => {
      const flow: ISurveyFlow = {
        nodes: [
          makeNode('welcome', 'welcome'),
          makeNode('q1', 'survey'),
          makeNode('thanks', 'thankYou'),
        ],
        edges: [makeEdge('welcome', 'q1')],
      };
      const deadEnds = findDeadEndNodes(flow);
      expect(deadEnds).toEqual(['q1']);
    });

    it('should not flag thankYou as dead end', () => {
      const deadEnds = findDeadEndNodes(validFlow);
      expect(deadEnds).toEqual([]);
    });
  });

  describe('findCycles', () => {
    it('should detect a cycle', () => {
      const flow: ISurveyFlow = {
        nodes: [
          makeNode('welcome', 'welcome'),
          makeNode('a', 'survey'),
          makeNode('b', 'survey'),
        ],
        edges: [
          makeEdge('welcome', 'a'),
          makeEdge('a', 'b'),
          makeEdge('b', 'a'),
        ],
      };
      const cycles = findCycles(flow);
      expect(cycles.length).toBeGreaterThan(0);
      expect(cycles[0]).toContain('a');
      expect(cycles[0]).toContain('b');
    });

    it('should return empty for acyclic flow', () => {
      const cycles = findCycles(validFlow);
      expect(cycles).toEqual([]);
    });
  });

  describe('findDisconnectedStart', () => {
    it('should return true when welcome has no outgoing edges', () => {
      const flow: ISurveyFlow = {
        nodes: [makeNode('welcome', 'welcome'), makeNode('q1', 'survey')],
        edges: [],
      };
      expect(findDisconnectedStart(flow)).toBe(true);
    });

    it('should return false when welcome is connected', () => {
      expect(findDisconnectedStart(validFlow)).toBe(false);
    });

    it('should return true when no welcome node exists', () => {
      const flow: ISurveyFlow = {
        nodes: [makeNode('q1', 'survey')],
        edges: [],
      };
      expect(findDisconnectedStart(flow)).toBe(true);
    });
  });

  describe('findUnreachableNodes', () => {
    it('should find unreachable nodes', () => {
      const flow: ISurveyFlow = {
        nodes: [
          makeNode('welcome', 'welcome'),
          makeNode('q1', 'survey'),
          makeNode('orphan', 'survey'),
          makeNode('thanks', 'thankYou'),
        ],
        edges: [
          makeEdge('welcome', 'q1'),
          makeEdge('q1', 'thanks'),
        ],
      };
      const unreachable = findUnreachableNodes(flow);
      expect(unreachable).toEqual(['orphan']);
    });

    it('should return empty when all reachable', () => {
      const unreachable = findUnreachableNodes(validFlow);
      expect(unreachable).toEqual([]);
    });
  });
});
