import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });
      
      if (response.ok) {
        const client = await response.json();
        setClients((prev) => [...prev, client]);
        setNewClient({
          name: '',
          email: '',
          phone: '',
          address: '',
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        actionLabel={showForm ? null : "Add Client"}
        actionPath={showForm ? null : "#"} 
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">New Client</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a new client to your invoice system.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="name" className="label">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={newClient.name}
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
                      value={newClient.email}
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
                      value={newClient.phone}
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
                      value={newClient.address}
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

      {!showForm && clients.length === 0 ? (
        <EmptyState
          title="No clients"
          description="Get started by creating a new client."
          actionLabel="Add Client"
          actionPath="#"
          onClick={() => setShowForm(true)}
        />
      ) : (
        !showForm && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li key={client.id}>
                  <Link to={`/clients/${client.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {client.name}
                        </p>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {client.email && (
                            <p className="flex items-center text-sm text-gray-500">
                              {client.email}
                            </p>
                          )}
                          {client.phone && client.email && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {client.phone}
                            </p>
                          )}
                          {client.phone && !client.email && (
                            <p className="flex items-center text-sm text-gray-500">
                              {client.phone}
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

export default Clients;