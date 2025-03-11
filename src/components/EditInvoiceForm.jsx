import React from 'react';

const EditInvoiceForm = ({ 
  editedInvoice, 
  editedItems, 
  clients, 
  projects, 
  handleInvoiceChange, 
  handleItemChange, 
  updateTotals, 
  addItem, 
  removeItem 
}) => {
  return (
    <>
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Invoice</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5">
          <div className="space-y-6">
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                id="client_id"
                name="client_id"
                value={editedInvoice.client_id}
                onChange={handleInvoiceChange}
                className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                id="project_id"
                name="project_id"
                value={editedInvoice.project_id}
                onChange={handleInvoiceChange}
                className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                {projects
                  .filter(project => project.client_id === parseInt(editedInvoice.client_id))
                  .map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))
                }
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  name="issue_date"
                  id="issue_date"
                  value={editedInvoice.issue_date}
                  onChange={handleInvoiceChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3"
                />
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  id="due_date"
                  value={editedInvoice.due_date}
                  onChange={handleInvoiceChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="po_number" className="block text-sm font-medium text-gray-700 mb-1">P.O. Number</label>
                <input
                  type="text"
                  name="po_number"
                  id="po_number"
                  value={editedInvoice.po_number || ''}
                  onChange={handleInvoiceChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3"
                />
              </div>

              <div>
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
                <input
                  type="text"
                  name="terms"
                  id="terms"
                  value={editedInvoice.terms || 'Net 30'}
                  onChange={handleInvoiceChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  value={editedInvoice.status}
                  onChange={handleInvoiceChange}
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <select
                  name="tax_rate"
                  id="tax_rate"
                  value={editedInvoice.tax_rate || 0}
                  onChange={(e) => {
                    // Create a new event with the parsed float value
                    const newEvent = {
                      ...e,
                      target: {
                        ...e.target,
                        name: e.target.name,
                        value: parseFloat(e.target.value)
                      }
                    };
                    handleInvoiceChange(newEvent);
                    updateTotals();
                  }}
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  {[...Array(41)].map((_, i) => (
                    <option key={i} value={i * 0.5}>{i * 0.5}%</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={editedInvoice.notes || ''}
                onChange={handleInvoiceChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-base border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Edit */}
      <div className="bg-white shadow overflow-hidden rounded-lg mt-6">
        <div className="px-4 py-5 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Line Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Item
          </button>
        </div>
        
        <div className="border-t border-gray-200">
          {/* Mobile-friendly line items */}
          <div className="divide-y divide-gray-200">
            {editedItems.map((item, index) => (
              <div key={index} className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-900">
                    Amount: ${item.amount.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Totals */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal:</span>
              <span>${editedInvoice.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            
            {(editedInvoice.tax_rate > 0 || editedInvoice.tax_amount > 0) && (
              <div className="flex justify-between text-sm font-medium">
                <span>Tax ({editedInvoice.tax_rate}%):</span>
                <span>${editedInvoice.tax_amount?.toFixed(2) || '0.00'}</span>
              </div>
            )}
            
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>${editedInvoice.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditInvoiceForm;
