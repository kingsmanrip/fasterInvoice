import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    totalInvoices: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch clients count
        const clientsRes = await fetch('/api/clients');
        const clients = await clientsRes.json();
        
        // Fetch projects count
        const projectsRes = await fetch('/api/projects');
        const projects = await projectsRes.json();
        
        // Fetch invoices
        const invoicesRes = await fetch('/api/invoices');
        const invoices = await invoicesRes.json();
        
        setStats({
          totalClients: clients.length,
          totalProjects: projects.length,
          totalInvoices: invoices.length,
        });
        
        // Get 5 most recent invoices
        setRecentInvoices(invoices.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Dashboard" />
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Stats */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Clients</h3>
          <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.totalClients}</p>
          <div className="mt-4">
            <Link to="/clients" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all clients →
            </Link>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Projects</h3>
          <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.totalProjects}</p>
          <div className="mt-4">
            <Link to="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all projects →
            </Link>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
          <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.totalInvoices}</p>
          <div className="mt-4">
            <Link to="/invoices" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all invoices →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Invoices */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
        
        {recentInvoices.length > 0 ? (
          <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {recentInvoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link to={`/invoices/${invoice.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex">
                            <p className="truncate text-sm font-medium text-blue-600">
                              {invoice.invoice_number}
                            </p>
                            <p className="ml-1 truncate text-sm text-gray-500">
                              ({invoice.client_name})
                            </p>
                          </div>
                          <p className="mt-1 truncate text-sm text-gray-500">
                            {invoice.project_name}
                          </p>
                        </div>
                        <div className="ml-2 flex flex-shrink-0">
                          <StatusBadge status={invoice.status} />
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            <span className="font-medium text-gray-900">${invoice.total_amount.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
            <p className="text-gray-500">No invoices yet.</p>
            <div className="mt-4">
              <Link to="/invoices/create" className="btn">
                Create Invoice
              </Link>
            </div>
          </div>
        )}
        
        {recentInvoices.length > 0 && (
          <div className="mt-4 text-right">
            <Link to="/invoices/create" className="btn">
              Create Invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;