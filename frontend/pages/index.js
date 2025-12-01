import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; 
import Layout from '../components/Layout';
import api from '../services/api';
const VENDOR_NAMES = {
  1: "Creative Mobile Technologies",
  2: "VeriFone Inc."
};
const DAYS = [
  { val: 1, label: "Monday" },
  { val: 2, label: "Tuesday" },
  { val: 3, label: "Wednesday" },
  { val: 4, label: "Thursday" },
  { val: 5, label: "Friday" },
  { val: 6, label: "Saturday" },
  { val: 0, label: "Sunday" }
];
const MapWithNoSSR = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center text-cyan-400 font-mono">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-2"></div>
      LOADING SATELLITE FEED...
    </div>
  )
});
export default function Dashboard() {
  const [tableTrips, setTableTrips] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total_rows: 0 });
  const [mapTrips, setMapTrips] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [focusedTrip, setFocusedTrip] = useState(null);
  const [vendorFilter, setVendorFilter] = useState('');
  const [passengerFilter, setPassengerFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [jumpPage, setJumpPage] = useState(1);
  const ROWS_PER_PAGE = 50;
  const buildParams = (page, limit) => {
    const params = { page, limit };
    if (vendorFilter) params.vendor_id = vendorFilter;
    if (passengerFilter) params.passenger_count = passengerFilter;
    if (dayFilter !== '') params.pickup_day = dayFilter;
    if (durationFilter === 'short') params.max_duration = 300;
    else if (durationFilter === 'medium') { params.min_duration = 300; params.max_duration = 1200; }
    else if (durationFilter === 'long') params.min_duration = 1200;
    return params;
  };
  const fetchTableData = async (page = 1) => {
    setTableLoading(true);
    try {
      const params = buildParams(page, ROWS_PER_PAGE); 
      const response = await api.get('/trips', { params });
      setTableTrips(response.data.data);
      setPagination(response.data.pagination);
      setJumpPage(response.data.pagination.page); 
    } catch (error) { console.error(error); } 
    finally { setTableLoading(false); }
  };
  const fetchMapData = async () => {
    setMapLoading(true);
    try {
      const params = buildParams(1, 1000); 
      const response = await api.get('/trips', { params });
      setMapTrips(response.data.data);
    } catch (error) { console.error(error); } 
    finally { setMapLoading(false); }
  };
  useEffect(() => { 
    fetchTableData(1); 
    fetchMapData(); 
    setFocusedTrip(null); 
  }, [vendorFilter, passengerFilter, dayFilter, durationFilter]);
  const handlePageChange = (newPage) => { 
    if (newPage >= 1 && newPage <= pagination.total_pages) fetchTableData(newPage); 
  };
  const handleJumpSubmit = (e) => { 
    if (e.key === 'Enter') { 
      const p = parseInt(jumpPage); 
      if (p >= 1 && p <= pagination.total_pages) fetchTableData(p); 
    } 
  };
  const handleRowClick = (trip) => { 
    setFocusedTrip(trip); 
  };
  const getRecordRange = () => {
    if (pagination.total_rows === 0) return "0 RECORDS";
    const start = (pagination.page - 1) * ROWS_PER_PAGE + 1;
    const end = Math.min(pagination.page * ROWS_PER_PAGE, pagination.total_rows);
    return `SHOWING RECORD ${start.toLocaleString()} - ${end.toLocaleString()} OF ${pagination.total_rows.toLocaleString()}`;
  };
  const inputClass = "block w-full text-xs text-gray-200 bg-black/50 border border-gray-600 rounded p-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm";
  const labelClass = "block text-[10px] font-bold text-cyan-400 mb-1 uppercase tracking-widest";
  return (
    <Layout>
      {}
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        {}
        {}
        <div className="flex-grow relative bg-black border-b border-gray-800">
          {}
          <div className={`absolute top-4 left-4 z-[1000] w-80 transition-all duration-300 ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
              <div className="px-4 py-3 bg-black/40 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">DATA LAYERS</h2>
                  <p className="text-[10px] text-gray-400">{pagination.total_rows.toLocaleString()} records matched</p>
                </div>
                {mapLoading && <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>}
              </div>
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                <div>
                  <label className={labelClass}>Vendor Fleet</label>
                  <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} className={inputClass}>
                    <option value="">Show All</option><option value="1">Creative Mobile Tech</option><option value="2">VeriFone Inc.</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Passengers</label>
                    <select value={passengerFilter} onChange={(e) => setPassengerFilter(e.target.value)} className={inputClass}>
                      <option value="">Any</option>{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Duration</label>
                    <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className={inputClass}>
                      <option value="">Any</option><option value="short">&lt; 5m</option><option value="medium">5-20m</option><option value="long">&gt; 20m</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Day of Week</label>
                  <select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className={inputClass}>
                    <option value="">All Days</option>{DAYS.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="absolute top-4 left-4 z-[1001] bg-gray-900/80 p-2 rounded-lg border border-gray-700 text-white hover:bg-gray-800 transition-opacity" style={{ opacity: showFilters ? 0 : 1 }}>
            <span className="text-xs font-bold">Filters</span>
          </button>
          {focusedTrip && (
            <div className="absolute top-4 right-4 z-[1000]">
              <button onClick={() => setFocusedTrip(null)} className="bg-cyan-900/90 hover:bg-cyan-800 text-white border border-cyan-500 px-6 py-2 rounded shadow-lg font-mono text-xs uppercase tracking-widest backdrop-blur-md transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                ✖ CLEAR
              </button>
            </div>
          )}
          <MapWithNoSSR trips={mapTrips} focusedTrip={focusedTrip} onPointClick={handleRowClick} />
        </div>
        {}
        {}
        <div className="w-full h-[35vh] flex-none bg-gray-900 border-t border-gray-800 flex flex-col">
          <div className="px-6 py-2 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center flex-none">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wide">Trip Manifest Log</h3>
            <span className="text-xs text-gray-500 font-mono">LOADED 50 ROWS PER PAGE</span>
          </div>
          <div className="overflow-x-auto flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <table className="w-full divide-y divide-gray-800 relative">
              <thead className="bg-gray-950 sticky top-0 z-10 shadow-lg">
                <tr>
                  {["Pickup Time", "Route Vector", "Pax", "Duration", "Vendor"].map((h, i) => (
                    <th key={h} className={`px-6 py-3 text-xs font-bold text-cyan-500 uppercase tracking-wider bg-gray-950 ${i === 2 ? 'text-center' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {tableLoading ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-mono">Accessing Database...</td></tr>
                ) : tableTrips.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-mono">No records matching filter criteria.</td></tr>
                ) : (
                  tableTrips.map((trip, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => handleRowClick(trip)} 
                      className={`cursor-pointer transition-colors duration-150 border-l-2 ${focusedTrip && focusedTrip.id === trip.id ? 'bg-cyan-900/20 border-cyan-500' : 'hover:bg-gray-800 border-transparent'}`}
                    >
                      <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-300 font-mono">{new Date(trip.pickup_datetime).toLocaleString()}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-[10px] text-gray-500 font-mono">
                        <span className="text-green-500/80 mr-2">● {trip.pickup_latitude.toFixed(2)},{trip.pickup_longitude.toFixed(2)}</span>
                        <span className="text-red-500/80">● {trip.dropoff_latitude.toFixed(2)},{trip.dropoff_longitude.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-xs text-gray-400 text-center">{trip.passenger_count}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-xs text-cyan-300 font-mono">{Math.floor(trip.trip_duration / 60)}m {trip.trip_duration % 60}s</td>
                      <td className="px-6 py-2 whitespace-nowrap text-[10px] text-gray-500 uppercase tracking-wide">{VENDOR_NAMES[trip.vendor_id] || trip.vendor_id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {}
          <div className="bg-gray-950 px-6 py-2 flex flex-col sm:flex-row items-center justify-between border-t border-gray-800 flex-none gap-4">
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase hidden sm:block">
              {getRecordRange()}
            </span>
            <div className="flex items-center shadow-lg">
              <button onClick={() => handlePageChange(1)} disabled={pagination.page === 1} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-500 disabled:text-gray-600 disabled:bg-gray-900 border border-gray-700 rounded-l-md transition-colors font-mono text-xs border-r-0">«</button>
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-500 disabled:text-gray-600 disabled:bg-gray-900 border border-gray-700 transition-colors font-mono text-xs">PREV</button>
              <div className="flex items-center bg-black border-y border-gray-700 h-full px-4 min-h-[34px]">
                <span className="text-gray-600 text-[10px] font-bold mr-2">PAGE</span>
                <input 
                  type="number" 
                  value={jumpPage} 
                  onChange={(e) => setJumpPage(e.target.value)} 
                  onKeyDown={handleJumpSubmit} 
                  className="w-12 bg-transparent text-white font-mono text-sm text-center outline-none border-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-600 text-[10px] font-bold ml-2 border-l border-gray-800 pl-2">
                  OF {pagination.total_pages.toLocaleString()}
                </span>
              </div>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.total_pages} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-500 disabled:text-gray-600 disabled:bg-gray-900 border border-gray-700 transition-colors font-mono text-xs border-l-0">NEXT</button>
              <button onClick={() => handlePageChange(pagination.total_pages)} disabled={pagination.page === pagination.total_pages} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-500 disabled:text-gray-600 disabled:bg-gray-900 border border-gray-700 rounded-r-md transition-colors font-mono text-xs border-l-0">»</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}