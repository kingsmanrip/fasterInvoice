import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EditInvoiceForm from '../components/EditInvoiceForm';
import InvoiceDetailWrapper from '../components/InvoiceDetailWrapper';
import { getData, putData, deleteData } from '../utils/api';

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState({ items: [] });
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState({});
  const [editedItems, setEditedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceData, clientsData, projectsData] = await Promise.all([
          getData(`/api/invoices/${id}`),
          getData('/api/clients'),
          getData('/api/projects')
        ]);
        
        setInvoice(invoiceData);
        setClients(clientsData);
        setProjects(projectsData);
        
        // Initialize edited invoice with current invoice data
        setEditedInvoice({
          ...invoiceData,
          client_id: invoiceData.client_id.toString(),
          project_id: invoiceData.project_id.toString(),
          tax_rate: invoiceData.tax_rate || 0,
          tax_amount: invoiceData.tax_amount || 0,
          subtotal: invoiceData.subtotal || invoiceData.total_amount - (invoiceData.tax_amount || 0),
          po_number: invoiceData.po_number || '',
          terms: invoiceData.terms || 'Net 30'
        });
        
        // Initialize edited items with current items
        setEditedItems(invoiceData.items.map(item => ({
          ...item,
          id: item.id || null
        })));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedInvoice = { ...invoice, status: newStatus };
      await putData(`/api/invoices/${id}`, updatedInvoice);
      setInvoice(updatedInvoice);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setEditedInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...editedItems];
    newItems[index][field] = value;
    
    // Update amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setEditedItems(newItems);
    updateTotals(newItems);
  };

  const updateTotals = (items = editedItems) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxRate = parseFloat(editedInvoice.tax_rate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    
    setEditedInvoice(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }));
  };

  const addItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setEditedItems([...editedItems, newItem]);
  };

  const removeItem = (index) => {
    const newItems = editedItems.filter((_, i) => i !== index);
    setEditedItems(newItems);
    updateTotals(newItems);
  };

  const handleSaveEdit = async () => {
    try {
      // Prepare data for API
      const invoiceData = {
        ...editedInvoice,
        items: editedItems,
        client_id: parseInt(editedInvoice.client_id),
        project_id: parseInt(editedInvoice.project_id)
      };
      
      // Send update to server
      await putData(`/api/invoices/${id}`, invoiceData);
      
      // Update local state
      setInvoice(invoiceData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original invoice data
    setEditedInvoice({
      ...invoice,
      client_id: invoice.client_id.toString(),
      project_id: invoice.project_id.toString()
    });
    setEditedItems(invoice.items.map(item => ({ ...item })));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteData(`/api/invoices/${id}`);
        navigate('/invoices');
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    
    // Set up document
    doc.setFontSize(20);
    doc.text('INVOICE', margin, y);
    
    // Invoice number and dates
    y += 10;
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoice.invoice_number}`, margin, y);
    y += 6;
    doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, margin, y);
    y += 6;
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, margin, y);
    
    // Add P.O. Number if it exists
    if (invoice.po_number) {
      y += 6;
      doc.text(`P.O. Number: ${invoice.po_number}`, margin, y);
    }
    
    // Add Terms if it exists
    if (invoice.terms) {
      y += 6;
      doc.text(`Terms: ${invoice.terms}`, margin, y);
    }
    
    // Client and project info
    y += 10;
    doc.setFontSize(12);
    doc.text('Client:', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(invoice.client_name, margin, y);
    y += 10;
    doc.setFontSize(12);
    doc.text('Project:', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(invoice.project_name, margin, y);
    
    // Line items
    y += 15;
    doc.setFontSize(12);
    doc.text('Line Items:', margin, y);
    y += 8;
    
    // Table headers
    doc.setFontSize(10);
    doc.text('Description', margin, y);
    doc.text('Qty', 120, y, { align: 'right' });
    doc.text('Rate', 150, y, { align: 'right' });
    doc.text('Amount', 180, y, { align: 'right' });
    y += 2;
    doc.line(margin, y, 190, y);
    y += 6;
    
    // Table rows
    invoice.items.forEach(item => {
      doc.text(item.description, margin, y);
      doc.text(item.quantity.toString(), 120, y, { align: 'right' });
      doc.text(`$${item.rate.toFixed(2)}`, 150, y, { align: 'right' });
      doc.text(`$${item.amount.toFixed(2)}`, 180, y, { align: 'right' });
      y += 6;
    });
    
    // Totals
    y += 4;
    doc.line(margin, y, 190, y);
    y += 6;
    
    // Show subtotal if tax is present
    if (invoice.tax_rate > 0 || invoice.tax_amount > 0) {
      const subtotal = invoice.subtotal || (invoice.total_amount - invoice.tax_amount);
      doc.text('Subtotal:', 150, y);
      doc.text(`$${subtotal.toFixed(2)}`, 180, y, { align: 'right' });
      y += 6;
      
      doc.text(`Tax (${invoice.tax_rate}%):`, 150, y);
      doc.text(`$${invoice.tax_amount.toFixed(2)}`, 180, y, { align: 'right' });
      y += 6;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 150, y);
    doc.text(`$${invoice.total_amount.toFixed(2)}`, 180, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    
    // Notes
    if (invoice.notes) {
      y += 15;
      doc.setFontSize(12);
      doc.text('Notes:', margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(invoice.notes, margin, y);
    }
    
    // Save the PDF
    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <PageHeader
          title={`Invoice #${invoice.id}`}
          subtitle={`For ${invoice.client_name} - ${invoice.project_name}`}
        />
        
        <div className="flex space-x-4">
          {/* Red text indicator removed */}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Link
            to="/invoices"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Invoices
          </Link>
          
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Invoice Now
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download PDF
              </button>
            </>
          )}
        </div>
        
        {!isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Invoice
          </button>
        )}
      </div>

      <div className="mt-6 space-y-8">
        <InvoiceDetailWrapper
          invoice={invoice}
          isEditing={isEditing}
          editedInvoice={editedInvoice}
          editedItems={editedItems}
          clients={clients}
          projects={projects}
          handleInvoiceChange={handleInvoiceChange}
          handleItemChange={handleItemChange}
          updateTotals={updateTotals}
          addItem={addItem}
          removeItem={removeItem}
          handleStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}

export default InvoiceDetail;