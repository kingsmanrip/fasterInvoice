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
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Client: {invoice.client_name} | Project: {invoice.project_name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <StatusBadge status={invoice.status} />
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{invoice.invoice_number}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(invoice.due_date).toLocaleDateString()}
              </dd>
            </div>
            {invoice.po_number && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">P.O. Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {invoice.po_number}
                </dd>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Terms</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {invoice.terms}
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
              <dd className="mt-1 text-sm font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                ${invoice.total_amount.toFixed(2)}
              </dd>
            </div>
            {invoice.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {invoice.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Line Items</h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${item.rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    ${item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              
              {/* Subtotal Row */}
              {(invoice.tax_rate > 0 || invoice.tax_amount > 0) && (
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ${invoice.subtotal?.toFixed(2) || (invoice.total_amount - invoice.tax_amount).toFixed(2)}
                  </td>
                </tr>
              )}
              
              {/* Tax Row */}
              {(invoice.tax_rate > 0 || invoice.tax_amount > 0) && (
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Tax ({invoice.tax_rate}%):
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ${invoice.tax_amount?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              )}
              
              {/* Total Row */}
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                  ${invoice.total_amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetailWrapper;
