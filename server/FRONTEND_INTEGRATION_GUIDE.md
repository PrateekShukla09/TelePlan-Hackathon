# AI-Powered Telecom Tariff Plan Recommendation System
## Frontend Developer Integration Guide

This guide provides everything a frontend developer needs to build the user interface for the **Telecom Tariff Plan Recommendation System**. It includes API contracts, code examples (Axios / Fetch), TypeScript interfaces, recommended page layouts, and UI component structures.

---

## 🚀 1. Setup & Environment Configuration

Set up your frontend environment variable (e.g. in `.env` for Vite or Next.js):

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Base Axios Setup Example (`src/api/client.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token for admin endpoints
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🎨 2. Recommended Pages to Build

| Page | Description | Key Components |
|---|---|---|
| **1. Plan Catalogue Page** | Displays all available tariff plans | Plan Grid, Filter Bar (Price slider, Roaming toggle), Search Input |
| **2. Recommendation Finder** | Questionnaire form for finding best plans | Requirement Form (Data, Calls, SMS, Budget), Recommendation Cards with Match Badges |
| **3. Customer Telemetry View** | Existing customer portal | Customer Profile Header, Usage Telemetry Gauges/Charts, Upgrade Recommendation List |
| **4. Admin Portal** | Admin panel for plan management | Admin Login Form, Plan Management Table, Add/Edit Plan Modal |

---

## 📝 3. Data Models & TypeScript Interfaces

```typescript
// Tariff Plan Interface
export interface Plan {
  _id: string;
  planName: string;
  price: number;
  dataGB: number;
  callMinutes: number;
  sms: number;
  roamingIncluded: boolean;
  validityDays: number;
  sourceOperatorRef?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Recommendation Result Item
export interface RecommendedItem {
  plan: Plan;
  score: number; // Decimal between 0.00 and 1.00 (e.g. 0.92 = 92% match)
  explanation?: string;
}

// Profile Request Payload
export interface ProfileRequirement {
  dataNeed: 'low' | 'medium' | 'high' | number;
  callingNeed: 'low' | 'medium' | 'high' | number;
  smsNeed?: 'low' | 'medium' | 'high' | number;
  budget?: number | null;
  roamingRequired?: boolean;
  familyOrIndividual?: 'individual' | 'family';
}

// Customer Interface
export interface Customer {
  _id: string;
  name: string;
  phone: string;
  tenureMonths: number;
  contractType: 'prepaid' | 'postpaid';
  usage: {
    avgCallMin: number;
    dataGB: number;
    smsCount: number;
    dayEveningNightSplit: { day: number; evening: number; night: number };
    roamingUsage: number;
    internationalUsage: number;
  };
  currentPlanId?: Plan | string | null;
}
```

---

## 🔌 4. API Endpoint Integration Code Examples

### Feature 1: Recommendation Engine by Profile (Questionnaire)

Allows users to input their preferences and receive the top 3 plan recommendations.

- **Endpoint**: `POST /api/recommendations/by-profile`
- **Frontend Code Example**:

```javascript
import api from './client';

export const getRecommendationsByProfile = async (profileData) => {
  try {
    const response = await api.post('/api/recommendations/by-profile', {
      profile: {
        dataNeed: profileData.dataNeed, // 'low' | 'medium' | 'high'
        callingNeed: profileData.callingNeed, // 'low' | 'medium' | 'high'
        smsNeed: profileData.smsNeed || 'medium',
        budget: Number(profileData.budget) || null,
        roamingRequired: Boolean(profileData.roamingRequired)
      }
    });
    return response.data.plans; // Array of top 3 recommended items [{ plan, score }]
  } catch (error) {
    console.error('Error getting recommendations:', error.response?.data || error.message);
    throw error;
  }
};
```

---

### Feature 2: Fetch & Filter Tariff Plans Catalogue

Fetch all tariff plans with optional filtering.

- **Endpoint**: `GET /api/plans`
- **Frontend Code Example**:

```javascript
import api from './client';

export const fetchPlans = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.roamingIncluded !== undefined) params.append('roamingIncluded', filters.roamingIncluded);

  const response = await api.get(`/api/plans?${params.toString()}`);
  return response.data; // Array of Plan objects
};
```

---

### Feature 3: Existing Customer Recommendations

Fetch recommendations based on existing customer telemetry.

- **Endpoints**:
  - `GET /api/customers/:id`
  - `POST /api/recommendations/by-customer/:id`

- **Frontend Code Example**:

```javascript
import api from './client';

export const getCustomerRecommendations = async (customerId) => {
  const [customerRes, recsRes] = await Promise.all([
    api.get(`/api/customers/${customerId}`),
    api.post(`/api/recommendations/by-customer/${customerId}`)
  ]);

  return {
    customer: customerRes.data,
    recommendations: recsRes.data.plans
  };
};
```

---

### Feature 4: Admin Auth & Plan Management (Admin Panel)

Admin login and plan management CRUD operations.

```javascript
import api from './client';

// Admin Login
export const adminLogin = async (username, password) => {
  const response = await api.post('/api/auth/login', { username, password });
  const { token } = response.data;
  localStorage.setItem('adminToken', token);
  return token;
};

// Add New Plan (Requires Admin Token)
export const createPlan = async (planData) => {
  const response = await api.post('/api/plans', planData);
  return response.data;
};

// Delete Plan (Requires Admin Token)
export const deletePlan = async (planId) => {
  const response = await api.delete(`/api/plans/${planId}`);
  return response.data;
};
```

---

## 🌟 5. Recommended UI Component Styling Guide

To make the application look modern, premium, and engaging:

### Match Percentage Badge
Convert raw numeric scores (`0.92`) into match percentage badges (`92% Match`):

```jsx
function MatchBadge({ score }) {
  const percentage = Math.round(score * 100);
  
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (percentage < 80) badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  if (percentage < 60) badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${badgeColor}`}>
      {percentage}% Match
    </span>
  );
}
```

### Top Recommended Plan Card ("Best Choice")
Highlight the top plan (`plans[0]`) with a **"Best Match"** gold/emerald banner to draw visual attention.

---

## 🛠 6. Interactive Swagger Documentation

While building, frontend developers can test all live API endpoints interactively at:
`http://localhost:5000/api-docs`
