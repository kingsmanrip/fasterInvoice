import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await fetch(`/api/invoices/${id}`);
        if (!response.ok) {
          throw new Error('Invoice not found');
        }
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setInvoice({ ...invoice, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        navigate('/invoices');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add logo or header (simplified)
    doc.setFontSize(24);
    doc.setTextColor(66, 135, 245); // blue
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
    
    // Invoice info section
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // black
    doc.text(`Invoice #: ${invoice.invoice_number}`, 15, 40);
    doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 15, 45);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 15, 50);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 15, 55);
    
    // Company info (you would customize this)
    doc.setFontSize(12);
    doc.text('Your Company Name', pageWidth - 15, 40, { align: 'right' });
    doc.setFontSize(10);
    doc.text('123 Business Street', pageWidth - 15, 45, { align: 'right' });
    doc.text('City, State ZIP', pageWidth - 15, 50, { align: 'right' });
    doc.text('email@example.com', pageWidth - 15, 55, { align: 'right' });
    
    // Client info
    doc.setFontSize(12);
    doc.text('Bill To:', 15, 70);
    doc.setFontSize(10);
    doc.text(invoice.client_name, 15, 75);
    if (invoice.client_address) {
      const addressLines = invoice.client_address.split('\n');
      addressLines.forEach((line, i) => {
        doc.text(line, 15, 80 + (i * 5));
      });
    }
    
    // Line items
    doc.setFontSize(12);
    doc.text('Item Details', 15, 110);
    
    // Table header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Description', 15, 120);
    doc.text('Quantity', 110, 120);
    doc.text('Rate', 140, 120);
    doc.text('Amount', 170, 120);
    doc.setFont(undefined, 'normal');
    
    // Table content
    let y = 130;
    invoice.items.forEach((item) => {
      // Ensure description fits in the allocated space
      const description = item.description.length > 50 
        ? item.description.substring(0, 47) + '...' 
        : item.description;
        
      doc.text(description, 15, y);
      doc.text(item.quantity.toString(), 110, y);
      doc.text(`$${item.rate.toFixed(2)}`, 140, y);
      doc.text(`$${item.amount.toFixed(2)}`, 170, y);
      y += 10;
    });
    
    // Draw line
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(110, y, pageWidth - 15, y);
    y += 10;
    
    // Total
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 140, y);
    doc.text(`$${invoice.total_amount.toFixed(2)}`, 170, y);
    
    // Notes
    if (invoice.notes) {
      y += 20;
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 15, y);
      doc.setFont(undefined, 'normal');
      
      // Handle multi-line notes
      const notes = doc.splitTextToSize(invoice.notes, pageWidth - 30);
      notes.forEach((line, i) => {
        doc.text(line, 15, y + 10 + (i * 5));
      });
    }
    
    // Payment info
    y = Math.max(y + 40, 240);
    doc.text('Payment Instructions', 15, y);
    doc.setFont(undefined, 'normal');
    doc.text('Please make payment within the due date.', 15, y + 5);
    doc.text('Thank you for your business!', 15, y + 10);
    
    // Save PDF
    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <PageHeader 
        title={`Invoice: ${invoice.invoice_number}`} 
      />

      <div className="mt-6 space-y-8">
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

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-col sm:flex-row sm:justify-between w-full z-10">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full sm:w-auto mb-3 sm:mb-0 px-6 py-3 text-base font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Invoice
          </button>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="w-full sm:w-auto px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Invoices
            </button>
            <button
              type="button"
              onClick={generatePDF}
              className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Download PDF
            </button>
          </div>
        </div>
        
        {/* Add padding at the bottom to prevent content from being hidden behind the fixed buttons */}
        <div className="pb-32"></div>
      </div>
    </div>
  );
}

export default InvoiceDetail;