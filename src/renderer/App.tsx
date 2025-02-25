import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import {
  VideoUpload,
  VideoStoryline,
  GenerateStoryline,
  VideoSummary,
} from './pages';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoUpload />} />
        <Route path="/storyline" element={<VideoStoryline />} />
        <Route path="/generate" element={<GenerateStoryline />} />
        <Route path="/summary" element={<VideoSummary />} />
      </Routes>
    </Router>
  );
}
