import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import EditInvoiceForm from './EditInvoiceForm';

const InvoiceDetailWrapper = ({
  invoice,
  isEditing,
  editedInvoice,
  editedItems,
  clients,
  projects,
  handleInvoiceChange,
  handleItemChange,
  updateTotals,
  addItem,
  removeItem,
  handleStatusChange
}) => {
  if (isEditing) {
    return (
      <EditInvoiceForm
        editedInvoice={editedInvoice}
        editedItems={editedItems}
        clients={clients}
        projects={projects}
        handleInvoiceChange={handleInvoiceChange}
        handleItemChange={handleItemChange}
        updateTotals={updateTotals}
        addItem={addItem}
        removeItem={removeItem}
      />
    );
  }

  return (
    <>
      {/* Invoice Header */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 flex flex-col">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Client: {invoice.client_name} | Project: {invoice.project_name}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <StatusBadge status={invoice.status} />
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-4 grid grid-cols-2 gap-4">
              <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
              <dd className="text-sm text-gray-900">{invoice.invoice_number}</dd>
            </div>
            <div className="bg-white px-4 py-4 grid grid-cols-2 gap-4">
              <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
              <dd className="text-sm text-gray-900">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-4 grid grid-cols-2 gap-4">
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="text-sm text-gray-900">
                {new Date(invoice.due_date).toLocaleDateString()}
              </dd>
            </div>
            {invoice.po_number && (
              <div className="bg-white px-4 py-4 grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">P.O. Number</dt>
                <dd className="text-sm text-gray-900">
                  {invoice.po_number}
                </dd>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-gray-50 px-4 py-4 grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">Terms</dt>
                <dd className="text-sm text-gray-900">
                  {invoice.terms}
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-4 grid grid-cols-2 gap-4">
              <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
              <dd className="text-sm font-bold text-gray-900">
                ${invoice.total_amount.toFixed(2)}
              </dd>
            </div>
            {invoice.notes && (
              <div className="bg-gray-50 px-4 py-4 grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="text-sm text-gray-900">
                  {invoice.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Line Items</h3>
        </div>
        <div className="border-t border-gray-200 overflow-x-auto">
          <div className="px-4 py-3 bg-gray-50 grid grid-cols-4 gap-2 font-medium text-xs text-gray-500 uppercase">
            <div className="col-span-2">Description</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Amount</div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {invoice.items.map((item, index) => (
              <div key={index} className="px-4 py-3 grid grid-cols-4 gap-2 items-center">
                <div className="col-span-2 text-sm text-gray-900 break-words">
                  {item.description}
                  <div className="text-xs text-gray-500 mt-1">
                    ${item.rate.toFixed(2)} each
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  {item.quantity}
                </div>
                <div className="text-sm font-medium text-gray-900 text-right">
                  ${item.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Totals */}
          <div className="border-t border-gray-200 px-4 py-4 space-y-2">
            {/* Subtotal Row */}
            {(invoice.tax_rate > 0 || invoice.tax_amount > 0) && (
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  ${invoice.subtotal?.toFixed(2) || (invoice.total_amount - invoice.tax_amount).toFixed(2)}
                </span>
              </div>
            )}
            
            {/* Tax Row */}
            {(invoice.tax_rate > 0 || invoice.tax_amount > 0) && (
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">Tax ({invoice.tax_rate}%):</span>
                <span className="font-medium text-gray-900">
                  ${invoice.tax_amount?.toFixed(2) || '0.00'}
                </span>
              </div>
            )}
            
            {/* Total Row */}
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-gray-900">
                ${invoice.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetailWrapper;
