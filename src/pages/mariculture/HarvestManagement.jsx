import React, { useState } from 'react';
import { Plus, Search, Filter, Package, TrendingUp, Calendar, MapPin, Anchor, QrCode, Truck, CheckCircle, Clock, AlertCircle, Eye, Download } from 'lucide-react';

export default function HarvestManagement() {
  const [activeView, setActiveView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const harvests = [
    {
      id: 'MH-2025-11-001',
      farmId: 'RV-MF-RA-000312',
      farmName: 'Coastal Seaweed Collective',
      cultivationUnit: 'RAFT-01',
      harvestDate: '2025-11-28',
      weight: '450 kg',
      species: 'Kappaphycus alvarezii',
      quality: 'Grade A',
      cratesAssigned: 15,
      status: 'Completed',
      destination: 'PCC Rameswaram',
      harvestedBy: 'Ravi Kumar',
      temperature: '4°C'
    },
    {
      id: 'MH-2025-11-002',
      farmId: 'RV-MF-RA-000315',
      farmName: 'Marine Gold SHG',
      cultivationUnit: 'LINE-03',
      harvestDate: '2025-11-27',
      weight: '380 kg',
      species: 'Kappaphycus alvarezii',
      quality: 'Grade A',
      cratesAssigned: 12,
      status: 'In Transit',
      destination: 'PCC Mandapam',
      harvestedBy: 'Lakshmi Devi',
      temperature: '5°C'
    },
    {
      id: 'MH-2025-11-003',
      farmId: 'RV-MF-RA-000318',
      farmName: 'Ocean Harvest Collective',
      cultivationUnit: 'RAFT-02',
      harvestDate: '2025-11-26',
      weight: '520 kg',
      species: 'Kappaphycus alvarezii',
      quality: 'Grade B',
      cratesAssigned: 17,
      status: 'Completed',
      destination: 'PCC Pamban',
      harvestedBy: 'Suresh Babu',
      temperature: '4°C'
    },
    {
      id: 'MH-2025-11-004',
      farmId: 'RV-MF-RA-000312',
      farmName: 'Coastal Seaweed Collective',
      cultivationUnit: 'RAFT-04',
      harvestDate: '2025-11-30',
      weight: '420 kg',
      species: 'Kappaphycus alvarezii',
      quality: 'Grade A',
      cratesAssigned: 14,
      status: 'Harvesting',
      destination: 'PCC Rameswaram',
      harvestedBy: 'Ravi Kumar',
      temperature: '-'
    },
    {
      id: 'MH-2025-11-005',
      farmId: 'RV-MF-RA-000321',
      farmName: 'Blue Economy Women Group',
      cultivationUnit: 'LINE-02',
      harvestDate: '2025-11-29',
      weight: '360 kg',
      species: 'Kappaphycus alvarezii',
      quality: 'Grade B',
      cratesAssigned: 12,
      status: 'Quality Check',
      destination: 'PCC Mandapam',
      harvestedBy: 'Meena Kumari',
      temperature: '6°C'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Harvesting': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Quality Check': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'In Transit': return <Truck className="w-4 h-4" />;
      case 'Harvesting': return <Clock className="w-4 h-4" />;
      case 'Quality Check': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredHarvests = harvests.filter(h => {
    const matchesSearch = h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         h.farmName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesView = activeView === 'all' || h.status.toLowerCase().replace(' ', '') === activeView;
    return matchesSearch && matchesView;
  });

  const stats = [
    { label: 'Total Harvests', value: harvests.length, icon: Package, color: 'bg-teal-500' },
    { label: 'This Month', value: '2,130 kg', icon: TrendingUp, color: 'bg-cyan-500' },
    { label: 'In Transit', value: harvests.filter(h => h.status === 'In Transit').length, icon: Truck, color: 'bg-blue-500' },
    { label: 'Avg Quality', value: 'Grade A', icon: CheckCircle, color: 'bg-emerald-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Harvest Management</h1>
              <p className="text-sm text-gray-500 mt-1">Track and manage all seaweed harvests</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-md">
                <Plus className="w-5 h-5" />
                Register Harvest
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
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
                placeholder="Search by harvest ID or farm name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {['all', 'harvesting', 'qualitycheck', 'intransit', 'completed'].map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === view
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1).replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>
        </div>

        {/* Harvest Cards */}
        <div className="space-y-4">
          {filteredHarvests.map((harvest) => (
            <div key={harvest.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{harvest.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(harvest.status)}`}>
                            {getStatusIcon(harvest.status)}
                            {harvest.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-teal-600">{harvest.farmName}</span> ({harvest.farmId})
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Anchor className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="text-gray-500 text-xs">Unit</p>
                          <p className="text-gray-900 font-medium">{harvest.cultivationUnit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <div>
                          <p className="text-gray-500 text-xs">Date</p>
                          <p className="text-gray-900 font-medium">{harvest.harvestDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-gray-500 text-xs">Weight</p>
                          <p className="text-gray-900 font-medium">{harvest.weight}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-gray-500 text-xs">Destination</p>
                          <p className="text-gray-900 font-medium">{harvest.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="flex gap-4">
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 px-4 py-3 rounded-lg border border-teal-100">
                        <p className="text-xs text-gray-600 mb-1">Quality</p>
                        <p className="text-lg font-bold text-teal-600">{harvest.quality}</p>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-3 rounded-lg border border-cyan-100">
                        <p className="text-xs text-gray-600 mb-1">Crates</p>
                        <p className="text-lg font-bold text-cyan-600">{harvest.cratesAssigned}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2 text-sm">
                        <QrCode className="w-4 h-4" />
                        View QR
                      </button>
                      <button className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Info Bar */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>Species: <span className="font-medium text-gray-900">{harvest.species}</span></span>
                    <span>Harvested by: <span className="font-medium text-gray-900">{harvest.harvestedBy}</span></span>
                    <span>Temp: <span className="font-medium text-gray-900">{harvest.temperature}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHarvests.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No harvests found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}