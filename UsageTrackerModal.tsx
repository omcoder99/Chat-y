import React, { useState } from 'react';
import { 
  Clock, MessageSquare, PhoneCall, BarChart3, 
  X, Bell, TrendingUp, Award, Calendar, Check
} from 'lucide-react';
import { DailyUsage } from '../types';

interface UsageTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageData: DailyUsage[];
  activeMinutesToday: number;
}

export const UsageTrackerModal: React.FC<UsageTrackerModalProps> = ({
  isOpen,
  onClose,
  usageData,
  activeMinutesToday,
}) => {
  const [selectedLimit, setSelectedLimit] = useState<number>(120); // 120 mins = 2 hours
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  // Calculate today stats
  const todayRecord = usageData[usageData.length - 1] || {
    totalMinutes: activeMinutesToday,
    messagesSent: 42,
    messagesReceived: 88,
    callMinutes: 19,
  };

  const totalTodayMins = activeMinutesToday;
  const hours = Math.floor(totalTodayMins / 60);
  const minutes = totalTodayMins % 60;

  // Find max minutes for relative bar graph height
  const maxMins = Math.max(...usageData.map((d) => d.totalMinutes), 180);

  const handleSaveLimit = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div 
      id="whatsapp-usage-tracker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#222e35] text-gray-100 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1f2c34] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Daily WhatsApp Usage Record
              </h3>
              <p className="text-xs text-gray-400">
                Screen time & activity analytics (कितना व्हाट्सएप चलाते हो उसका रिकॉर्ड)
              </p>
            </div>
          </div>

          <button
            id="usage-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Today Big Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/60 via-[#163329] to-[#11231f] p-6 border border-emerald-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> Today's Active Screen Time
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-white mt-1">
                  {hours > 0 && `${hours}h `}{minutes}m
                  <span className="text-xs text-gray-400 font-normal ml-2">in session</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Average daily screen time across last 7 days: <span className="text-emerald-300 font-medium">1 hr 52 mins</span>
                </p>
              </div>

              {/* Progress towards daily limit */}
              <div className="flex flex-col items-center sm:items-end">
                <div className="text-xs text-gray-400 mb-1">
                  Daily Goal Limit: {Math.floor(selectedLimit / 60)} hrs
                </div>
                <div className="w-36 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalTodayMins / selectedLimit) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 font-medium">
                  {Math.round((totalTodayMins / selectedLimit) * 100)}% of limit used
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#111b21] p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/15 text-blue-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">
                  {todayRecord.messagesSent + todayRecord.messagesReceived}
                </div>
                <div className="text-xs text-gray-400">
                  Messages Today ({todayRecord.messagesSent} sent, {todayRecord.messagesReceived} rec)
                </div>
              </div>
            </div>

            <div className="bg-[#111b21] p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/15 text-emerald-400">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">
                  {todayRecord.callMinutes} mins
                </div>
                <div className="text-xs text-gray-400">
                  Calls Duration (Voice & Video)
                </div>
              </div>
            </div>

            <div className="bg-[#111b21] p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/15 text-purple-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">98%</div>
                <div className="text-xs text-gray-400">
                  Healthy Balance Rating
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Usage Bar Chart */}
          <div className="bg-[#111b21] p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">
                  Past 7 Days WhatsApp Usage Time
                </h4>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Weekly Breakdown
              </span>
            </div>

            {/* Visual Bars */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
              {usageData.map((d, index) => {
                const heightPercent = Math.round((d.totalMinutes / maxMins) * 100);
                const isToday = index === usageData.length - 1;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      {Math.floor(d.totalMinutes / 60)}h {d.totalMinutes % 60}m
                    </div>

                    <div className="w-full max-w-[36px] bg-white/5 rounded-t-lg h-32 flex items-end justify-center p-1 relative overflow-hidden">
                      <div 
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isToday 
                            ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' 
                            : 'bg-emerald-700/60 group-hover:bg-emerald-600/80'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span className={`text-xs font-medium ${isToday ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>
                      {d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Screen Time Limit & Reminder Setting */}
          <div className="bg-[#111b21] p-5 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">
                  Daily Usage Limit & Break Reminder
                </h4>
              </div>
              {savedAlert && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-pulse">
                  <Check className="h-3.5 w-3.5" /> Limit Saved!
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400">
              WhatsApp will gently alert you when you reach your chosen daily usage limit.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1 Hour / Day', mins: 60 },
                { label: '2 Hours / Day', mins: 120 },
                { label: '3 Hours / Day', mins: 180 },
              ].map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() => setSelectedLimit(opt.mins)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                    selectedLimit === opt.mins
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSaveLimit}
              className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
            >
              Update Daily Screen Time Target
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
