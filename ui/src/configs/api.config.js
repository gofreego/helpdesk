/**
 * Legacy API Config
 * This file is kept for backward compatibility
 * New code should use services/api.service.ts directly
 */

import { setAuthHeaders } from '../services/api.service';

// Re-export setAuthHeaders for Settings component
export { setAuthHeaders };
