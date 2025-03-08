import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { getData, putData, deleteData } from '../utils/api';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({
    client_id: '',
    name: '',
    description: '',
    hourly_rate: '',
    status: '',
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectData = await getData(`/api/projects/${id}`);
        if (!projectData) {
          console.error('Failed to fetch project data');
          navigate('/projects');
          return;
        }
        
        setProject(projectData);
        setEditedProject({
          client_id: projectData.client_id,
          name: projectData.name,
          description: projectData.description || '',
          hourly_rate: projectData.hourly_rate,
          status: projectData.status,
        });
        
        // Fetch all clients for dropdown
        const clientsData = await getData('/api/clients');
        setClients(clientsData || []);
        
        // Fetch invoices for this project
        const invoicesData = await getData(`/api/projects/${id}/invoices`);
        setInvoices(invoicesData || []);
      } catch (error) {
        console.error('Error fetching project data:', error);
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({ 
      ...prev, 
      [name]: name === 'client_id' || name === 'hourly_rate' 
        ? value === '' ? '' : Number(value) 
        : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedProject = await putData(`/api/projects/${id}`, editedProject);
      setProject(updatedProject);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated invoices.')) {
      try {
        await deleteData(`/api/projects/${id}`);
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <PageHeader 
        title={isEditing ? "Edit Project" : project.name} 
        actionLabel={isEditing ? null : "Edit"}
        actionPath={isEditing ? null : "#"}
        onClick={() => setIsEditing(true)}
      />

      <div className="mt-6">
        {isEditing ? (
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Project Details</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update the project's information.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="client_id" className="label">Client</label>
                    <select
                      name="client_id"
                      id="client_id"
                      value={editedProject.client_id}
                      onChange={handleInputChange}
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
                    <label htmlFor="name" className="label">Project Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={editedProject.name}
                      onChange={handleInputChange}
                      required
                      className="input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="hourly_rate" className="label">Hourly Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="hourly_rate"
                      id="hourly_rate"
                      value={editedProject.hourly_rate}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="status" className="label">Status</label>
                    <select
                      name="status"
                      id="status"
                      value={editedProject.status}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="description" className="label">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={editedProject.description}
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
                    Delete Project
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
                      onClick={handleSubmit}
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
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Client: {project.client_name}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Project name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project.name}</dd>
                </div>
                {project.hourly_rate && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Hourly rate</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${project.hourly_rate}/hr</dd>
                  </div>
                )}
                {project.description && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project.description}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
          <Link to="/invoices/create" className="btn" state={{ projectId: id, clientId: project.client_id }}>
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
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {invoice.invoice_number}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <StatusBadge status={invoice.status} />
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
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
            <p className="text-gray-500">No invoices yet for this project.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;