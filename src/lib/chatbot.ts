// src/lib/chatbot.ts
import type { ChatbotFlow, FlowStep, WhatsAppContact } from '../types';
import { MOCK_FLOWS, MOCK_TAGS, MOCK_CONVERSATIONS, MOCK_CONTACTS } from './mockData';
import { notificationStore } from './notifications';

// In‑memory stores (mutable)
let flowsStore: ChatbotFlow[] = JSON.parse(JSON.stringify(MOCK_FLOWS));
let stepsStore: Record<string, FlowStep[]> = {};
// Populate steps from flows
MOCK_FLOWS.forEach(flow => {
  if (flow.steps) stepsStore[flow.id] = JSON.parse(JSON.stringify(flow.steps));
});

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function executeFlowStep(
  flow: ChatbotFlow,
  step: FlowStep,
  contact: WhatsAppContact,
  userInput?: string
): Promise<{ nextStep?: number; message?: string; action?: 'tag' | 'assign' | 'stage' }> {
  await delay(50); // simulate processing
  if (!step) return {};

  switch (step.step_type) {
    case 'message':
      return { message: step.message_text || '', nextStep: step.next_step_index ?? undefined };

    case 'question':
      return { message: step.message_text || '', nextStep: step.next_step_index ?? undefined };

    case 'buttons':
      if (!userInput || !step.buttons) return { message: step.message_text || '' };
      const selectedButton = step.buttons.find((b) => b.id === userInput);
      return {
        message: selectedButton?.title || userInput,
        nextStep: selectedButton?.next_step ?? step.next_step_index ?? undefined,
      };

    case 'tag':
      if (step.tag_id) {
        // Simulate adding tag to contact (in-memory)
        const contactIndex = MOCK_CONTACTS.findIndex(c => c.id === contact.id);
        if (contactIndex !== -1) {
          const tag = MOCK_TAGS.find(t => t.id === step.tag_id);
          if (tag && !MOCK_CONTACTS[contactIndex].tags?.some(t => t.id === tag.id)) {
            if (!MOCK_CONTACTS[contactIndex].tags) MOCK_CONTACTS[contactIndex].tags = [];
            MOCK_CONTACTS[contactIndex].tags.push(tag);
          }
        }
      }
      return { action: 'tag', nextStep: step.next_step_index ?? undefined };

    case 'assign':
      if (step.assign_to) {
        // Simulate assigning contact
        const contactIndex = MOCK_CONTACTS.findIndex(c => c.id === contact.id);
        if (contactIndex !== -1) {
          MOCK_CONTACTS[contactIndex].assigned_to = step.assign_to;
        }
        // Also update conversation assignment (if exists)
        const convIndex = MOCK_CONVERSATIONS.findIndex(c => c.contact_id === contact.id);
        if (convIndex !== -1) {
          MOCK_CONVERSATIONS[convIndex].assigned_to = step.assign_to;
        }
      }
      return { action: 'assign', nextStep: step.next_step_index ?? undefined };

    case 'stage':
      if (step.stage) {
        const contactIndex = MOCK_CONTACTS.findIndex(c => c.id === contact.id);
        if (contactIndex !== -1) {
          MOCK_CONTACTS[contactIndex].stage = step.stage;
        }
      }
      return { action: 'stage', nextStep: step.next_step_index ?? undefined };

    case 'template':
      if (step.template_id) {
        // Find template from mock data
        const { MOCK_TEMPLATES } = await import('./mockData');
        const template = MOCK_TEMPLATES.find(t => t.id === step.template_id);
        return {
          message: template?.body || '',
          nextStep: step.next_step_index ?? undefined,
        };
      }
      return { nextStep: step.next_step_index ?? undefined };

    case 'condition':
      if (step.conditions && userInput) {
        const condition = step.conditions as Record<string, number>;
        const nextStepForInput = condition[userInput];
        if (nextStepForInput !== undefined) {
          return { nextStep: nextStepForInput };
        }
      }
      return { nextStep: step.next_step_index ?? undefined };

    case 'end':
      return { message: step.message_text || 'Thank you for contacting us!', nextStep: undefined };

    default:
      return { nextStep: step.next_step_index ?? undefined };
  }
}

export async function getFlowForContact(
  contactId: string
): Promise<ChatbotFlow | null> {
  await delay(100);
  const conversation = MOCK_CONVERSATIONS.find(c => c.contact_id === contactId);
  if (!conversation?.flow_id) return null;
  const flow = flowsStore.find(f => f.id === conversation.flow_id);
  return flow || null;
}

export async function getFlowSteps(
  flowId: string
): Promise<FlowStep[]> {
  await delay(100);
  return stepsStore[flowId] || [];
}

export async function updateConversationFlow(
  conversationId: string,
  flowId: string,
  stepIndex: number
) {
  await delay(100);
  const convIndex = MOCK_CONVERSATIONS.findIndex(c => c.id === conversationId);
  if (convIndex !== -1) {
    MOCK_CONVERSATIONS[convIndex].flow_id = flowId;
    MOCK_CONVERSATIONS[convIndex].current_step_index = stepIndex;
  }
  return { error: null };
}

export async function processFlowInteraction(
  contactId: string,
  conversationId: string,
  userInput: string
): Promise<{ message?: string; nextFlowId?: string; complete: boolean }> {
  await delay(200);
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  if (!conversation?.flow_id) return { complete: true };

  const steps = await getFlowSteps(conversation.flow_id);
  const currentStep = steps[conversation.current_step_index || 0];
  if (!currentStep) return { complete: true };

  const contact = MOCK_CONTACTS.find(c => c.id === contactId);
  if (!contact) return { complete: true };

  const flow = flowsStore.find(f => f.id === conversation.flow_id);
  if (!flow) return { complete: true };

  const result = await executeFlowStep(flow, currentStep, contact, userInput);

  if (result.nextStep !== undefined && result.nextStep < steps.length) {
    await updateConversationFlow(conversationId, conversation.flow_id, result.nextStep);
    return { message: result.message, complete: false };
  }

  return { message: result.message, complete: true };
}

export async function autoTagContact(contact: WhatsAppContact) {
  await delay(150);
  const tagMapping: Record<string, string> = {
    'Buy Property': 'Buyer',
    'Sell Property': 'Seller',
    'Investment Opportunity': 'Investor',
  };

  const notes = contact.notes || '';
  for (const [keyword, tagName] of Object.entries(tagMapping)) {
    if (notes.toLowerCase().includes(keyword.toLowerCase())) {
      const tag = MOCK_TAGS.find(t => t.name === tagName);
      if (tag) {
        const contactIndex = MOCK_CONTACTS.findIndex(c => c.id === contact.id);
        if (contactIndex !== -1) {
          if (!MOCK_CONTACTS[contactIndex].tags) MOCK_CONTACTS[contactIndex].tags = [];
          if (!MOCK_CONTACTS[contactIndex].tags.some(t => t.id === tag.id)) {
            MOCK_CONTACTS[contactIndex].tags.push(tag);
          }
        }
      }
    }
  }
}