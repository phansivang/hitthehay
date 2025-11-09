/**
 * Node Validation Strategy
 * Strategy pattern for validating node workflows
 */

import type { Node } from 'reactflow';
import { NodeCategory, type NodeData } from '@/shared/types';

/**
 * Node validation result
 */
export interface ValidationResult {
  isValid: boolean;
  allowedCategories: NodeCategory[];
  errorMessage?: string;
}

/**
 * Base strategy interface
 */
interface NodeValidationStrategy {
  validate(nodes: Node<NodeData>[]): ValidationResult;
}

/**
 * Empty workflow strategy - allows only triggers
 */
class EmptyWorkflowStrategy implements NodeValidationStrategy {
  validate(nodes: Node<NodeData>[]): ValidationResult {
    return {
      isValid: nodes.length === 0,
      allowedCategories: [NodeCategory.Triggers],
    };
  }
}

/**
 * Has trigger strategy - allows video source or AI models
 */
class HasTriggerStrategy implements NodeValidationStrategy {
  validate(nodes: Node<NodeData>[]): ValidationResult {
    const hasTrigger = nodes.some((n) => n.data.category === NodeCategory.Triggers);
    
    if (!hasTrigger) {
      return {
        isValid: false,
        allowedCategories: [],
        errorMessage: 'Workflow must start with a trigger',
      };
    }

    return {
      isValid: true,
      allowedCategories: [NodeCategory.VideoSource, NodeCategory.AIModels],
    };
  }
}

/**
 * Has video source or AI model strategy - allows prompt config or platforms
 */
class HasSourceOrModelStrategy implements NodeValidationStrategy {
  validate(nodes: Node<NodeData>[]): ValidationResult {
    const hasVideoSource = nodes.some((n) => n.data.category === NodeCategory.VideoSource);
    const hasAiModel = nodes.some((n) => n.data.category === NodeCategory.AIModels);
    const hasPromptConfig = nodes.some((n) => n.data.category === NodeCategory.PromptConfig);

    // If AI model exists but no prompt config, require prompt config
    if (hasAiModel && !hasPromptConfig) {
      return {
        isValid: true,
        allowedCategories: [NodeCategory.PromptConfig],
      };
    }

    // Otherwise, allow platforms
    return {
      isValid: true,
      allowedCategories: [NodeCategory.Platforms],
    };
  }
}

/**
 * Strategy selector using pattern matching
 */
export const getValidationStrategy = (nodes: Node<NodeData>[]): NodeValidationStrategy => {
  const hasVideoSource = nodes.some((n) => n.data.category === NodeCategory.VideoSource);
  const hasAiModel = nodes.some((n) => n.data.category === NodeCategory.AIModels);

  // Pattern matching using early returns
  if (nodes.length === 0) {
    return new EmptyWorkflowStrategy();
  }

  if (!hasVideoSource && !hasAiModel) {
    return new HasTriggerStrategy();
  }

  return new HasSourceOrModelStrategy();
};

/**
 * Validate node workflow and return allowed categories
 */
export const validateNodeWorkflow = (nodes: Node<NodeData>[]): ValidationResult => {
  const strategy = getValidationStrategy(nodes);
  return strategy.validate(nodes);
};

/**
 * Check if a node can be added to workflow
 */
export const canAddNode = (
  nodes: Node<NodeData>[],
  nodeCategory: NodeCategory
): { canAdd: boolean; errorMessage?: string } => {
  const validation = validateNodeWorkflow(nodes);
  
  if (!validation.allowedCategories.includes(nodeCategory)) {
    return {
      canAdd: false,
      errorMessage: `Invalid node. Please add a node from one of the following categories: ${validation.allowedCategories.join(', ')}`,
    };
  }

  // Check for duplicate video source or AI model
  const hasVideoSource = nodes.some((n) => n.data.category === NodeCategory.VideoSource);
  const hasAiModel = nodes.some((n) => n.data.category === NodeCategory.AIModels);
  
  const isDuplicateSource = (nodeCategory === NodeCategory.VideoSource || nodeCategory === NodeCategory.AIModels) 
    && (hasVideoSource || hasAiModel);

  if (isDuplicateSource) {
    return {
      canAdd: false,
      errorMessage: 'A Video Source or AI Model has already been added. You can only have one.',
    };
  }

  return { canAdd: true };
};

