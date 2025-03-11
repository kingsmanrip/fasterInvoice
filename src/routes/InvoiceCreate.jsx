import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

function InvoiceCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialClientId = location.state?.clientId || '';
  const initialProjectId = location.state?.projectId || '';

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Predefined tax rates for the spinner
  const taxRateOptions = [0, 5, 7, 8, 10, 13, 15, 20, 21, 23, 25];

  const today = format(new Date(), 'yyyy-MM-dd');
  const nextMonth = format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd');

  const [invoiceData, setInvoiceData] = useState({
    client_id: initialClientId,
    project_id: initialProjectId,
    issue_date: today,
    due_date: nextMonth,
    status: 'draft',
    notes: '',
    total_amount: 0,
    tax_rate: 0,
    tax_amount: 0,
    subtotal: 0
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clients
        const clientsRes = await fetch('/api/clients');
        const clientsData = await clientsRes.json();
        setClients(clientsData);
        
        // Fetch all projects
        const projectsRes = await fetch('/api/projects');
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        
        // Filter projects if client is selected
        if (initialClientId) {
          setFilteredProjects(projectsData.filter(p => p.client_id === Number(initialClientId)));
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialClientId]);

  // Handle client change
  const handleClientChange = (e) => {
    const clientId = Number(e.target.value);
    setInvoiceData({ ...invoiceData, client_id: clientId, project_id: '' });
    
    // Filter projects for the selected client
    if (clientId) {
      const filtered = projects.filter(project => project.client_id === clientId);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  };

  // Handle project change
  const handleProjectChange = (e) => {
    const projectId = Number(e.target.value);
    const selectedProject = projects.find(p => p.id === projectId);
    
    setInvoiceData({ ...invoiceData, project_id: projectId });
    
    // Auto-fill rates from project if available
    if (selectedProject && selectedProject.hourly_rate) {
      const updatedItems = items.map((item, idx) => 
        idx === 0 && !item.rate ? { ...item, rate: selectedProject.hourly_rate } : item
      );
      setItems(updatedItems);
      calculateTotal(updatedItems, invoiceData.tax_rate);
    }
  };

  // Handle invoice fields change
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
    
    // Recalculate tax if tax_rate changes
    if (name === 'tax_rate') {
      calculateTotal(items, value);
    }
  };

  // Handle tax rate selection
  const handleTaxRateChange = (rate) => {
    setInvoiceData(prev => ({ ...prev, tax_rate: rate }));
    calculateTotal(items, rate);
  };

  // Handle line item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    
    // Convert strings to numbers for numerical fields
    if (field === 'quantity' || field === 'rate') {
      value = value === '' ? '' : Number(value);
    }
    
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value 
    };
    
    // Calculate line amount
    if (field === 'quantity' || field === 'rate') {
      const quantity = updatedItems[index].quantity || 0;
      const rate = updatedItems[index].rate || 0;
      updatedItems[index].amount = quantity * rate;
    }
    
    setItems(updatedItems);
    calculateTotal(updatedItems, invoiceData.tax_rate);
  };

  // Calculate invoice total with tax
  const calculateTotal = (currentItems, taxRate) => {
    const subtotal = currentItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxRateValue = parseFloat(taxRate) || 0;
    const taxAmount = subtotal * (taxRateValue / 100);
    const total = subtotal + taxAmount;
    
    setInvoiceData(prev => ({ 
      ...prev, 
      subtotal: subtotal,
      tax_amount: taxAmount,
      total_amount: total
    }));
  };

  // Add a new line item
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  // Remove a line item
  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
      calculateTotal(updatedItems, invoiceData.tax_rate);
    }
  };

  // Submit the invoice
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!invoiceData.client_id || !invoiceData.project_id) {
      alert('Please select a client and project.');
      return;
    }

    if (items.some(item => !item.description || !item.quantity || !item.rate)) {
      alert('Please fill in all line item details.');
      return;
    }
    
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: invoiceData,
          items: items,
        }),
      });
      
      if (response.ok) {
        const createdInvoice = await response.json();
        navigate(`/invoices/${createdInvoice.id}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20 max-w-lg mx-auto">
      <PageHeader title="Create Invoice" />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Client and Project Selection */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Client & Project</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select the client and project for this invoice.
            </p>
          </div>
          <div className="px-4 py-5 space-y-4">
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                id="client_id"
                name="client_id"
                value={invoiceData.client_id}
                onChange={handleClientChange}
                required
                className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                id="project_id"
                name="project_id"
                value={invoiceData.project_id}
                onChange={handleProjectChange}
                required
                disabled={!invoiceData.client_id}
                className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a project</option>
                {filteredProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Invoice Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set the invoice dates and status.
            </p>
          </div>
          <div className="px-4 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  name="issue_date"
                  id="issue_date"
                  value={invoiceData.issue_date}
                  onChange={handleInvoiceChange}
                  className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  id="due_date"
                  value={invoiceData.due_date}
                  onChange={handleInvoiceChange}
                  className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={invoiceData.status}
                onChange={handleInvoiceChange}
                className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={invoiceData.notes}
                onChange={handleInvoiceChange}
                className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional notes for the client..."
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Line Items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add the items you want to bill for.
            </p>
          </div>
          <div className="px-4 py-5">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-base">
                      Amount: ${item.amount.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={items.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addItem}
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Add Item
              </button>
              
              <div className="pt-4 border-t border-gray-200">
                {/* Tax Rate Spinner */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xs bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between p-2">
                        <button 
                          type="button"
                          onClick={() => {
                            const currentIndex = taxRateOptions.indexOf(parseFloat(invoiceData.tax_rate));
                            const newIndex = Math.max(0, currentIndex - 1);
                            handleTaxRateChange(taxRateOptions[newIndex]);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow text-blue-600 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
                          <span className="text-2xl font-bold text-gray-900">{invoiceData.tax_rate}%</span>
                        </div>
                        
                        <button 
                          type="button"
                          onClick={() => {
                            const currentIndex = taxRateOptions.indexOf(parseFloat(invoiceData.tax_rate));
                            const newIndex = Math.min(taxRateOptions.length - 1, currentIndex + 1);
                            handleTaxRateChange(taxRateOptions[newIndex]);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow text-blue-600 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                    <span className="text-sm font-medium">${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Tax ({invoiceData.tax_rate}%):</span>
                    <span className="text-sm font-medium">${invoiceData.tax_amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">${invoiceData.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex space-x-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="flex-1 px-4 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceCreate;