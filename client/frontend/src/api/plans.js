import { http, callWithFallback } from './client';
import { demoPlans, demoOperators } from './mockData';

// GET /api/plans
export const getPlans = (filters = {}) =>
  callWithFallback(
    () => http.get('/plans', { params: filters }),
    () => demoPlans,
  );

// POST /api/plans (Admin JWT required)
export const createPlan = (planData) =>
  callWithFallback(
    () => http.post('/plans', planData),
    () => ({ ...planData, _id: `demo_${Date.now()}` }),
  );

// PUT /api/plans/:id (Admin JWT required)
export const updatePlan = (id, planData) =>
  callWithFallback(
    () => http.put(`/plans/${id}`, planData),
    () => ({ ...planData, _id: id }),
  );

// DELETE /api/plans/:id (Admin JWT required)
export const deletePlan = (id) =>
  callWithFallback(
    () => http.delete(`/plans/${id}`),
    () => ({ message: 'Plan deleted successfully' }),
  );

export const getOperators = () =>
  callWithFallback(
    () => http.get('/operators'),
    () => demoOperators,
  );
