import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { UserProfile } from '../../types';
import { saveUserProfile, logoutUserProfile } from '../../services/storageService';
import {
  Mail,
  Lock,
  User,
  AtSign,
  School,
  Sparkles,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export interface AuthPageProps {
  currentUser: UserProfile;
  onAuthSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  currentUser,
  onAuthSuccess,
  onNavigateHome,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(currentUser.isLoggedIn ? 'signin' : 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [gradeSubject, setGradeSubject] = useState('');
  const [password, setPassword] = useState('');

  // Edit profile state (if logged in)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editSchool, setEditSchool] = useState(currentUser.school || '');
  const [editGradeSubject, setEditGradeSubject] = useState(currentUser.gradeSubject || '');

  // Helper to compute avatar initials
  const computeInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.substring(0, 2) || 'ED').toUpperCase();
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) {
      showToast({
        title: 'Email required',
        message: 'Please enter your school or personal email address to log in.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Derive a friendly username from email if not already present
      const derivedUsername = signInEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      const derivedName = derivedUsername
        .split('_')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      const updatedUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: derivedName,
        username: derivedUsername,
        email: signInEmail,
        school: 'Lincoln Middle School',
        role: 'Educator',
        gradeSubject: 'Classroom Teacher',
        avatarInitials: computeInitials(derivedName),
        isLoggedIn: true,
      };

      saveUserProfile(updatedUser);
      onAuthSuccess(updatedUser);
      showToast({
        title: `Welcome, ${updatedUser.name}!`,
        message: `Logged in as @${updatedUser.username} (${updatedUser.email})`,
        type: 'success',
      });
      onNavigateHome();
    }, 600);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({ title: 'Full Name required', message: 'Please enter your name.', type: 'warning' });
      return;
    }
    if (!username.trim()) {
      showToast({ title: 'Username required', message: 'Please specify your username for display.', type: 'warning' });
      return;
    }
    if (!email.trim()) {
      showToast({ title: 'Email required', message: 'Please enter your email.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
      const updatedUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        username: cleanUsername,
        email: email.trim(),
        school: school.trim() || 'Independent Educator',
        role: 'Teacher',
        gradeSubject: gradeSubject.trim() || 'General Studies',
        avatarInitials: computeInitials(name),
        isLoggedIn: true,
      };

      saveUserProfile(updatedUser);
      onAuthSuccess(updatedUser);
      showToast({
        title: 'Account created successfully!',
        message: `Welcome, ${updatedUser.name}! Your username is @${updatedUser.username}.`,
        type: 'success',
      });
      onNavigateHome();
    }, 600);
  };

  const handleQuickDemo = () => {
    const demoUser: UserProfile = {
      id: 'demo-teacher',
      name: 'Jordan Hayes',
      username: 'jordan_hayes',
      email: 'jordan.hayes@lincolnms.edu',
      school: 'Lincoln Middle School',
      role: 'Lead Educator',
      gradeSubject: '7th Grade Science & Math',
      avatarInitials: 'JH',
      isLoggedIn: true,
    };
    saveUserProfile(demoUser);
    onAuthSuccess(demoUser);
    showToast({
      title: 'Demo account activated',
      message: `Signed in as @${demoUser.username} (${demoUser.name})`,
      type: 'success',
    });
    onNavigateHome();
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      username: editUsername.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_') || currentUser.username,
      school: editSchool.trim() || currentUser.school,
      gradeSubject: editGradeSubject.trim() || currentUser.gradeSubject,
      avatarInitials: computeInitials(editName.trim() || currentUser.name),
    };
    saveUserProfile(updated);
    onAuthSuccess(updated);
    setIsEditing(false);
    showToast({
      title: 'Profile updated',
      message: `Updated display name to "${updated.name}" (@${updated.username}).`,
      type: 'success',
    });
  };

  const handleSignOut = () => {
    const guest = logoutUserProfile();
    onAuthSuccess(guest);
    showToast({
      title: 'Signed out',
      message: 'You have been signed out. You can sign in anytime.',
      type: 'info',
    });
    setMode('signin');
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header section */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest-800 text-white shadow-sm mb-2">
          <Sparkles className="w-6 h-6 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          Teacher Account & Profile
        </h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Manage your teacher identity, display username, and credentials across all Classflow AI automations.
        </p>
      </div>

      {/* If already logged in, show active account overview card */}
      {currentUser.isLoggedIn && (
        <Card className="bg-white border-stone-200/80 shadow-xs">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white font-bold text-base flex items-center justify-center ring-4 ring-forest-50 shadow-xs">
                {currentUser.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-900">{currentUser.name}</h2>
                  <Badge variant="green">Active Account</Badge>
                </div>
                <p className="text-xs font-mono text-forest-800 font-medium">@{currentUser.username}</p>
                <p className="text-xs text-stone-500 mt-0.5">{currentUser.email || 'No email attached'}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign out
            </Button>
          </div>

          {!isEditing ? (
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-canvas border border-stone-200/60">
                  <span className="text-[10px] font-semibold uppercase text-stone-400 tracking-wider block mb-1">School / District</span>
                  <p className="font-medium text-stone-800">{currentUser.school || 'Lincoln Middle School'}</p>
                </div>
                <div className="p-3 rounded-xl bg-canvas border border-stone-200/60">
                  <span className="text-[10px] font-semibold uppercase text-stone-400 tracking-wider block mb-1">Grade & Subject</span>
                  <p className="font-medium text-stone-800">{currentUser.gradeSubject || 'Educator'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold text-forest-800 hover:text-forest-900 hover:underline"
                >
                  Edit display name & username
                </button>
                <Button variant="primary" size="sm" onClick={onNavigateHome}>
                  <span>Continue to Home</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="pt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                  placeholder="e.g. Dr. Jordan Hayes"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Username (Displayed across app)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400 font-mono">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white font-mono"
                    placeholder="jordan_h"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">School</label>
                  <input
                    type="text"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Grade / Subject</label>
                  <input
                    type="text"
                    value={editGradeSubject}
                    onChange={(e) => setEditGradeSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* Main Authentication Card */}
      <Card className="bg-white border-stone-200/80 shadow-xs">
        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex border-b border-stone-100 -mx-6 -mt-6 px-6 pt-4 mb-6 bg-stone-50/50 rounded-t-2xl">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-all ${
              mode === 'signin'
                ? 'border-forest-800 text-forest-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-all ${
              mode === 'signup'
                ? 'border-forest-800 text-forest-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Create New Account (Sign Up)
          </button>
        </div>

        {mode === 'signin' ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                School or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white text-stone-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-800">
                  Password
                </label>
                <span className="text-[11px] text-stone-400">Default: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              loading={isLoading}
            >
              Sign In to Classflow AI
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-stone-400">
                <span className="bg-white px-2">or quick start</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleQuickDemo}
              className="w-full justify-center border-stone-200/80 bg-stone-50/50 hover:bg-stone-100 text-stone-700"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-forest-700" />
              1-Click Demo Login (@jordan_hayes)
            </Button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Full Name <span className="text-forest-700">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Jordan Hayes"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Username <span className="text-forest-700">*</span>
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="jordan_h"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">Displayed on your automations & profile</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                School Email <span className="text-forest-700">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan.hayes@school.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  School / District
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Lincoln Middle School"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Grade / Subject
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={gradeSubject}
                    onChange={(e) => setGradeSubject(e.target.value)}
                    placeholder="7th Grade Science"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Create Password <span className="text-forest-700">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-700 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center mt-2"
              loading={isLoading}
            >
              Create Teacher Account
            </Button>
          </form>
        )}
      </Card>

      {/* Trust & FERPA compliance footer note */}
      <div className="flex items-center justify-center gap-2 text-xs text-stone-500 text-center">
        <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
        <span>FERPA & COPPA compliant zero-retention student privacy guaranteed.</span>
      </div>
    </div>
  );
};
