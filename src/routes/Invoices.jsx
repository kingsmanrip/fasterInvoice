import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Update the invoice in the state
        setInvoices(invoices.map(invoice => 
          invoice.id === id ? { ...invoice, status: newStatus } : invoice
        ));
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="Invoices" 
        actionLabel="Create Invoice"
        actionPath="/invoices/create"
      />

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="Get started by creating a new invoice."
          actionLabel="Create Invoice"
          actionPath="/invoices/create"
        />
      ) : (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <Link to={`/invoices/${invoice.id}`} className="text-sm font-medium text-blue-600 truncate hover:underline">
                          {invoice.invoice_number}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">
                          Client: {invoice.client_name} | Project: {invoice.project_name}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center">
                        <StatusBadge status={invoice.status} />
                        <div className="ml-4">
                          <select
                            value={invoice.status}
                            onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                            className="text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Issue Date: {new Date(invoice.issue_date).toLocaleDateString()}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Due Date: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          <span className="font-medium text-gray-900">${invoice.total_amount.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Invoices;