// ↓↓↓↓ インポート名は "@solidjs/router" でありますか？
import { Route } from '@solidjs/router';

// ↓↓↓↓ "lazy" は "solid-js" からであります！
import { lazy } from 'solid-js';

// --- お部屋（ページ）を「遅延読み込み（lazy）」します！ ---
// ↓↓↓↓ ファイルの「パス」は合ってますか？ (./routes/Home)
const Home = lazy(() => import('./routes/Home'));

// ↓↓↓↓ ファイルの「パス」は合ってますか？ (./routes/Admin)
const Admin = lazy(() => import('./routes/Admin'));

function App() {
    // --- 交通ルールを定義します！ ---
    return (
        <Route>

            {/* ルート ( / ) にアクセスが来たら… */}
            {/* → 「Home」コンポーネントを表示！ */}
            <Route path="/" component={Home} />

            {/* /admin にアクセスが来たら… */}
            {/* → 「Admin」コンポーネントを表示！ */}
            <Route path="/admin" component={Admin} />

        </Route>
    );
}

export default App;
