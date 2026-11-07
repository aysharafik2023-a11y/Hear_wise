import React from 'react';
import {
  Activity,
  Clock,
  Car,
  BookOpen,
  Accessibility,
  FlaskConical,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Ear,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: 'live',
      label: 'Live Assist',
      icon: Activity,
      badge: 'Live',
    },
    {
      id: 'history',
      label: 'History',
      icon: Clock,
    },
    {
      id: 'noise',
      label: 'Noise Environments',
      icon: Car,
    },
    {
      id: 'vocabulary',
      label: 'My Vocabulary',
      icon: BookOpen,
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: Accessibility,
    },
    {
      id: 'research',
      label: 'Research Mode',
      icon: FlaskConical,
      badge: 'Lab',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-white border-r border-slate-200/80 transition-all duration-200 ease-in-out shrink-0 select-none z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="p-3.5 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
              </div>

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badge === 'Live'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Button */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-end">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>

      {/* Bottom Illustration Card: "Clearer Conversations. Brighter Days." */}
      {!collapsed && (
        <div className="p-4 pt-1">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50 via-teal-50/70 to-emerald-50/80 border border-sky-100/80 p-4 shadow-sm group">
            <div className="relative z-10 flex flex-col items-start gap-2.5">
              {/* Graphic with glowing sound waves and assistive ear icon */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-100 via-rose-100 to-sky-100 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                  alt="Person with hearing assistance smiling peacefully"
                  className="w-full h-full object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                
                {/* Assistive soundwave badge overlay */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-4 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">CI Connected</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  Clearer Conversations.
                  <span className="block text-teal-600">Brighter Days.</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Active noise-suppression and contextual word completion enabled.
                </p>
              </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-teal-200/40 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      )}
    </aside>
  );
};
