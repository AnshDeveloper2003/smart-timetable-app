'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface Props {
  analytics: any;
  isDark: boolean;
}

const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function AnalyticsCharts({ analytics, isDark }: Props) {
  if (!analytics) return null;

  const dayData = Object.entries(analytics.dayCount).map(([day, count]) => ({
    day, count,
  }));

  const pieData = dayData.filter((d: any) => d.count > 0).map((d: any) => ({
    name: d.day, value: d.count
  }));

  const hourData = analytics.hourCount
    ? Object.entries(analytics.hourCount)
        .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
        .sort((a: any, b: any) => parseInt(a.hour) - parseInt(b.hour))
    : [];

  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const textColor = isDark ? '#E2E8F0' : '#1E293B';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  return (
    <div className="space-y-4">

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Events", value: analytics.totalEvents, color: "blue", icon: "📅" },
          { label: "Total Hours", value: analytics.totalHours + "h", color: "emerald", icon: "⏱️" },
          { label: "Avg/Day", value: analytics.avgEventsPerDay, color: "purple", icon: "📊" },
          { label: "Busiest Day", value: analytics.busiestDay?.split(' ')[0], color: "yellow", icon: "🔥" },
        ].map((stat, i) => (
          <div key={i} className={`${cardBg} p-4 border rounded-xl text-center shadow`}>
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} mt-1`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className={`${cardBg} p-5 border rounded-xl shadow`}>
        <h4 className={`font-bold mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          📅 Events by Day of Week (Last 30 Days)
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 12 }} />
            <YAxis tick={{ fill: textColor, fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1E293B' : '#fff',
                border: '1px solid #334155',
                borderRadius: 8
              }}
              labelStyle={{ color: textColor }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie + Area Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Pie Chart */}
        <div className={`${cardBg} p-5 border rounded-xl shadow`}>
          <h4 className={`font-bold mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            🥧 Event Distribution
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1E293B' : '#fff',
                  border: '1px solid #334155',
                  borderRadius: 8
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {pieData.map((d: any, i) => (
              <span key={i} className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{d.name}: {d.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Area Chart */}
        {hourData.length > 0 && (
          <div className={`${cardBg} p-5 border rounded-xl shadow`}>
            <h4 className={`font-bold mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              ⏰ Activity by Hour
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="hour" tick={{ fill: textColor, fontSize: 10 }} />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1E293B' : '#fff',
                    border: '1px solid #334155',
                    borderRadius: 8
                  }}
                  labelStyle={{ color: textColor }}
                />
                <Area type="monotone" dataKey="count" stroke="#06B6D4" fill="#06B6D433" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className={`${cardBg} p-4 border rounded-xl shadow`}>
        <p className={`${isDark ? 'text-slate-300' : 'text-gray-600'} text-sm`}>
          ⏰ <span className="font-bold">Busiest Hour:</span> {analytics.busiestHour}
          {"  |  "}
          🔥 <span className="font-bold">Busiest Day:</span> {analytics.busiestDay}
        </p>
      </div>

    </div>
  );
}