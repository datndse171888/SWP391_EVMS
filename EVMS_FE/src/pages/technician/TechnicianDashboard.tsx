import React, { useState } from 'react';

// CSS to hide scrollbar but keep scrolling functionality
const hideScrollbarStyles = `
  /* Chrome, Safari, Edge */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  /* Firefox */
  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`;

const TechnicianDashboard: React.FC = () => {
  // Mock data
  const [stats] = useState({
    totalOrders: 2500,
    newCustomers: 110,
    returnProducts: 72,
    totalRevenue: 8220.64
  });

  // Chart data for monthly performance
  const monthlyData = [
    { month: 'May', sales: 15, revenue: 1.2 },
    { month: 'Jun', sales: 22, revenue: 1.8 },
    { month: 'Jul', sales: 18, revenue: 1.5 },
    { month: 'Aug', sales: 28, revenue: 2.3 },
    { month: 'Sep', sales: 32, revenue: 2.7 },
    { month: 'Oct', sales: 25, revenue: 2.1 },
    { month: 'Nov', sales: 35, revenue: 3.0 },
    { month: 'Dec', sales: 40, revenue: 3.4 }
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.sales));

  // Inject CSS for hiding scrollbar
  if (typeof document !== 'undefined' && !document.getElementById('hide-scrollbar-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'hide-scrollbar-styles';
    styleSheet.textContent = hideScrollbarStyles;
    document.head.appendChild(styleSheet);
  }

  return (
    <div className="h-full bg-gray-50 p- hide-scrollbar" style={{ overflow: 'auto' }}>
      <div className="flex flex-col space-y-4">

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          {/* Total Orders - Highlighted */}
          <div className="text-white rounded-lg shadow-sm p-4" style={{ backgroundColor: '#014091' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8dcdfa' }}>Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats.totalOrders.toLocaleString()}</p>
                <p className="text-xs mt-1" style={{ color: '#8dcdfa' }}>+4.9%</p>
                <p className="text-xs mt-1" style={{ color: '#8dcdfa' }}>Last month: 2,345</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* New Customers */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#5f6777' }}>New Customers</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#014091' }}>{stats.newCustomers}</p>
                <p className="text-xs mt-1" style={{ color: '#f6ae2d' }}>↑7.5%</p>
                <p className="text-xs mt-1" style={{ color: '#5f6777' }}>Last month: 89</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8dcdfa' }}>
                <svg className="w-5 h-5" style={{ color: '#014091' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Return Products */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#5f6777' }}>Return Products</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#014091' }}>{stats.returnProducts}</p>
                <p className="text-xs mt-1" style={{ color: '#f6ae2d' }}>↓6.0%</p>
                <p className="text-xs mt-1" style={{ color: '#5f6777' }}>Last month: 60</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8dcdfa' }}>
                <svg className="w-5 h-5" style={{ color: '#014091' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#5f6777' }}>Total Revenue</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#014091' }}>${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs mt-1" style={{ color: '#f6ae2d' }}>↑8.2%</p>
                <p className="text-xs mt-1" style={{ color: '#5f6777' }}>Last month: $620.00</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8dcdfa' }}>
                <svg className="w-5 h-5" style={{ color: '#014091' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: '240px' }}>
          {/* Performance Overview */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold" style={{ color: '#014091' }}>Performance Overview</h2>
              <select className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>This Week</option>
                <option>This Month</option>
                <option>This Quarter</option>
              </select>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-1" style={{ height: '150px' }}>
              {monthlyData.map((data, index) => {
                const height = (data.sales / maxValue) * 100;
                const isHighlighted = data.month === 'Aug';
                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end group">
                    <div
                      className={`w-full rounded-t transition-all cursor-pointer relative ${
                        isHighlighted 
                          ? 'bg-gradient-to-t from-blue-600 to-blue-500' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      style={{ height: `${height}%` }}
                    >
                      {isHighlighted && (
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{data.month} 2024</div>
                          <div className="text-xs text-gray-600 mt-1">
                            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            Total Orders {data.sales * 10}
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Total Revenue ${data.revenue}k
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Work Progress */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold" style={{ color: '#014091' }}>Work Progress</h2>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            {/* Progress Gauge */}
            <div className="flex-1 flex flex-col items-center justify-center" style={{ height: '120px' }}>
              <div className="relative w-16 h-16">
                {/* Background circle */}
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.708)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: '#014091' }}>70.8%</span>
                </div>
              </div>
              <span className="text-xs mt-2" style={{ color: '#5f6777' }}>Work Progress</span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-center">
                <div className="text-base font-bold" style={{ color: '#014091' }}>2,343</div>
                <div className="text-xs" style={{ color: '#5f6777' }}>Completed Tasks</div>
                <div className="text-xs px-1 py-0.5 rounded-full inline-block mt-1" style={{ color: '#f6ae2d', backgroundColor: '#fad38e' }}>4.5%</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold" style={{ color: '#014091' }}>$30.9k</div>
                <div className="text-xs" style={{ color: '#5f6777' }}>Total Revenue</div>
                <div className="text-xs px-1 py-0.5 rounded-full inline-block mt-1" style={{ color: '#5f6777', backgroundColor: '#8dcdfa' }}>4.5%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col flex-shrink-0" style={{ height: '240px' }}>
          <div className="p-2 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: '#014091' }}>Recent Orders</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="w-3 h-3 text-gray-400 absolute left-2 top-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sort</option>
                  <option>Date</option>
                  <option>Status</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="ml-2">
                        <div className="text-xs font-medium" style={{ color: '#014091' }}>Service Order #001</div>
                        <div className="text-xs" style={{ color: '#5f6777' }}>Oil Change</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs" style={{ color: '#014091' }}>Dec 15</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs" style={{ color: '#014091' }}>Nguyễn Văn A</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#fad38e', color: '#f6ae2d' }}>Pending</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium" style={{ color: '#014091' }}>$150.00</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-2">
                        <div className="text-xs font-medium" style={{ color: '#014091' }}>Service Order #002</div>
                        <div className="text-xs" style={{ color: '#5f6777' }}>Brake Repair</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs" style={{ color: '#014091' }}>Dec 14</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs" style={{ color: '#014091' }}>Trần Thị B</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>In Progress</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium" style={{ color: '#014091' }}>$320.00</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-2">
                        <div className="text-xs font-medium" style={{ color: '#014091' }}>Service Order #003</div>
                        <div className="text-xs" style={{ color: '#5f6777' }}>Engine Check</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs" style={{ color: '#014091' }}>Dec 13</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs" style={{ color: '#014091' }}>Lê Văn C</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>Completed</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium" style={{ color: '#014091' }}>$85.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;