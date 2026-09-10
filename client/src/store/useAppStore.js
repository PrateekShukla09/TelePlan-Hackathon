import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultProfile = {
  dataNeed: 'high',
  callingNeed: 'medium',
  smsNeed: 'low',
  budget: '₹400 - ₹800/mo',
  roamingRequired: false,
  familyOrIndividual: 'Individual',
};

const DEFAULT_USERS = [
  {
    id: 'CUST-849201',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    memberSince: 'August 2026',
    avatar: '',
    verifiedWithOtp: true,
  },
];

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Identity & Auth State
      isLoggedIn: false,
      currentUser: null,
      customerName: 'Guest',
      customerId: '',
      isAdmin: false,
      adminToken: null,
      setAdminToken: (token) => set({ isAdmin: !!token, adminToken: token }),
      logoutAdmin: () => set({ isAdmin: false, adminToken: null }),

      // Day & Night Theme
      isDarkMode: true,
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.isDarkMode;
          if (typeof window !== 'undefined') {
            if (next) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: next };
        }),

      // Gmail OTP Auth Action
      loginWithGmailOtp: (email, otpCode) => {
        const cleanEmail = email.trim().toLowerCase();
        const users = get().registeredUsers || DEFAULT_USERS;
        let existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

        if (!existingUser) {
          const newId = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
          const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
          const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

          existingUser = {
            id: newId,
            name: formattedName || 'User',
            email: cleanEmail,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            avatar: '',
            verifiedWithOtp: true,
          };
          set({ registeredUsers: [...users, existingUser] });
        }

        set({
          isLoggedIn: true,
          currentUser: existingUser,
          customerName: existingUser.name,
          customerId: existingUser.id,
        });

        return { success: true, user: existingUser };
      },

      logout: () => {
        set({
          isLoggedIn: false,
          currentUser: null,
          customerName: 'Guest',
          customerId: '',
        });
      },

      // Onboarding profile
      onboardingComplete: false,
      profile: defaultProfile,
      setProfileField: (field, value) =>
        set((state) => ({ profile: { ...state.profile, [field]: value } })),
      resetProfile: () => set({ profile: defaultProfile, onboardingComplete: false }),
      completeOnboarding: () => set({ onboardingComplete: true }),

      // Latest recommendation payload
      lastRecommendations: null,
      setLastRecommendations: (plans) => set({ lastRecommendations: plans }),

      // Compare tray
      compareIds: [],
      toggleCompare: (planId) =>
        set((state) => ({
          compareIds: state.compareIds.includes(planId)
            ? state.compareIds.filter((id) => id !== planId)
            : state.compareIds.length >= 4
              ? state.compareIds
              : [...state.compareIds, planId],
        })),
      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      name: 'tariff-twin-store',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        currentUser: state.currentUser,
        registeredUsers: state.registeredUsers,
        customerName: state.customerName,
        customerId: state.customerId,
        isDarkMode: state.isDarkMode,
      }),
    },
  ),
);
