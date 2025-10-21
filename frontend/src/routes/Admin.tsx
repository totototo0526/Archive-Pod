// ↓↓↓↓ "Switch" と "Match" は "solid-js" からであります！
import { createSignal, createResource, For, Switch, Match } from 'solid-js';

// --- .env ファイルからAPIの場所を読み込みます ---
const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- DBから取ってくるデータの「型」を定義します ---
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
const COLOR_OPTIONS = [
    { label: "灰色 (デフォルト)", value: "bg-gray-200 text-gray-800" },
    { label: "青色 (テクノロジーとか)", value: "bg-blue-200 text-blue-800" },
    { label: "緑色 (おしらせとか)", value: "bg-green-200 text-green-800" },
    { label: "黄色 (注意とか)", value: "bg-yellow-200 text-yellow-800" },
    { label: "赤色 (重要とか)", value: "bg-red-200 text-red-800" },
];

function Admin() { // ←←← 関数名が "App" じゃなくて "Admin" になってますか？

    // --- 1. GET APIのための「電脳」 (createResource) ---
    const fetchInfographics = async () => {
        const response = await fetch(`${API_URL}/infographics`);
        if (!response.ok) {
            throw new Error("データの取得に失敗しましたであります…");
        }
        const data: Infographic[] | null = await response.json();
        return data ?? [];
    };
    const [infographics, { refetch }] = createResource(fetchInfographics);

    // --- 2. POSTフォームのための「信号」 (createSignal) ---
    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [thumbnailFile, setThumbnailFile] = createSignal<File | null>(null);
    const [pageFile, setPageFile] = createSignal<File | null>(null);
    const [category, setCategory] = createSignal("");
    const [categoryColor, setCategoryColor] = createSignal(COLOR_OPTIONS[0].value)
    const [isUploading, setIsUploading] = createSignal(false);

    // --- 3. 「登録ボタン」が押された時の処理 ---
    // --- 3. 「登録ボタン」が押された時の処理 ---

    // ★★★ まず、ファイルを1個アップロードする「関数」を新しく作ります！ ★★★
    const uploadFile = async (file: File): Promise<string> => {
        // FormDataは、ファイルをPOSTするための「特別な封筒」であります！
        const formData = new FormData();
        formData.append('file', file); // "file"っていう名前でファイルを封筒に入れます！

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData, // JSONじゃなくて、この封筒を送ります！
        });

        if (!response.ok) {
            throw new Error(`「${file.name}」のアップロードに失敗しました…`);
        }

        // backendから {"url":"/uploads/..."} が返ってくるはず！
        const result = await response.json();
        return result.url; // "url" の中身だけを返します！
    };

    // ★★★ こっちが「登録ボタン」本体の処理であります！ ★★★
    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        // ファイルが2個とも選ばれてるか、チェックします！
        if (!thumbnailFile() || !pageFile()) {
            alert("「サムネイル」と「ページ本体」の両方のファイルを選んでくださいであります！");
            return;
        }

        // 連続で押せないように「アップロード中」にします！
        setIsUploading(true);

        try {
            // --- ステップ1: ファイルを2個、順番にアップロード！ ---
            const uploadedThumbnailUrl = await uploadFile(thumbnailFile()!);
            const uploadedPageUrl = await uploadFile(pageFile()!);

            // --- ステップ2: backend に登録するJSONを組み立てる！ ---
            const payload = {
                title: title(),
                description: description() || null,
                thumbnail_url: uploadedThumbnailUrl, // ← さっき返ってきたURL！
                page_url: uploadedPageUrl,         // ← さっき返ってきたURL！
                category: category() || null,
                category_color: categoryColor() || null,
            };

            // --- ステップ3: いつものJSONをPOSTする！ ---
            const response = await fetch(`${API_URL}/infographics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("JSONデータの登録に失敗しました…");
            }

            // --- ステップ4: 成功したら、フォームをリセット！ ---
            alert("登録成功であります！");
            setTitle("");
            setDescription("");
            setThumbnailFile(null); // ファイルの記憶もリセット
            setPageFile(null);      // ファイルの記憶もリセット
            setCategory("");
            setCategoryColor("");
            refetch(); // 一覧を更新！

        } catch (err: any) {
            // 途中でエラーが起きたら…
            alert(err.message || "なにかエラーが起きました…");
        } finally {
            // 成功しても失敗しても、「アップロード中」を解除！
            setIsUploading(false);
        }
    };
    // --- 4. 「削除ボタン」が押された時の処理 ---
    const handleDelete = async (id: number) => {
        if (!confirm(`ID: ${id} を本当に削除しますでありますか？`)) {
            return;
        }
        const response = await fetch(`${API_URL}/infographics/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            alert("削除に失敗しましたであります…！");
            return;
        }
        alert("削除成功であります！");
        refetch();
    };

    // --- 5. 画面（HTML/JSX）であります！ ---
    return (
        <div style={{ padding: "20px", "font-family": "sans-serif" }}>
            <h1>Archive Pod 管理ページ</h1>
            {/* ↓↓↓↓ 公開ページに戻るリンクを追加しときました！ */}
            <p>（<a href="/">公開ページに戻る</a>）</p>

            {/* --- 新規登録フォーム --- */}
            <form onSubmit={handleSubmit} style={{ "margin-bottom": "30px", border: "1px solid #ccc", padding: "10px" }}>
                <h2>新規登録</h2>
                <div><label>タイトル: <input type="text" value={title()} onInput={(e) => setTitle(e.currentTarget.value)} required /></label></div>
                <div><label>説明文: <textarea value={description()} onInput={(e) => setDescription(e.currentTarget.value)} /></label></div>

                <div><label>サムネイル (画像):
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.currentTarget.files ? e.currentTarget.files[0] : null)}
                        required
                    />
                </label></div>

                <div>
                    <label>カテゴリ色:
                        <select
                            value={categoryColor()}
                            onInput={(e) => setCategoryColor(e.currentTarget.value)}
                        >
                            {/* さっき作った「色の選択肢」を <For> でループさせます！ */}
                            <For each={COLOR_OPTIONS}>
                                {(color) => (
                                    <option value={color.value}>
                                        {color.label}
                                    </option>
                                )}
                            </For>
                        </select>
                    </label>
                </div>

                <div><label>カテゴリ名: <input type="text" value={category()} onInput={(e) => setCategory(e.currentTarget.value)} /></label></div>
                <div><label>カテゴリ色(CSSクラス): <input type="text" value={categoryColor()} onInput={(e) => setCategoryColor(e.currentTarget.value)} /></label></div>

                <button type="submit" disabled={isUploading()}>
                    {isUploading() ? "アップロード中であります..." : "登録するであります！"}
                </button>
            </form>
            {/* --- 登録済み一覧 --- */}
            <h2>登録済み一覧</h2>
            <Switch>
                <Match when={infographics.loading}>
                    <p>データを読み込み中であります…</p>
                </Match>
                <Match when={infographics.error}>
                    <p>エラーであります！ {infographics.error.message}</p>
                </Match>
                <Match when={infographics()}>
                    {(data) => (
                        <table style={{ "border-collapse": "collapse", border: "1px solid #ccc" }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>タイトル</th>
                                    <th>ページURL</th>
                                    <th>登録日時</th>
                                    <th>削除</th>
                                </tr>
                            </thead>
                            <tbody>
                                <For each={data()} fallback={<tr><td colspan={5}>データはまだありませーんであります！</td></tr>}>
                                    {(item) => (
                                        <tr>
                                            <td>{item.id}</td>
                                            <td>{item.title}</td>
                                            <td><a href={item.page_url} target="_blank">{item.page_url}</a></td>
                                            <td>{new Date(item.created_at).toLocaleString('ja-JP')}</td>
                                            <td>
                                                <button onClick={() => handleDelete(item.id)}>
                                                    削除
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </For>
                            </tbody>
                        </table>
                    )}
                </Match>
            </Switch>
        </div>
    );
}

export default Admin; // ←←← "Admin" を export してるか確認であります！
