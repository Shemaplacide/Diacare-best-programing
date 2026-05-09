import api from './axios'

export const getMyMealPlans = () => api.get('/meal-plans/my')
