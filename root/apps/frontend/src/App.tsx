import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CreateListPage } from './pages/CreateListPage';
import { HomePage } from './pages/HomePage';
import { ViewListPage } from './pages/ViewListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lists/new" element={<CreateListPage />} />
        <Route path="/lists/:id" element={<ViewListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
