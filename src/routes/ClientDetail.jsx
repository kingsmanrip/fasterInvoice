import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Fetch client details
        const clientRes = await fetch(`/api/clients/${id}`);
        if (!clientRes.ok) {
          throw new Error('Client not found');
        }
        const clientData = await clientRes.json();
        setClient(clientData);
        setEditedClient(clientData);
        
        // Fetch client's projects
        const projectsRes = await fetch(`/api/clients/${id}/projects`);
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        
        // Fetch all invoices (then filter by client)
        const invoicesRes = await fetch('/api/invoices');
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.filter(invoice => invoice.client_id === Number(id)));
        
      } catch (error) {
        console.error('Error fetching client data:', error);
        navigate('/clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedClient),
      });
      
      if (response.ok) {
        const updatedClient = await response.json();
        setClient(updatedClient);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this client? This will also delete all associated projects and invoices.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        navigate('/clients');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <PageHeader 
        title={isEditing ? "Edit Client" : client.name} 
        actionLabel={isEditing ? null : "Edit"}
        actionPath={isEditing ? null : "#"}
        onClick={() => setIsEditing(true)}
      />

      <div className="mt-6">
        {isEditing ? (
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Client Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update the client's details.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="name" className="label">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={editedClient.name}
                      onChange={handleInputChange}
                      required
                      className="input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={editedClient.email || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="phone" className="label">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={editedClient.phone || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="address" className="label">Address</label>
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      value={editedClient.address || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-between">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete Client
                  </button>
                  <div className="space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="btn"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Client Information</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.name}</dd>
                </div>
                {client.email && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.email}</dd>
                  </div>
                )}
                {client.phone && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.phone}</dd>
                  </div>
                )}
                {client.address && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.address}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Projects</h2>
          <Link to="/projects" className="btn" state={{ clientId: id }}>
            Add Project
          </Link>
        </div>
        
        {projects.length > 0 ? (
          <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link to={`/projects/${project.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {project.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <StatusBadge status={project.status} />
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {project.description ? project.description.substring(0, 100) + (project.description.length > 100 ? '...' : '') : 'No description'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          {project.hourly_rate && (
                            <p>
                              <span className="font-medium text-gray-900">${project.hourly_rate}/hr</span>
                            </p>
                          )}
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
            <p className="text-gray-500">No projects yet for this client.</p>
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
          <Link to="/invoices/create" className="btn" state={{ clientId: id }}>
            Create Invoice
          </Link>
        </div>
        
        {invoices.length > 0 ? (
          <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
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
                              ({invoice.project_name})
                            </p>
                          </div>
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
            <p className="text-gray-500">No invoices yet for this client.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetail;