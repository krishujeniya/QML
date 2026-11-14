import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HomePage } from './pages/HomePage';
import { BookPage } from './pages/BookPage';
import { LibraryPage } from './pages/LibraryPage';
import { buildReadmeIndex } from './data/readme-index';
import README from '../README.md?raw';
import './styles/site.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root mount element.');

const index = buildReadmeIndex(README);
const page = document.body.dataset.page;
const app = page === 'learn'
  ? <BookPage />
  : page === 'library'
    ? <LibraryPage index={index} source={README} />
    : <HomePage index={index} />;

createRoot(root).render(<StrictMode>{app}</StrictMode>);
