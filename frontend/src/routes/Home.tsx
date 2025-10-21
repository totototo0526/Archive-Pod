import { createResource, For, Switch, Match } from 'solid-js';

// APIの場所（これは管理ページとおんなじ！）
const API_URL = import.meta.env.VITE_API_BASE_URL;

// データの型定義（これもおんなじ！）
type Infographic = {
    id: number;
    title: string;
    description: string | null;
    thumbnail_url: string;
    page_url: string;
    category: string | null;
    category_color: string | null;
    created_at: string;
};

// データを取ってくる関数（これもおんなじ！）
const fetchInfographics = async () => {
    const response = await fetch(`${API_URL}/infographics`);
    if (!response.ok) {
        throw new Error("データの取得に失敗しましたであります…");
    }
    const data: Infographic[] | null = await response.json();
    return data ?? [];
};

function Home() {
    // GET APIのための電脳（これもおんなじ！）
    const [infographics] = createResource(fetchInfographics);

    // --- 画面（HTML/JSX）であります！ ---
    return (
        <div style={{ padding: "20px", "font-family": "sans-serif" }}>
            <h1>Archive Pod 公開ページ</h1>
            <p>（<a href="/admin">管理ページはこちら</a>）</p>

            <h2>インフォグラフィック一覧</h2>

            {/* --- カード形式のレイアウト（のつもり） --- */}
            <div style={{ display: "flex", "flex-wrap": "wrap", gap: "15px" }}>

                <Switch>
                    <Match when={infographics.loading}>
                        <p>データを読み込み中であります…</p>
                    </Match>
                    <Match when={infographics.error}>
                        <p>エラーであります！ {infographics.error.message}</p>
                    </Match>
                    <Match when={infographics()}>
                        {(data) => (
                            <For each={data()} fallback={<p>データはまだありませーんであります！</p>}>
                                {(item) => (
                                    // ↓これが「カード」であります！
                                    <a href={item.page_url} target="_blank" style={{
                                        border: "1px solid #ccc",
                                        padding: "10px",
                                        width: "200px",
                                        "text-decoration": "none",
                                        color: "black"
                                    }}>
                                        {/* サムネイル（のつもり） */}
                                        <img src={item.thumbnail_url} alt={item.title} style={{ width: "100%", "aspect-ratio": "16/9", "background-color": "#eee" }} />

                                        {/* カテゴリ（もしあれば） */}
                                        {item.category && (
                                            <span class={`
                        text-xs font-semibold 
                        px-2 py-0.5 rounded-full
                        ${item.category_color || 'bg-gray-200 text-gray-800'}
                        `}>
                                                {item.category}
                                            </span>
                                        )}

                                        {/* タイトル */}
                                        <h3 style={{ "margin-top": "5px" }}>{item.title}</h3>
                                    </a>
                                )}
                            </For>
                        )}
                    </Match>
                </Switch>
            </div>
        </div>
    );
}

export default Home;
