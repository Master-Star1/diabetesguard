import { useEffect, useState } from 'react';
import { MedicationTracker } from './components/MedicationTracker';
import { Onboarding } from './components/Onboarding';
import { getPermissionState, requestNotificationPermission, syncMedicationReminders } from './utils/notifications';
import type { PermissionState } from './utils/notifications';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { RiskAssessment } from './components/RiskAssessment';
import { BloodSugarTracker } from './components/BloodSugarTracker';
import { NutritionGuide } from './components/NutritionGuide';
import { FoodGuide } from './components/FoodGuide';
import { PremiumPage } from './components/PremiumPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  validateAssessment, validateBloodSugarEntries, validateIntakes, validateMedications,
  validateSettings, validateSubscription, validateWeightEntries,
} from './utils/health';
import type {
  ActiveTab, AppSettings, BloodSugarEntry, GlucoseUnit, MedIntake, Medication, Profile, RiskAssessmentResult, Subscription, WeightEntry,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [bloodSugarEntries, setBloodSugarEntries] = useLocalStorage<BloodSugarEntry[]>('blood_sugar_entries', [], validateBloodSugarEntries);
  const [weightEntries, setWeightEntries] = useLocalStorage<WeightEntry[]>('weight_entries', [], validateWeightEntries);
  const [lastAssessment, setLastAssessment] = useLocalStorage<RiskAssessmentResult | null>('last_assessment', null, validateAssessment);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings', {
    unit: 'mgdl',
    heightCm: null,
    profile: 'standard',
    dueDate: null,
  }, validateSettings);
  const [subscription, setSubscription] = useLocalStorage<Subscription>('subscription', {
    tier: 'free',
    startedAt: null,
  }, validateSubscription);
  const [medications, setMedications] = useLocalStorage<Medication[]>('medications', [], validateMedications);
  const [intakes, setIntakes] = useLocalStorage<MedIntake[]>('med_intakes', [], validateIntakes);
  const [onboardingDone, setOnboardingDone] = useLocalStorage<boolean>('onboarding_done', false, (r) => (typeof r === 'boolean' ? r : null));
  const [notifPermission, setNotifPermission] = useState<PermissionState>('unsupported');

  useEffect(() => {
    getPermissionState().then(setNotifPermission);
  }, []);

  // Erinnerungen immer mit dem aktuellen Medikationsplan abgleichen
  useEffect(() => {
    if (notifPermission === 'granted') syncMedicationReminders(medications);
  }, [medications, notifPermission]);

  const handleAddEntry = (entry: BloodSugarEntry) => {
    setBloodSugarEntries((prev) => [...prev, entry]);
  };

  const handleDeleteEntry = (id: string) => {
    setBloodSugarEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddWeight = (entry: WeightEntry) => {
    setWeightEntries((prev) => [...prev, entry]);
  };

  const handleDeleteWeight = (id: string) => {
    setWeightEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUnitChange = (unit: GlucoseUnit) => {
    setSettings((prev) => ({ ...prev, unit }));
  };

  const handleHeightChange = (heightCm: number | null) => {
    setSettings((prev) => ({ ...prev, heightCm }));
  };

  const handleProfileChange = (profile: Profile, dueDate: string | null) => {
    setSettings((prev) => ({ ...prev, profile, dueDate }));
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  const medicationPanel = (
    <MedicationTracker
      medications={medications}
      intakes={intakes}
      permission={notifPermission}
      onAdd={(m) => setMedications((prev) => [...prev, m])}
      onDelete={(id) => {
        setMedications((prev) => prev.filter((m) => m.id !== id));
        setIntakes((prev) => prev.filter((i) => i.medicationId !== id));
      }}
      onToggleActive={(id) => setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)))}
      onLogIntake={(i) => setIntakes((prev) => [...prev, i])}
      onUndoIntake={(id) => setIntakes((prev) => prev.filter((i) => i.id !== id))}
      onRequestPermission={handleRequestNotifications}
    />
  );

  const handleAssessmentComplete = (result: RiskAssessmentResult) => {
    setLastAssessment(result);
  };

  // In production: redirect to Stripe Checkout URL instead
  const handleUpgrade = () => {
    setActiveTab('premium');
  };

  // Demo upgrade: simulate successful Stripe webhook
  const handleDemoUpgrade = () => {
    setSubscription({ tier: 'premium', startedAt: new Date().toISOString() });
  };

  // Demo downgrade: simulate cancellation
  const handleDemoDowngrade = () => {
    setSubscription({ tier: 'free', startedAt: null });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            bloodSugarEntries={bloodSugarEntries}
            weightEntries={weightEntries}
            unit={settings.unit}
            profile={settings.profile}
            dueDate={settings.dueDate}
            lastAssessment={lastAssessment}
            subscription={subscription}
            onNavigate={setActiveTab}
            onUpgrade={handleUpgrade}
          />
        );
      case 'assessment':
        return (
          <RiskAssessment
            lastResult={lastAssessment}
            onComplete={handleAssessmentComplete}
          />
        );
      case 'tracker':
        return (
          <BloodSugarTracker
            entries={bloodSugarEntries}
            weightEntries={weightEntries}
            medications={medications}
            medicationPanel={medicationPanel}
            unit={settings.unit}
            profile={settings.profile}
            heightCm={settings.heightCm}
            subscription={subscription}
            onAdd={handleAddEntry}
            onDelete={handleDeleteEntry}
            onAddWeight={handleAddWeight}
            onDeleteWeight={handleDeleteWeight}
            onUnitChange={handleUnitChange}
            onHeightChange={handleHeightChange}
            onUpgrade={handleUpgrade}
          />
        );
      case 'nutrition':
        return (
          <NutritionGuide
            subscription={subscription}
            profile={settings.profile}
            unit={settings.unit}
            onUpgrade={handleUpgrade}
            onOpenSettings={() => setActiveTab('premium')}
          />
        );
      case 'foods':
        return <FoodGuide subscription={subscription} onUpgrade={handleUpgrade} />;
      case 'premium':
        return (
          <PremiumPage
            subscription={subscription}
            settings={settings}
            onProfileChange={handleProfileChange}
            onUpgrade={handleDemoUpgrade}
            onDowngrade={handleDemoDowngrade}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!onboardingDone && (
        <Onboarding
          onAccept={(profile, dueDate) => {
            handleProfileChange(profile, dueDate);
            setOnboardingDone(true);
          }}
        />
      )}
      <Navigation activeTab={activeTab} subscription={subscription} onTabChange={setActiveTab} />
      <main className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
