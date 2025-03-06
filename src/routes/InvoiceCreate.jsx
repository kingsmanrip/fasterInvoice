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
      calculateTotal(updatedItems);
    }
  };

  // Handle invoice fields change
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
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
    calculateTotal(updatedItems);
  };

  // Calculate invoice total
  const calculateTotal = (currentItems) => {
    const total = currentItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    setInvoiceData(prev => ({ ...prev, total_amount: total }));
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
      calculateTotal(updatedItems);
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
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Create Invoice" />

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {/* Client and Project Selection */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Client & Project</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select the client and project for this invoice.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="client_id" className="label">Client</label>
                  <select
                    id="client_id"
                    name="client_id"
                    value={invoiceData.client_id}
                    onChange={handleClientChange}
                    required
                    className="input"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="project_id" className="label">Project</label>
                  <select
                    id="project_id"
                    name="project_id"
                    value={invoiceData.project_id}
                    onChange={handleProjectChange}
                    required
                    disabled={!invoiceData.client_id}
                    className="input"
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
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Invoice Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set the invoice dates and status.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="issue_date" className="label">Issue Date</label>
                  <input
                    type="date"
                    name="issue_date"
                    id="issue_date"
                    value={invoiceData.issue_date}
                    onChange={handleInvoiceChange}
                    className="input"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="due_date" className="label">Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    id="due_date"
                    value={invoiceData.due_date}
                    onChange={handleInvoiceChange}
                    className="input"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="status" className="label">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={invoiceData.status}
                    onChange={handleInvoiceChange}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="label">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={invoiceData.notes}
                    onChange={handleInvoiceChange}
                    className="input"
                    placeholder="Enter any additional notes for the client..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Line Items</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add the items you want to bill for.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Rate ($)</div>
                  <div className="col-span-2">Amount</div>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="input"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="input"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        className="input"
                        required
                      />
                    </div>
                    <div className="col-span-1 font-medium">
                      ${item.amount.toFixed(2)}
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900"
                        disabled={items.length === 1}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Add Item
                </button>
                
                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Total:</p>
                    <p className="text-2xl font-bold text-gray-900">${invoiceData.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 btn"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceCreate;