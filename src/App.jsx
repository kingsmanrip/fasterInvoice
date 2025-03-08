import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './routes/Login';
import Dashboard from './routes/Dashboard';
import Clients from './routes/Clients';
import ClientDetail from './routes/ClientDetail';
import Projects from './routes/Projects';
import ProjectDetail from './routes/ProjectDetail';
import Invoices from './routes/Invoices';
import InvoiceCreate from './routes/InvoiceCreate';
import InvoiceDetail from './routes/InvoiceDetail';
import NotFound from './routes/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/create" element={<InvoiceCreate />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;