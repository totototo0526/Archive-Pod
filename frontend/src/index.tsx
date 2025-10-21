import { render } from 'solid-js/web';
import 'solid-devtools';
import App from './App';
import './index.css';
// ↓↓↓↓ インポート名は "@solidjs/router" でありますか？
import { Router } from '@solidjs/router';

// ↓↓↓↓ "Suspense" (待合室) は "solid-js" からインポートであります！
import { Suspense } from 'solid-js';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
  <Router>
    <Suspense fallback={<div>読み込み中であります...</div>}>
      <App />
    </Suspense>
  </Router>
), root!);
