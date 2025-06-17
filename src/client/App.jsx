import { Routes, Route } from 'react-router-dom';

import Layout from './pages/Layout.jsx';
import JobFeedPage from './pages/JobFeedPage/JobFeedPage.jsx';
import JobFeedDetails from './pages/JobFeedPage/JobFeedDetails.jsx';
import PageNotFound from './pages/PageNotFound/PageNotFound.jsx';

import './App.css';
import MetaGenerator from './components/MetaGenerator/MetaGenerator.jsx';

function App({ job }) {
  return (
    <div >
      <MetaGenerator job={job} />
      <Routes>
        <Route path="/jobboardportal" element={<Layout />}>
          <Route path="jobfeed/:key" element={<JobFeedPage />} />
          <Route path="jobdetails/:key" element={<JobFeedDetails />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}

export default App;