import { aisPositionsCleanup } from './handlers/aisPositionsCleanup';
import { chatTitleGenerate } from './handlers/chatTitleGenerate';
import { signupReminderSend } from './handlers/signupReminderSend';
import { staleSessionsCleanup } from './handlers/staleSessionsCleanup';
import type { JobDefinition } from './types';

export const jobDefinitions: JobDefinition[] = [staleSessionsCleanup, signupReminderSend, chatTitleGenerate, aisPositionsCleanup];
