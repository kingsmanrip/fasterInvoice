import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { getData, postData, putData, deleteData } from '../utils/api';

function Invoices() {
  const initialProjectId = '';
  
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!initialProjectId);
  const [newInvoice, setNewInvoice] = useState({
    project_id: initialProjectId,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    total_amount: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all invoices
        const invoicesData = await getData('/api/invoices');
        setInvoices(invoicesData);
        
        // Fetch all projects (for dropdown)
        const projectsData = await getData('/api/projects');
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice((prev) => ({ 
      ...prev, 
      [name]: name === 'project_id' || name === 'total_amount' 
        ? value === '' ? '' : Number(value) 
        : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get client_id from the selected project
      const selectedProject = projects.find(p => p.id === newInvoice.project_id);
      if (!selectedProject) {
        console.error('Selected project not found');
        return;
      }
      
      const invoiceData = {
        ...newInvoice,
        client_id: selectedProject.client_id,
      };
      
      // Create a default item for the invoice
      const items = [
        {
          description: `Services for ${selectedProject.name}`,
          quantity: 1,
          rate: newInvoice.total_amount,
          amount: newInvoice.total_amount
        }
      ];
      
      // postData already returns the JSON data
      const invoice = await postData('/api/invoices', { 
        invoice: invoiceData, 
        items: items 
      });
      
      setInvoices((prev) => [invoice, ...prev]);
      setNewInvoice({
        project_id: '',
        issue_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        total_amount: '',
        status: 'pending',
        notes: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const updatedInvoice = await putData(`/api/invoices/${invoiceId}/status`, { status: newStatus });
      
      setInvoices(invoices.map(invoice => 
        invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
      ));
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 pb-16 max-w-lg mx-auto">
      <PageHeader
        title="Invoices"
        actionLabel={showForm ? null : "Add Invoice"}
        actionPath={showForm ? null : "#"}
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <div className="mt-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">New Invoice</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a new invoice for a project.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                name="project_id"
                id="project_id"
                value={newInvoice.project_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.client_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  name="issue_date"
                  id="issue_date"
                  value={newInvoice.issue_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  id="due_date"
                  value={newInvoice.due_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="total_amount"
                id="total_amount"
                value={newInvoice.total_amount}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                id="status"
                value={newInvoice.status}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                id="notes"
                rows={3}
                value={newInvoice.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && invoices.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="Get started by creating a new invoice."
          actionLabel="Add Invoice"
          actionPath="#"
          onClick={() => setShowForm(true)}
        />
      ) : (
        !showForm && (
          <div className="mt-6 space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span 
                      onClick={() => window.location.href = `/invoices/${invoice.id}`} 
                      className="text-base font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      {invoice.invoice_number || `Invoice #${invoice.id}`}
                    </span>
                    <StatusBadge status={invoice.status} />
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                    <span className="mx-1">•</span>
                    Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    Project: {invoice.project_name}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-semibold">${invoice.total_amount.toFixed(2)}</span>
                    
                    <div className="flex space-x-2">
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => handleStatusChange(invoice.id, 'paid')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Mark Paid
                        </button>
                      )}
                      {invoice.status === 'pending' && new Date(invoice.due_date) < new Date() && (
                        <button
                          onClick={() => handleStatusChange(invoice.id, 'overdue')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Mark Overdue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default Invoices;