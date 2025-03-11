import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { getData } from '../utils/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    totalInvoices: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalAmount: 0,
    totalOutstanding: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch clients count
        const clients = await getData('/api/clients');
        
        // Fetch projects count
        const projects = await getData('/api/projects');
        
        // Fetch invoices
        const invoices = await getData('/api/invoices');
        
        // Calculate statistics
        const totalClients = clients.length;
        const totalProjects = projects.length;
        const totalInvoices = invoices.length;
        
        let totalPaid = 0;
        let totalPending = 0;
        let totalOverdue = 0;
        let totalAmount = 0;
        let totalOutstanding = 0;
        
        invoices.forEach(invoice => {
          const amount = parseFloat(invoice.total_amount);
          totalAmount += amount;
          
          if (invoice.status === 'paid') {
            totalPaid++;
          } else if (invoice.status === 'pending') {
            totalPending++;
            totalOutstanding += amount;
          } else if (invoice.status === 'overdue') {
            totalOverdue++;
            totalOutstanding += amount;
          }
        });
        
        setStats({
          totalClients,
          totalProjects,
          totalInvoices,
          totalPaid,
          totalPending,
          totalOverdue,
          totalAmount,
          totalOutstanding
        });
        
        // Sort invoices by due date and get 5 most recent
        const sortedInvoices = [...invoices].sort((a, b) => {
          return new Date(b.due_date) - new Date(a.due_date);
        }).slice(0, 5);
        
        setRecentInvoices(sortedInvoices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Function to check if an invoice is overdue
  const isOverdue = (dueDate) => {
    const now = new Date();
    return new Date(dueDate) < now;
  };
  
  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 pb-16 max-w-lg mx-auto">
      <PageHeader title="Mauricio Paint and DW" />
      
      {/* Financial Summary */}
      <div className="mt-6 card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding Amount</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalOutstanding.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards - 2x2 Grid for Mobile */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="card p-4">
          <h3 className="text-base font-medium text-gray-900">Clients</h3>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.totalClients}</p>
          <Link to="/clients" className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 block">
            View all →
          </Link>
        </div>
        
        <div className="card p-4">
          <h3 className="text-base font-medium text-gray-900">Projects</h3>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.totalProjects}</p>
          <Link to="/projects" className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 block">
            View all →
          </Link>
        </div>
        
        <div className="card p-4">
          <h3 className="text-base font-medium text-gray-900">Invoices</h3>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.totalInvoices}</p>
          <Link to="/invoices" className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 block">
            View all →
          </Link>
        </div>
        
        <div className="card p-4">
          <h3 className="text-base font-medium text-gray-900">Status</h3>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <StatusBadge status="paid" />
                <span className="text-xs ml-1">{stats.totalPaid}</span>
              </div>
              <div className="flex items-center">
                <StatusBadge status="pending" />
                <span className="text-xs ml-1">{stats.totalPending}</span>
              </div>
            </div>
            <div className="flex items-center mt-1">
              <StatusBadge status="overdue" />
              <span className="text-xs ml-1">{stats.totalOverdue}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Invoices - Mobile Optimized */}
      <div className="mt-8 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
          {recentInvoices.length > 0 && (
            <Link to="/invoices" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all →
            </Link>
          )}
        </div>
        
        {recentInvoices.length > 0 ? (
          <div className="mt-4">
            <ul className="space-y-3">
              {recentInvoices.map((invoice) => (
                <li key={invoice.id} className={`rounded-lg shadow ${isOverdue(invoice.due_date) && invoice.status !== 'paid' ? 'bg-red-50' : 'bg-white'}`}>
                  <Link to={`/invoices/${invoice.id}`} className="block p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-base font-medium text-blue-600">
                          {invoice.invoice_number}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 truncate max-w-[150px]">
                          {invoice.client_name}
                        </p>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <p className={`text-sm ${isOverdue(invoice.due_date) && invoice.status !== 'paid' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                        {isOverdue(invoice.due_date) && invoice.status !== 'paid' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ${invoice.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow mt-4">
            <p className="text-gray-500">No invoices yet.</p>
            <div className="mt-4">
              <Link to="/invoices/create" className="btn py-3 px-6 text-base">
                Create Invoice
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;