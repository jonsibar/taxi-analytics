import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
export default function PredictionPage() {
  const [formData, setFormData] = useState({
    vendor_id: 1, passenger_count: 1, pickup_longitude: -73.9851, pickup_latitude: 40.7589,
    dropoff_longitude: -73.9900, dropoff_latitude: 40.7400, store_and_fwd_flag: 'N', pickup_datetime: '2016-06-01T12:00',
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes('id') || name.includes('count') ? parseInt(value) : value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null); setPrediction(null);
    try {
      const payload = { ...formData, pickup_longitude: parseFloat(formData.pickup_longitude), pickup_latitude: parseFloat(formData.pickup_latitude), dropoff_longitude: parseFloat(formData.dropoff_longitude), dropoff_latitude: parseFloat(formData.dropoff_latitude) };
      const response = await api.post('/predict', payload);
      setPrediction(response.data.predicted_trip_duration);
    } catch (err) { console.error(err); setError("Prediction service offline."); } finally { setLoading(false); }
  };
  const inputClass = "block w-full text-sm text-gray-200 bg-gray-700 border-gray-600 rounded-md border p-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-400";
  const labelClass = "block text-xs font-bold text-cyan-400 mb-1 uppercase tracking-wide";
  return (
    <Layout>
      {}
      <div className="w-full h-full overflow-y-auto bg-black scrollbar-thin scrollbar-thumb-gray-800">
        {}
        <div className="min-h-full flex items-center justify-center p-6">
          <div className="w-full max-w-3xl bg-gray-800 shadow-2xl rounded-lg overflow-hidden border border-gray-700 my-8">
            {}
            <div className="p-8 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Trip Estimator</h1>
                <p className="text-sm text-gray-400 mt-1">XGBoost Inference Engine v1.0</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Vendor Fleet</label>
                  <select name="vendor_id" value={formData.vendor_id} onChange={handleChange} className={inputClass}>
                    <option value={1}>Creative Mobile Tech</option><option value={2}>VeriFone Inc.</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Passenger Load</label>
                  <input type="number" name="passenger_count" min="1" max="6" value={formData.passenger_count} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Timestamp</label>
                  <input type="datetime-local" name="pickup_datetime" value={formData.pickup_datetime} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Connectivity</label>
                  <select name="store_and_fwd_flag" value={formData.store_and_fwd_flag} onChange={handleChange} className={inputClass}>
                    <option value="N">Online (Real-time)</option><option value="Y">Offline (Store & Fwd)</option>
                  </select>
                </div>
              </div>
              {}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="text-cyan-500">◈</span> Geospatial Vectors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-900/50 rounded border border-gray-700 border-l-4 border-l-green-500">
                    <div className="mb-3"><label className="text-xs text-green-400 font-mono">PICKUP LONGITUDE</label><input type="number" step="any" name="pickup_longitude" value={formData.pickup_longitude} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className="text-xs text-green-400 font-mono">PICKUP LATITUDE</label><input type="number" step="any" name="pickup_latitude" value={formData.pickup_latitude} onChange={handleChange} className={inputClass} required /></div>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded border border-gray-700 border-l-4 border-l-red-500">
                    <div className="mb-3"><label className="text-xs text-red-400 font-mono">DROPOFF LONGITUDE</label><input type="number" step="any" name="dropoff_longitude" value={formData.dropoff_longitude} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className="text-xs text-red-400 font-mono">DROPOFF LATITUDE</label><input type="number" step="any" name="dropoff_latitude" value={formData.dropoff_latitude} onChange={handleChange} className={inputClass} required /></div>
                  </div>
                </div>
              </div>
              {}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <button type="submit" disabled={loading} className={`w-full py-4 rounded shadow-lg text-sm font-bold text-black bg-cyan-500 hover:bg-cyan-400 focus:outline-none transition-all uppercase tracking-widest ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}>
                  {loading ? 'CALCULATING TRAJECTORY...' : 'RUN PREDICTION MODEL'}
                </button>
                {error && <div className="mt-6 p-4 bg-red-900/30 text-red-200 rounded border border-red-800 font-mono text-xs">{error}</div>}
                {prediction !== null && (
                  <div className="mt-8 p-8 bg-gray-900 border border-cyan-500/50 rounded-lg text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                    <p className="text-xs text-cyan-500 font-bold uppercase tracking-[0.2em] mb-4">Estimated Travel Time</p>
                    <div className="flex justify-center items-baseline text-white">
                      <span className="text-6xl font-mono font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                        {prediction.toFixed(2)}
                      </span>
                      <span className="ml-3 text-xl text-cyan-600 font-mono">seconds</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}