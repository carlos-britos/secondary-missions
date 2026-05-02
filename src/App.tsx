import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GuestGuard } from '@shared/components/GuestGuard'
import { AuthGuard } from '@shared/components/AuthGuard'
import { OnboardingGuard } from '@shared/components/OnboardingGuard'
import { AdminGuard } from '@shared/components/AdminGuard'
import { AppLayout } from '@shared/components/AppLayout'
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  ProfileSetupPage,
  OnboardingPage,
} from '@features/auth'
import { DashboardPage } from '@features/missions'
import { AchievementsPage } from '@features/achievements'
import { ExplorePage } from '@features/explore'
import { SettingsPage } from '@features/settings'
import { ModerationPage } from '@features/moderation'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestGuard />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<AuthGuard />}>
          <Route path="/setup" element={<ProfileSetupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<OnboardingGuard />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              <Route element={<AdminGuard />}>
                <Route path="/admin/moderation" element={<ModerationPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
