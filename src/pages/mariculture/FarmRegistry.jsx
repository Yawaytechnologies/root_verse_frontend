import React, { useState } from 'react';
import { Plus, Search, Filter, MapPin, Users, Anchor, Edit, Trash2, Eye, Map, Calendar, Phone, X } from 'lucide-react';

export default function FarmRegistry() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const farms = [
    {
      id: 'RV-MF-RA-000312',
      groupName: 'Coastal Seaweed Collective',
      leaderName: 'Ravi Kumar',
      mobile: '+91 98765 43210',
      village: 'Thangachimadam',
      landingCentre: 'Rameswaram Harbor',
      district: 'Ramanathapuram',
      state: 'Tamil Nadu',
      country: 'India',
      units: 8,
      totalArea: '2.5 hectares',
      registrationDate: '2024-03-15',
      status: 'Active',
      gpsCoordinates: '9.2876° N, 79.3129° E',
      lastHarvest: '2025-11-28'
    },
    {
      id: 'RV-MF-RA-000315',
      groupName: 'Marine Gold SHG',
      leaderName: 'Lakshmi Devi',
      mobile: '+91 98765 43211',
      village: 'Vedalai',
      landingCentre: 'Mandapam Camp',
      district: 'Ramanathapuram',
      state: 'Tamil Nadu',
      country: 'India',
      units: 6,
      totalArea: '1.8 hectares',
      registrationDate: '2024-04-20',
      status: 'Active',
      gpsCoordinates: '9.2805° N, 79.1244° E',
      lastHarvest: '2025-11-25'
    },
    {
      id: 'RV-MF-RA-000318',
      groupName: 'Ocean Harvest Collective',
      leaderName: 'Suresh Babu',
      mobile: '+91 98765 43212',
      village: 'Pamban',
      landingCentre: 'Pamban Landing',
      district: 'Ramanathapuram',
      state: 'Tamil Nadu',
      country: 'India',
      units: 10,
      totalArea: '3.2 hectares',
      registrationDate: '2024-02-10',
      status: 'Active',
      gpsCoordinates: '9.2809° N, 79.2132° E',
      lastHarvest: '2025-11-29'
    },
    {
      id: 'RV-MF-RA-000321',
      groupName: 'Blue Economy Women Group',
      leaderName: 'Meena Kumari',
      mobile: '+91 98765 43213',
      village: 'Mandapam',
      landingCentre: 'Mandapam Camp',
      district: 'Ramanathapuram',
      state: 'Tamil Nadu',
      country: 'India',
      units: 5,
      totalArea: '1.5 hectares',
      registrationDate: '2024-05-12',
      status: 'Inactive',
      gpsCoordinates: '9.2751° N, 79.1288° E',
      lastHarvest: '2025-10-15'
    }
  ];

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farm.leaderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || farm.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const FarmModal = ({ farm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{farm.groupName}</h2>
            <p className="text-teal-100 text-sm mt-1">{farm.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              farm.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {farm.status}
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Archive
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-4 rounded-xl border border-teal-100">
              <div className="text-2xl font-bold text-gray-900">{farm.units}</div>
              <div className="text-sm text-gray-600">Cultivation Units</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-cyan-100">
              <div className="text-2xl font-bold text-gray-900">{farm.totalArea}</div>
              <div className="text-sm text-gray-600">Total Area</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="text-2xl font-bold text-gray-900">{farm.lastHarvest}</div>
              <div className="text-sm text-gray-600">Last Harvest</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Leader Name</label>
                  <p className="text-gray-900 font-medium">{farm.leaderName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mobile</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal-600" />
                    {farm.mobile}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Village</label>
                  <p className="text-gray-900 font-medium">{farm.village}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Landing Centre</label>
                  <p className="text-gray-900 font-medium">{farm.landingCentre}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">District</label>
                  <p className="text-gray-900 font-medium">{farm.district}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">State</label>
                  <p className="text-gray-900 font-medium">{farm.state}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">GPS Coordinates</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    {farm.gpsCoordinates}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Registration Date</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {farm.registrationDate}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Farm ID</label>
                  <p className="text-gray-900 font-medium font-mono">{farm.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2">
              <Map className="w-4 h-4" />
              View on Map
            </button>
            <button className="flex-1 px-4 py-3 bg-white border-2 border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              View Cultivation Units
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marine Farm Registry</h1>
              <p className="text-sm text-gray-500 mt-1">Manage all registered marine farms and self-help groups</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Register New Farm
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by farm name, ID, or leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Farms</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{farms.length}</p>
              </div>
              <div className="p-3 bg-teal-100 rounded-lg">
                <Anchor className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Farms</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {farms.filter(f => f.status === 'Active').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-3xl font-bold text-cyan-600 mt-2">
                  {farms.reduce((sum, f) => sum + f.units, 0)}
                </p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Map className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Area</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">9.0 ha</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => (
            <div key={farm.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-sm">{farm.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    farm.status === 'Active' 
                      ? 'bg-emerald-400 text-emerald-900' 
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {farm.status}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mt-2">{farm.groupName}</h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium">{farm.leaderName}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">{farm.village}, {farm.district}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{farm.mobile}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Units</p>
                    <p className="text-lg font-bold text-teal-600">{farm.units}</p>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Area</p>
                    <p className="text-lg font-bold text-cyan-600">{farm.totalArea}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedFarm(farm)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFarms.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Anchor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No farms found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {selectedFarm && (
        <FarmModal farm={selectedFarm} onClose={() => setSelectedFarm(null)} />
      )}
    </div>
  );
}