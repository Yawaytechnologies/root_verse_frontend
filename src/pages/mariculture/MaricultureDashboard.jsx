import React, { useState } from 'react';
import { Waves, Map, Package, TrendingUp, Calendar, Users, MapPin, Activity, Plus, Search, Filter, Download, ChevronRight, Anchor, Droplets, ThermometerSun } from 'lucide-react';

export default function MaricultureDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFarm, setSelectedFarm] = useState(null);

  // Mock data
  const stats = [
    { label: 'Active Marine Farms', value: '24', change: '+3', icon: Anchor, color: 'bg-blue-500' },
    { label: 'Cultivation Units', value: '156', change: '+12', icon: Waves, color: 'bg-teal-500' },
    { label: 'Harvest This Month', value: '8.4T', change: '+15%', icon: Package, color: 'bg-emerald-500' },
    { label: 'Water Quality Score', value: '94%', change: '+2%', icon: Droplets, color: 'bg-cyan-500' }
  ];

  const recentHarvests = [
    { id: 'MH-2025-11-001', farm: 'RV-MF-RA-000312', unit: 'RAFT-01', weight: '450kg', date: '2025-11-28', status: 'Completed' },
    { id: 'MH-2025-11-002', farm: 'RV-MF-RA-000315', unit: 'LINE-03', weight: '380kg', date: '2025-11-27', status: 'In Transit' },
    { id: 'MH-2025-11-003', farm: 'RV-MF-RA-000318', unit: 'RAFT-02', weight: '520kg', date: '2025-11-26', status: 'Completed' }
  ];

  const activeFarms = [
    { id: 'RV-MF-RA-000312', name: 'Coastal Seaweed Group', leader: 'Ravi Kumar', units: 8, location: 'Rameswaram', status: 'Active', lastHarvest: '2 days ago' },
    { id: 'RV-MF-RA-000315', name: 'Marine Gold SHG', leader: 'Lakshmi Devi', units: 6, location: 'Mandapam', status: 'Active', lastHarvest: '5 days ago' },
    { id: 'RV-MF-RA-000318', name: 'Ocean Harvest Collective', leader: 'Suresh Babu', units: 10, location: 'Pamban', status: 'Active', lastHarvest: '1 day ago' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mariculture Management</h1>
              <p className="text-sm text-gray-500 mt-1">Seaweed Cultivation & Ocean Farming</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Register Marine Farm
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
         
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Harvests */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Harvests</h2>
                  <button className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentHarvests.map((harvest) => (
                    <div key={harvest.id} className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100 hover:border-teal-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{harvest.id}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              harvest.status === 'Completed' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {harvest.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {harvest.farm}
                            </span>
                            <span>Unit: {harvest.unit}</span>
                            <span>Weight: {harvest.weight}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{harvest.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-3">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Register Harvest</span>
                  </button>
                  <button className="w-full p-4 bg-white border-2 border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 transition-all flex items-center gap-3">
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">Log Growth Data</span>
                  </button>
                  <button className="w-full p-4 bg-white border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-3">
                    <ThermometerSun className="w-5 h-5" />
                    <span className="font-medium">Water Quality Check</span>
                  </button>
                  <button className="w-full p-4 bg-white border-2 border-cyan-200 text-cyan-700 rounded-lg hover:bg-cyan-50 transition-all flex items-center gap-3">
                    <Map className="w-5 h-5" />
                    <span className="font-medium">View Farm Map</span>
                  </button>
                </div>

                {/* Alert Box */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Activity className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-amber-900 mb-1">Maintenance Alert</h3>
                      <p className="text-xs text-amber-700">3 cultivation units need inspection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Marine Farms */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Active Marine Farms</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search farms..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Farm ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Farm Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Leader</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Units</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Harvest</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFarms.map((farm) => (
                      <tr key={farm.id} className="border-b border-gray-100 hover:bg-teal-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-teal-600">{farm.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-900 font-medium">{farm.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700">{farm.leader}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {farm.location}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700">{farm.units}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">{farm.lastHarvest}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {farm.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'farms' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Marine Farm Registry</h2>
            <p className="text-gray-600">Farm management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'harvests' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Harvest Management</h2>
            <p className="text-gray-600">Harvest tracking interface coming soon...</p>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Growth & Water Quality Monitoring</h2>
            <p className="text-gray-600">Monitoring dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}