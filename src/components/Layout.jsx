import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Invoice App</span>
              </div>
              <div className="ml-10 flex items-center space-x-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? 'px-3 py-2 rounded-md text-sm font-medium bg-blue-700' : 'px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500'
                  }
                  end
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/clients"
                  className={({ isActive }) =>
                    isActive ? 'px-3 py-2 rounded-md text-sm font-medium bg-blue-700' : 'px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500'
                  }
                >
                  Clients
                </NavLink>
                <NavLink
                  to="/projects"
                  className={({ isActive }) =>
                    isActive ? 'px-3 py-2 rounded-md text-sm font-medium bg-blue-700' : 'px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500'
                  }
                >
                  Projects
                </NavLink>
                <NavLink
                  to="/invoices"
                  className={({ isActive }) =>
                    isActive ? 'px-3 py-2 rounded-md text-sm font-medium bg-blue-700' : 'px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500'
                  }
                >
                  Invoices
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      <footer className="bg-white shadow mt-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Invoice App
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;