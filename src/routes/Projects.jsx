import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

function Projects() {
  const location = useLocation();
  const initialClientId = location.state?.clientId || '';
  
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!initialClientId);
  const [newProject, setNewProject] = useState({
    client_id: initialClientId,
    name: '',
    description: '',
    hourly_rate: '',
    status: 'active',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all projects
        const projectsRes = await fetch('/api/projects');
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        
        // Fetch all clients (for dropdown)
        const clientsRes = await fetch('/api/clients');
        const clientsData = await clientsRes.json();
        setClients(clientsData);
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
    setNewProject((prev) => ({ 
      ...prev, 
      [name]: name === 'client_id' || name === 'hourly_rate' 
        ? value === '' ? '' : Number(value) 
        : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });
      
      if (response.ok) {
        const project = await response.json();
        setProjects((prev) => [...prev, project]);
        setNewProject({
          client_id: '',
          name: '',
          description: '',
          hourly_rate: '',
          status: 'active',
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        actionLabel={showForm ? null : "Add Project"}
        actionPath={showForm ? null : "#"}
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">New Project</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a new project to track work for a client.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="client_id" className="label">Client</label>
                    <select
                      name="client_id"
                      id="client_id"
                      value={newProject.client_id}
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
                      value={newProject.name}
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
                      value={newProject.hourly_rate}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="status" className="label">Status</label>
                    <select
                      name="status"
                      id="status"
                      value={newProject.status}
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
                      value={newProject.description}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {!showForm && projects.length === 0 ? (
        <EmptyState
          title="No projects"
          description="Get started by creating a new project."
          actionLabel="Add Project"
          actionPath="#"
          onClick={() => setShowForm(true)}
        />
      ) : (
        !showForm && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
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
                            Client: {project.client_name}
                          </p>
                          {project.description && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {project.description.substring(0, 60)}
                              {project.description.length > 60 ? '...' : ''}
                            </p>
                          )}
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
        )
      )}
    </div>
  );
}

export default Projects;