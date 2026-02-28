import { NavLink } from 'react-router-dom';

function Navbar({ employees }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">Task Workflow Portal</div>
      <nav className="navbar-links" aria-label="Main navigation">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Dashboard
        </NavLink>
        <NavLink to="/manager" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Manager Panel
        </NavLink>
        {employees.map((employee) => (
          <NavLink
            key={employee.id}
            to={`/employee/${employee.id}`}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {employee.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
