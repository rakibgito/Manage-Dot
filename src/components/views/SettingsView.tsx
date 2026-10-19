import React, { useState, useRef } from 'react';
import {
  User,
  GraduationCap,
  Moon,
  Sun,
  Coins,
  Tag,
  Download,
  Upload,
  Trash2,
  Plus,
  X,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatBDT } from '../../utils/formatters';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_SOURCES,
  DEFAULT_PAYMENT_METHODS,
} from '../../utils/constants';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    settings,
    updateSettings,
    toggleTheme,
    exportTransactionsCSV,
    exportBillsCSV,
    exportGoalsCSV,
    backupDatabaseJSON,
    restoreDatabaseJSON,
    resetAllData,
    loadSampleStudentData,
  } = useFinance();

  // Profile Form state
  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university);
  const [department, setDepartment] = useState(profile.department);
  const [email, setEmail] = useState(profile.email);
  const [monthlyAllowanceTarget, setMonthlyAllowanceTarget] = useState(
    profile.monthlyAllowanceTarget?.toString() || '18000'
  );
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Custom Category Add State
  const [newExpCat, setNewExpCat] = useState('');
  const [newIncSource, setNewIncSource] = useState('');
  const [newPayMethod, setNewPayMethod] = useState('');

  // Confirmation dialog state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSampleDataConfirm, setShowSampleDataConfirm] = useState(false);

  // Restore file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ msg: string; isError: boolean } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      university: university.trim(),
      department: department.trim(),
      email: email.trim(),
      monthlyAllowanceTarget: Math.max(0, parseFloat(monthlyAllowanceTarget) || 0),
    });
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  const handleAddCustomExpenseCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newExpCat.trim();
    if (!trimmed) return;
    const current = settings.customExpenseCategories || [];
    if (!current.includes(trimmed)) {
      updateSettings({ customExpenseCategories: [...current, trimmed] });
    }
    setNewExpCat('');
  };

  const handleRemoveCustomExpenseCategory = (cat: string) => {
    const current = settings.customExpenseCategories || [];
    updateSettings({
      customExpenseCategories: current.filter((c) => c !== cat),
    });
  };

  const handleAddCustomIncomeSource = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newIncSource.trim();
    if (!trimmed) return;
    const current = settings.customIncomeSources || [];
    if (!current.includes(trimmed)) {
      updateSettings({ customIncomeSources: [...current, trimmed] });
    }
    setNewIncSource('');
  };

  const handleRemoveCustomIncomeSource = (src: string) => {
    const current = settings.customIncomeSources || [];
    updateSettings({
      customIncomeSources: current.filter((s) => s !== src),
    });
  };

  const handleAddCustomPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPayMethod.trim();
    if (!trimmed) return;
    const current = settings.customPaymentMethods || [];
    if (!current.includes(trimmed)) {
      updateSettings({ customPaymentMethods: [...current, trimmed] });
    }
    setNewPayMethod('');
  };

  const handleRemoveCustomPaymentMethod = (m: string) => {
    const current = settings.customPaymentMethods || [];
    updateSettings({
      customPaymentMethods: current.filter((item) => item !== m),
    });
  };

  // Restore JSON file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = restoreDatabaseJSON(content);
        if (result.success) {
          setRestoreStatus({ msg: 'Database backup successfully restored!', isError: false });
        } else {
          setRestoreStatus({ msg: result.error || 'Failed to restore file.', isError: true });
        }
        setTimeout(() => setRestoreStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-4xl">
      {/* 1. Student Profile Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student Profile &amp; Campus Info
            </h3>
            <p className="text-xs text-slate-400">
              Personalize your university finance dashboard
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                University / Institution
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. University of Dhaka, BUET, NSU"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. CSE, EEE, BBA, Economics"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Monthly Target Allowance (BDT ৳)
              </label>
              <input
                type="number"
                value={monthlyAllowanceTarget}
                onChange={(e) => setMonthlyAllowanceTarget(e.target.value)}
                placeholder="18000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSavedMsg && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Profile changes saved!
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs ml-auto transition"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Theme & Currency Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Appearance &amp; Currency
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme selector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Theme Mode
              </h4>
              <p className="text-[11px] text-slate-400">
                Current: {settings.theme}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-xs text-slate-700 dark:text-slate-200"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Currency indicator */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Base Currency
              </h4>
              <p className="text-[11px] text-slate-400">
                Bangladeshi Taka (৳ BDT)
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center">
              ৳
            </div>
          </div>
        </div>
      </div>

      {/* 3. Manage Custom Categories & Payment Methods */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Custom Categories &amp; Methods
          </h3>
          <p className="text-xs text-slate-400">
            Tailor categories for your student lifestyle in Bangladesh
          </p>
        </div>

        {/* Custom Expense Categories */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Custom Expense Categories
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
              >
                {c}
              </span>
            ))}
            {(settings.customExpenseCategories || []).map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900 flex items-center gap-1.5"
              >
                {c}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomExpenseCategory(c)}
                  className="hover:text-rose-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCustomExpenseCategory} className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="e.g. Hall Mess Feast, Tech Gadgets..."
              value={newExpCat}
              onChange={(e) => setNewExpCat(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 text-white dark:bg-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700"
            >
              Add
            </button>
          </form>
        </div>

        {/* Custom Income Sources */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Custom Income Sources
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {DEFAULT_INCOME_SOURCES.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
              >
                {s}
              </span>
            ))}
            {(settings.customIncomeSources || []).map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5"
              >
                {s}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomIncomeSource(s)}
                  className="hover:text-emerald-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCustomIncomeSource} className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="e.g. Coding Contest Prize, Lab Assistant..."
              value={newIncSource}
              onChange={(e) => setNewIncSource(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 text-white dark:bg-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* 4. Export & Backup Data */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Data Portability, CSV &amp; Backups
          </h3>
          <p className="text-xs text-slate-400">
            Export your data for spreadsheet analysis or take a complete JSON backup
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportTransactionsCSV}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Transactions (CSV)
          </button>

          <button
            onClick={exportBillsCSV}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            Export Bills (CSV)
          </button>

          <button
            onClick={exportGoalsCSV}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            Export Goals (CSV)
          </button>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={backupDatabaseJSON}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            Download Full JSON Backup
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
          >
            <Upload className="w-4 h-4" />
            Restore from JSON File
          </button>
        </div>

        {restoreStatus && (
          <p
            className={`text-xs font-bold mt-2 ${
              restoreStatus.isError ? 'text-rose-500' : 'text-emerald-600'
            }`}
          >
            {restoreStatus.msg}
          </p>
        )}
      </div>

      {/* 5. Testing Helper & Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Student Data Tools &amp; Reset
          </h3>
          <p className="text-xs text-slate-400">
            By default your account is clean with empty states. You can load sample student data to preview all features or reset everything.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Sample data loader */}
          <button
            onClick={() => setShowSampleDataConfirm(true)}
            className="py-2.5 px-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Load Sample Student Data (BD Mess &amp; University)
          </button>

          {/* Reset all data button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="py-2.5 px-4 rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition sm:ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset All Financial Data?"
        message="This action will delete all transactions, recurring bills, budgets, and savings goals. This action cannot be reversed!"
        confirmText="Yes, Wipe All Data"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          resetAllData();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showSampleDataConfirm}
        title="Load University Student Sample Template?"
        message="This will load realistic Bangladesh student transactions (mess rent, tong er cha, Nilkhet rickshaw, private tuition income, laptop savings goal) so you can explore all features immediately."
        confirmText="Load Template"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          loadSampleStudentData();
          setShowSampleDataConfirm(false);
        }}
        onCancel={() => setShowSampleDataConfirm(false)}
      />
    </div>
  );
};
