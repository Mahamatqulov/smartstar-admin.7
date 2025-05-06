"use client"

import { ArrowUp, ArrowDown, Download, Filter } from "lucide-react"

export default function FundingContent() {
  const transactions = [
    {
      id: "TRX-78945",
      project: "SPELL BOUND vintage witchcraft",
      backer: "John Smith",
      amount: "$120.00",
      date: "2023-04-05 14:32",
      status: "Completed",
    },
    {
      id: "TRX-78946",
      project: "Tomb of the Sun King",
      backer: "Sarah Johnson",
      amount: "$85.00",
      date: "2023-04-05 13:45",
      status: "Completed",
    },
    {
      id: "TRX-78947",
      project: "The Arrow and the Ivy",
      backer: "Michael Chen",
      amount: "$50.00",
      date: "2023-04-05 12:18",
      status: "Completed",
    },
    {
      id: "TRX-78948",
      project: "ALIEN RPG - Evolved Edition",
      backer: "Emily Rodriguez",
      amount: "$150.00",
      date: "2023-04-05 11:32",
      status: "Processing",
    },
    {
      id: "TRX-78949",
      project: "LUDOS: The ancient games collection",
      backer: "David Kim",
      amount: "$75.00",
      date: "2023-04-05 10:45",
      status: "Failed",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Funding Overview</h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">All Categories</option>
              <option value="games">Games</option>
              <option value="technology">Technology</option>
              <option value="design">Design</option>
              <option value="film">Film</option>
              <option value="music">Music</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Funding (This Month)</div>
          <div className="text-2xl font-bold">$1,256,890</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            +12.5% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Average Pledge</div>
          <div className="text-2xl font-bold">$78.45</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            +3.2% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Successful Projects</div>
          <div className="text-2xl font-bold">342</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            +8.7% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">Failed Projects</div>
          <div className="text-2xl font-bold">87</div>
          <div className="text-sm text-red-500 flex items-center">
            <ArrowDown className="h-3 w-3 mr-1" />
            -2.3% from last month
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Recent Transactions</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.project}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.backer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
