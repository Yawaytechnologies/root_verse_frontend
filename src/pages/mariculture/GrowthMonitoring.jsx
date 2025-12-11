import React, { useState } from 'react';
import { Activity, Droplets, ThermometerSun, Wind, Plus, TrendingUp, AlertTriangle, CheckCircle, Eye, Calendar, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function GrowthMonitoring() {
  const [selectedFarm, setSelectedFarm] = useState('RV-MF-RA-000312');
  const [selectedUnit, setSelectedUnit] = useState('RAFT-01');

  const growthData = [
    { date: 'Week 1', length: 5, weight: 12 },
    { date: 'Week 2', length: 12, weight: 28 },
    { date: 'Week 3', length: 22, weight: 52 },
    { date: 'Week 4', length: 35, weight: 85 },
    { date: 'Week 5', length: 48, weight: 125 },
    { date: 'Week 6', length: 58, weight: 168 },
  ];

  const waterQualityData = [
    { time: '00:00', temperature: 27.2, salinity: 32.5, ph: 8.1 },
    { time: '04:00', temperature: 26.8, salinity: 32.3, ph: 8.0 },
    { time: '08:00', temperature: 28.5, salinity: 32.8, ph: 8.2 },
    { time: '12:00', temperature: 30.1, salinity: 33.2, ph: 8.3 },
    { time: '16:00', temperature: 29.5, salinity: 33.0, ph: 8.2 },
    { time: '20:00', temperature: 28.2, salinity: 32.7, ph: 8.1 },
  ];

  const currentParameters = [
    { label: 'Water Temperature', value: '28.5°C', status: 'good', icon: ThermometerSun, range: '25-30°C', color: 'bg-emerald-500' },
    { label: 'Salinity', value: '32.8 ppt', status: 'good', icon: Droplets, range: '30-35 ppt', color: 'bg-cyan-500' },
    { label: 'pH Level', value: '8.2', status: 'good', icon: Activity, range: '7.8-8.4', color: 'bg-blue-500' },
    { label: 'Current Speed', value: '0.3 m/s', status: 'warning', icon: Wind, range: '0.2-0.5 m/s', color: 'bg-amber-500' },
  ];

  const maintenanceLogs = [
    { date: '2025-11-28', activity: 'Routine Inspection', unit: 'RAFT-01', status: 'Completed', notes: 'All ropes secured, growth normal' },
    { date: '2025-11-25', activity: 'Cleaning', unit: 'RAFT-01', status: 'Completed', notes: 'Removed fouling organisms' },
    { date: '2025-11-22', activity: 'Line Adjustment', unit: 'RAFT-01', status: 'Completed', notes: 'Adjusted tension on lines 3-5' },
  ];

  const alerts = [
    { type: 'warning', message: 'Current speed below optimal range', unit: 'RAFT-01', time: '2 hours ago' },
    { type: 'info', message: 'Growth rate slightly below average', unit: 'LINE-03', time: '5 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Growth & Water Quality Monitoring</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time monitoring of cultivation conditions</p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="RV-MF-RA-000312">Coastal Seaweed Collective</option>
                <option value="RV-MF-RA-000315">Marine Gold SHG</option>
                <option value="RV-MF-RA-000318">Ocean Harvest Collective</option>
              </select>
              <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Log Data
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-6">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`rounded-xl p-4 border ${
                alert.type === 'warning' 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-3">
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Activity className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      alert.type === 'warning' ? 'text-amber-900' : 'text-blue-900'
                    }`}>{alert.message}</p>
                    <p className={`text-sm ${
                      alert.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
                    }`}>Unit: {alert.unit} • {alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {currentParameters.map((param, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${param.color} p-3 rounded-lg`}>
                  <param.icon className="w-6 h-6 text-white" />
                </div>
                {param.status === 'good' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <h3 className="text-sm text-gray-600 mb-1">{param.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">{param.value}</p>
              <p className="text-xs text-gray-500">Optimal: {param.range}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Growth Rate Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Growth Rate</h2>
                <p className="text-sm text-gray-500 mt-1">Unit: {selectedUnit}</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">+15% vs avg</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#14b8a6" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Length</p>
                <p className="text-xl font-bold text-teal-600">58 cm</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-xl font-bold text-cyan-600">168 g</p>
              </div>
            </div>
          </div>

          {/* Water Quality Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Water Temperature (24h)</h2>
                <p className="text-sm text-gray-500 mt-1">Live monitoring</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={waterQualityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[25, 32]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="temperature" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600">Current</p>
                <p className="text-xl font-bold text-cyan-600">28.5°C</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Min</p>
                <p className="text-xl font-bold text-blue-600">26.8°C</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Max</p>
                <p className="text-xl font-bold text-emerald-600">30.1°C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance & Activity Log</h2>
            <button className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Log Entry
            </button>
          </div>
          <div className="space-y-3">
            {maintenanceLogs.map((log, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100 hover:border-teal-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{log.activity}</span>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {log.date}
                      </span>
                      <span>Unit: {log.unit}</span>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-gray-700 mt-2 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}