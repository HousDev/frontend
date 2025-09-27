import React, { useState } from 'react';
import { 
  Brain, 
  Database, 
  TrendingUp, 
  FileText, 
  Upload, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Zap,
  Target,
  Eye,
  Download,
  Users,
  Trash2
} from 'lucide-react';

const AITraining = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const [trainingData, setTrainingData] = useState({
    propertyData: '',
    marketTrends: '',
    clientInteractions: '',
    pricingHistory: ''
  });

  const tabs = [
    { id: 'dashboard', label: 'AI Dashboard', icon: Brain },
    { id: 'data', label: 'Training Data', icon: Database },
    { id: 'uploads', label: 'Data Management', icon: Upload },
    { id: 'model', label: 'Model Training', icon: Settings },
    { id: 'analytics', label: 'Performance', icon: BarChart3 }
  ];

  const handleFileUpload = (fileType, event) => {
    const file = event.target.files[0];
    if (file) {
      const newUpload = {
        id: Date.now(),
        name: file.name,
        type: fileType,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'Processing',
        records: Math.floor(Math.random() * 10000) + 1000
      };
      setUploadedFiles(prev => [...prev, newUpload]);
      
      // Simulate processing
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === newUpload.id ? {...f, status: 'Processed'} : f
        ));
      }, 3000);
    }
  };

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* AI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Brain className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Model Status</h3>
              <p className="text-2xl font-bold text-green-600">Active</p>
              <p className="text-sm text-gray-500">Last trained: 2 hours ago</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Database className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Points</h3>
              <p className="text-2xl font-bold text-blue-600">125,847</p>
              <p className="text-sm text-gray-500">Properties analyzed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Accuracy Rate</h3>
              <p className="text-2xl font-bold text-purple-600">94.2%</p>
              <p className="text-sm text-gray-500">Price predictions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Activity className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">API Requests</h3>
              <p className="text-2xl font-bold text-orange-600">8,743</p>
              <p className="text-sm text-gray-500">Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent AI Activities */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent AI Activities</h3>
        <div className="space-y-4">
          {[
            { action: 'Price Prediction Model Updated', time: '2 hours ago', status: 'success' },
            { action: 'Market Trend Analysis Completed', time: '4 hours ago', status: 'success' },
            { action: 'New Property Data Ingested', time: '6 hours ago', status: 'success' },
            { action: 'Investment Analysis Model Trained', time: '8 hours ago', status: 'success' },
            { action: 'Chatbot Response Optimized', time: '12 hours ago', status: 'success' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Success
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrainingData = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Training Data Sources</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Property Data (JSON/CSV)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 mb-2">Upload property database</p>
              <input
                type="file"
                accept=".json,.csv"
                className="hidden"
                id="property-data"
                onChange={(e) => handleFileUpload('Property Data', e)}
              />
              <label
                htmlFor="property-data"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
              >
                Choose Files
              </label>
              <a
                href="/sample-data/property-training-data.json"
                download
                className="ml-2 text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Download Sample
              </a>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Current: 125,847 properties loaded
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Market Trends Data
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <TrendingUp className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 mb-2">Upload market analysis data</p>
              <input
                type="file"
                accept=".json,.csv"
                className="hidden"
                id="market-data"
                onChange={(e) => handleFileUpload('Market Trends', e)}
              />
              <label
                htmlFor="market-data"
                className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
              >
                Choose Files
              </label>
              <a
                href="/sample-data/market-trends-data.csv"
                download
                className="ml-2 text-green-600 hover:text-green-700 text-sm underline"
              >
                Download Sample
              </a>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Current: 45,623 market data points
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Client Interaction Data
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 mb-2">Upload chat & interaction logs</p>
              <input
                type="file"
                accept=".json,.csv"
                className="hidden"
                id="interaction-data"
                onChange={(e) => handleFileUpload('Client Interactions', e)}
              />
              <label
                htmlFor="interaction-data"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
              >
                Choose Files
              </label>
              <a
                href="/sample-data/client-interactions-data.json"
                download
                className="ml-2 text-purple-600 hover:text-purple-700 text-sm underline"
              >
                Download Sample
              </a>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Current: 78,945 interactions analyzed
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pricing History
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <BarChart3 className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 mb-2">Upload historical pricing data</p>
              <input
                type="file"
                accept=".json,.csv"
                className="hidden"
                id="pricing-data"
                onChange={(e) => handleFileUpload('Pricing History', e)}
              />
              <label
                htmlFor="pricing-data"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-700 transition-colors"
              >
                Choose Files
              </label>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Current: 234,567 price points tracked
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Data Processing Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Properties: </span>
              <span className="font-bold text-green-600">✓ Processed</span>
            </div>
            <div>
              <span className="text-gray-600">Market Data: </span>
              <span className="font-bold text-green-600">✓ Processed</span>
            </div>
            <div>
              <span className="text-gray-600">Interactions: </span>
              <span className="font-bold text-yellow-600">⏳ Processing</span>
            </div>
            <div>
              <span className="text-gray-600">Pricing: </span>
              <span className="font-bold text-green-600">✓ Processed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Uploaded Training Data</h3>
        
        {uploadedFiles.length === 0 ? (
          <div className="text-center py-12">
            <Database className="mx-auto text-gray-300 mb-4" size={48} />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Data Uploaded Yet</h4>
            <p className="text-gray-600 mb-6">Upload your training data files to get started</p>
            <button 
              onClick={() => setActiveTab('data')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Data Files
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">File Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Records</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Upload Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file) => (
                  <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{file.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {file.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{file.size}</td>
                    <td className="py-3 px-4 text-gray-600">{file.records.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{file.uploadDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        file.status === 'Processed' ? 'bg-green-100 text-green-800' :
                        file.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-700">
                          <Download size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Property Files</h3>
              <p className="text-2xl font-bold text-blue-600">
                {uploadedFiles.filter(f => f.type === 'Property Data').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Market Files</h3>
              <p className="text-2xl font-bold text-green-600">
                {uploadedFiles.filter(f => f.type === 'Market Trends').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Interaction Files</h3>
              <p className="text-2xl font-bold text-purple-600">
                {uploadedFiles.filter(f => f.type === 'Client Interactions').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Database className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Records</h3>
              <p className="text-2xl font-bold text-orange-600">
                {uploadedFiles.reduce((acc, f) => acc + f.records, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModelTraining = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">AI Model Training</h3>
        
        {isTraining && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <RefreshCw className="animate-spin text-blue-600" size={20} />
              <span className="font-semibold text-blue-900">Training in Progress...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-700 mt-2">{trainingProgress}% Complete</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Available Models</h4>
            <div className="space-y-3">
              {[
                { name: 'Property Price Prediction', status: 'active', accuracy: '94.2%' },
                { name: 'Market Trend Analysis', status: 'active', accuracy: '89.7%' },
                { name: 'Investment Recommendation', status: 'active', accuracy: '91.3%' },
                { name: 'Chatbot Response Generation', status: 'training', accuracy: '87.1%' }
              ].map((model, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{model.name}</h5>
                    <p className="text-sm text-gray-600">Accuracy: {model.accuracy}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    model.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {model.status === 'active' ? 'Active' : 'Training'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Training Configuration</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Mode
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Full Model Retrain</option>
                  <option>Incremental Learning</option>
                  <option>Fine-tuning</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Split
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="number" 
                    placeholder="Train %"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    defaultValue="70"
                  />
                  <input 
                    type="number" 
                    placeholder="Valid %"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    defaultValue="20"
                  />
                  <input 
                    type="number" 
                    placeholder="Test %"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    defaultValue="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Rate
                </label>
                <input 
                  type="number" 
                  step="0.0001"
                  placeholder="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  defaultValue="0.0001"
                />
              </div>

              <button
                onClick={startTraining}
                disabled={isTraining}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50"
              >
                {isTraining ? 'Training in Progress...' : 'Start Training'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="text-blue-600" size={24} />
            <h3 className="font-semibold text-gray-900">Model Performance</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="text-sm font-medium">94.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '94.2%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Precision</span>
                <span className="text-sm font-medium">89.7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '89.7%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Recall</span>
                <span className="text-sm font-medium">91.3%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '91.3%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="text-green-600" size={24} />
            <h3 className="font-semibold text-gray-900">Usage Statistics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">API Calls Today</span>
              <span className="font-bold text-green-600">8,743</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-bold text-blue-600">2,456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Properties Analyzed</span>
              <span className="font-bold text-purple-600">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chat Sessions</span>
              <span className="font-bold text-orange-600">567</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="text-orange-600" size={24} />
            <h3 className="font-semibold text-gray-900">System Health</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Response Time</span>
              <span className="text-green-600 font-medium">120ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="text-green-600 font-medium">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Error Rate</span>
              <span className="text-green-600 font-medium">0.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">CPU Usage</span>
              <span className="text-yellow-600 font-medium">45%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent AI Predictions</h3>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Property ID</th>
                <th className="text-left py-3 px-4">Predicted Price</th>
                <th className="text-left py-3 px-4">Actual Price</th>
                <th className="text-left py-3 px-4">Accuracy</th>
                <th className="text-left py-3 px-4">Confidence</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'PROP001', predicted: '₹2.5Cr', actual: '₹2.4Cr', accuracy: '96%', confidence: '94%', date: '2025-01-15' },
                { id: 'PROP002', predicted: '₹4.2Cr', actual: '₹4.5Cr', accuracy: '93%', confidence: '91%', date: '2025-01-15' },
                { id: 'PROP003', predicted: '₹1.8Cr', actual: '₹1.9Cr', accuracy: '95%', confidence: '89%', date: '2025-01-14' },
                { id: 'PROP004', predicted: '₹3.1Cr', actual: '₹2.9Cr', accuracy: '94%', confidence: '92%', date: '2025-01-14' },
                { id: 'PROP005', predicted: '₹5.7Cr', actual: '₹5.6Cr', accuracy: '98%', confidence: '96%', date: '2025-01-13' }
              ].map((prediction, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{prediction.id}</td>
                  <td className="py-3 px-4">{prediction.predicted}</td>
                  <td className="py-3 px-4">{prediction.actual}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {prediction.accuracy}
                    </span>
                  </td>
                  <td className="py-3 px-4">{prediction.confidence}</td>
                  <td className="py-3 px-4 text-gray-500">{prediction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Training & Management</h1>
          <p className="text-gray-600">Manage and train your AI models for better property insights</p>
        </div>

        {/* Navigation Tabs */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
  {/* Tabs Header */}
  <div className="flex overflow-x-auto whitespace-nowrap border-b border-gray-200 no-scrollbar">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors shrink-0
            ${isActive
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <Icon size={18} />
          <span>{tab.label}</span>
        </button>
      );
    })}
  </div>
</div>


        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'data' && renderTrainingData()}
        {activeTab === 'uploads' && renderDataManagement()}
        {activeTab === 'model' && renderModelTraining()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default AITraining;