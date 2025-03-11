import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { getData, postData, deleteData } from '../utils/api';

function Projects() {
  const initialClientId = '';

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
        const projectsData = await getData('/api/projects');
        setProjects(projectsData);
        
        // Fetch all clients (for dropdown)
        const clientsData = await getData('/api/clients');
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
      // postData already returns the JSON data
      const project = await postData('/api/projects', newProject);
      setProjects((prev) => [...prev, project]);
      setNewProject({
        client_id: '',
        name: '',
        description: '',
        hourly_rate: '',
        status: 'active',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
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
      <PageHeader
        title="Projects"
        actionLabel={showForm ? null : "Add Project"}
        actionPath={showForm ? null : "#"}
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">New Project</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a new project to track work for a client.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                name="client_id"
                id="client_id"
                value={newProject.client_id}
                onChange={handleInputChange}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={newProject.name}
                onChange={handleInputChange}
                required
                className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="hourly_rate"
                id="hourly_rate"
                value={newProject.hourly_rate}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                id="status"
                value={newProject.status}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={newProject.description}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
          
          <div className="px-4 py-3 bg-gray-50 flex space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save
            </button>
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
          <div className="mt-6 space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div 
                  onClick={() => window.location.href = `/projects/${project.id}`} 
                  className="block p-5 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium text-blue-600 truncate">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} />
                    </div>
                    
                    <p className="text-base text-gray-500 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Client: {project.client_name}
                    </p>
                    
                    {project.description && (
                      <p className="text-base text-gray-500 mb-3">
                        {project.description.substring(0, 100)}
                        {project.description.length > 100 ? '...' : ''}
                      </p>
                    )}
                    
                    {project.hourly_rate && (
                      <div className="flex justify-end">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ${project.hourly_rate}/hr
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Fixed Add Button for Mobile */}
      {!showForm && (
        <div className="fixed bottom-20 right-4">
          <button
            onClick={() => setShowForm(true)}
            className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default Projects;