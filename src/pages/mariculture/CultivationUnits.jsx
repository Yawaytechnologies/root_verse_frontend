import React, { useState } from 'react';
import { Plus, Search, Filter, MapPin, Anchor, Grid, List, TrendingUp, Calendar, AlertCircle, CheckCircle, Edit, Trash2, Eye, Map } from 'lucide-react';

export default function CultivationUnits() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFarm, setSelectedFarm] = useState('all');

  const units = [
    {
      id: 'RV-MF-RA-000312-001',
      unitCode: 'RAFT-01',
      farmId: 'RV-MF-RA-000312',
      farmName: 'Coastal Seaweed Collective',
      type: 'Raft',
      species: 'Kappaphycus alvarezii',
      location: { lat: '9.2876° N', lng: '79.3129° E' },
      status: 'Active',
      plantingDate: '2025-09-15',
      expectedHarvest: '2025-12-15',
      currentGrowth: '85%',
      dimensions: '5m x 8m',
      lineCount: 12,
      lastInspection: '2025-11-28',
      healthScore: 95
    },
    {
      id: 'RV-MF-RA-000312-002',
      unitCode: 'RAFT-02',
      farmId: 'RV-MF-RA-000312',
      farmName: 'Coastal Seaweed Collective',
      type: 'Raft',
      species: 'Kappaphycus alvarezii',
      location: { lat: '9.2878° N', lng: '79.3131° E' },
      status: 'Active',
      plantingDate: '2025-09-20',
      expectedHarvest: '2025-12-20',
      currentGrowth: '80%',
      dimensions: '5m x 8m',
      lineCount: 12,
      lastInspection: '2025-11-26',
      healthScore: 88
    },
    {
      id: 'RV-MF-RA-000315-001',
      unitCode: 'LINE-03',
      farmId: 'RV-MF-RA-000315',
      farmName: 'Marine Gold SHG',
      type: 'Long Line',
      species: 'Kappaphycus alvarezii',
      location: { lat: '9.2805° N', lng: '79.1244° E' },
      status: 'Active',
      plantingDate: '2025-09-10',
      expectedHarvest: '2025-12-10',
      currentGrowth: '90%',
      dimensions: '50m',
      lineCount: 1,
      lastInspection: '2025-11-27',
      healthScore: 92
    },
    {
      id: 'RV-MF-RA-000318-001',
      unitCode: 'RAFT-04',
      farmId: 'RV-MF-RA-000318',
      farmName: 'Ocean Harvest Collective',
      type: 'Raft',
      species: 'Kappaphycus alvarezii',
      location: { lat: '9.2809° N', lng: '79.2132° E' },
      status: 'Maintenance',
      plantingDate: '2025-08-25',
      expectedHarvest: '2025-11-25',
      currentGrowth: '100%',
      dimensions: '5m x 8m',
      lineCount: 12,
      lastInspection: '2025-11-25',
      healthScore: 78
    },
    {
      id: 'RV-MF-RA-000318-002',
      unitCode: 'LINE-05',
      farmId: 'RV-MF-RA-000318',
      farmName: 'Ocean Harvest Collective',
      type: 'Long Line',
      species: 'Kappaphycus alvarezii',
      location: { lat: '9.2811° N', lng: '79.2134° E' },
      status: 'Active',
      plantingDate: '2025-09-18',
      expectedHarvest: '2025-12-18',
      currentGrowth: '82%',
      dimensions: '45m',
      lineCount: 1,
      lastInspection: '2025-11-29',
      healthScore: 90
    },
    {
      id: 'RV-MF-RA-000321-001',
      unitCode: 'CAGE-01',
      farmId: 'RV-MF-RA-000321',
      farmName: 'Blue Economy Women Group',
      type: 'Cage',
      species: 'Kappaphycus alvarezii',
      location: { lat: '9.2751° N', lng: '79.1288° E' },
      status: 'Inactive',
      plantingDate: '2025-08-01',
      expectedHarvest: '2025-11-01',
      currentGrowth: '0%',
      dimensions: '3m x 3m x 2m',
      lineCount: 0,
      lastInspection: '2025-10-15',
      healthScore: 0
    }
  ];

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         unit.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         unit.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || unit.type.toLowerCase().replace(' ', '') === filterType;
    const matchesFarm = selectedFarm === 'all' || unit.farmId === selectedFarm;
    return matchesSearch && matchesType && matchesFarm;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-cyan-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const stats = [
    { label: 'Total Units', value: units.length, subtext: 'Across all farms' },
    { label: 'Active Units', value: units.filter(u => u.status === 'Active').length, subtext: 'Currently growing' },
    { label: 'Rafts', value: units.filter(u => u.type === 'Raft').length, subtext: 'Raft systems' },
    { label: 'Avg Health', value: `${Math.round(units.reduce((sum, u) => sum + u.healthScore, 0) / units.length)}%`, subtext: 'Overall score' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cultivation Units</h1>
              <p className="text-sm text-gray-500 mt-1">Manage rafts, long lines, and cages</p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Unit
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-900">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by unit code, farm name, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="all">All Farms</option>
                <option value="RV-MF-RA-000312">Coastal Seaweed</option>
                <option value="RV-MF-RA-000315">Marine Gold</option>
                <option value="RV-MF-RA-000318">Ocean Harvest</option>
                <option value="RV-MF-RA-000321">Blue Economy</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="all">All Types</option>
                <option value="raft">Raft</option>
                <option value="longline">Long Line</option>
                <option value="cage">Cage</option>
              </select>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More
              </button>
            </div>
          </div>
        </div>

        {/* Units Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((unit) => (
              <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-lg">{unit.unitCode}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(unit.status)}`}>
                      {unit.status}
                    </span>
                  </div>
                  <p className="text-teal-100 text-sm">{unit.id}</p>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Farm</p>
                    <p className="text-sm font-medium text-gray-900">{unit.farmName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Type</p>
                      <p className="text-sm font-bold text-teal-600">{unit.type}</p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Growth</p>
                      <p className="text-sm font-bold text-cyan-600">{unit.currentGrowth}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-y">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Health Score</p>
                      <p className={`text-2xl font-bold ${getHealthColor(unit.healthScore)}`}>
                        {unit.healthScore}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Expected Harvest</p>
                      <p className="text-sm font-medium text-gray-900">{unit.expectedHarvest}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="text-xs">{unit.location.lat}, {unit.location.lng}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-cyan-600" />
                      <span className="text-xs">Planted: {unit.plantingDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-3 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors text-sm flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors text-sm flex items-center justify-center gap-1">
                      <Map className="w-4 h-4" />
                      Map
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Unit Code</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Farm</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Growth</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Health</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Harvest Date</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} className="border-b border-gray-100 hover:bg-teal-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-teal-600">{unit.unitCode}</p>
                        <p className="text-xs text-gray-500">{unit.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{unit.farmName}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{unit.type}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(unit.status)}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div 
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: unit.currentGrowth }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">{unit.currentGrowth}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`text-sm font-bold ${getHealthColor(unit.healthScore)}`}>
                        {unit.healthScore}%
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-700">{unit.expectedHarvest}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredUnits.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Anchor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No units found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}