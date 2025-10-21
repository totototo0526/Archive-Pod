# Archive Pod (アーカイブ・ポッド)

これは、インフォグラフィックやWebコンテンツをアーカイブするための個人用Webアプリケーションプロジェクトであります！

archive.totototo0526.site で動かすことを目指してます！

Go言語 + SolidJS + Docker というモダンな技術スタックの勉強と実践のために、ソースコードをパブリックで公開していますであります！

## 🚀 使ってる技術（スタック）であります！

- **バックエンド (API):** Go (Gin or Echo)
    
- **フロントエンド (UI):** SolidJS (SolidStart)
    
- **データベース:** PostgreSQL
    
- **インフラ:** Docker / Docker Compose
    
- **Webサーバー/リバースプロキシ:** Nginx (Dockerコンテナ)
    

## 📂 基地（ディレクトリ）の構成であります！

Bash

```
/Archive-Pod/
├── docker-compose.yml  # 全軍の司令塔（設計図）であります！
├── .env                # (秘密のコト！.gitignoreで隠すであります！)
├── .env.example        # ↑のヒナガタであります
│
├── backend/            # Go言語 (APIサーバー) のお部屋
│   ├── Dockerfile      # Goのお部屋の作り方
│   └── (main.go とか...)
│
├── frontend/           # SolidJS (Web) のお部屋
│   ├── Dockerfile      # SolidJSのお部屋の作り方
│   └── (src/ とか package.json とか...)
│
└── nginx/              # 交通整理（Nginx）のお部屋
    ├── Dockerfile
    └── default.conf    # 交通ルール
```

## 🛠️ 動かし方であります！ (VPSでの開発)

このプロジェクトは、VPS上で `docker compose` を使って、全てのサービス（Go, SolidJS, DB, Nginx）をコンテナとして起動することを前提としていますであります。

1.  リポジトリを配備
    
    VPSにSSHで入って、好きな場所にリポジトリを git clone します。
    
    cd Archive-Pod で、ディレクトリに入ります。
    
2.  秘密のファイル (.env) の準備
    
    データベースのパスワードなど、大事な情報を書くファイルを用意します。
    
    Bash
    
    ```
    cp .env.example .env
    ```
    
    そしたら、`nano .env` とかでお好みのエディタで開き、中身（特に `POSTGRES_PASSWORD` など）をちゃんと書き換えるであります！
    
3.  Dockerのインストール
    
    もしVPSに docker と docker-compose (または docker compose) が入ってなかったら、インストールしてくださいであります！
    
4.  全コンテナ起動！
    
    コマンド一発！これですべてが起動しますであります！
    
    Bash
    
    ```
    # 「--build」はDockerfileを更新した時に必要であります
    docker compose up -d --build
    ```
    
5.  \[初回のみ\] データベースの準備
    
    コンテナは起動しましたけど、まだDBにテーブルがありません！
    
    仕様書にある CREATE TABLE 文を実行する必要がありますであります。
    
    Bash
    
    ```
    # 1. 起動した 'db' コンテナの中に入ります
    docker compose exec db psql -U (envで設定したユーザー名) -d infographics_db
    
    # 2. psql (ポスグレ) の画面になったら、仕様書の CREATE TABLE 文を
    #    ペタッと貼り付けて Enter 
    #    (CREATE TABLE infographics ( ... ); みたいなやつであります！)
    
    # 3. 「CREATE TABLE」って出たら成功！ \q で外に出ます
    ```
    
6.  アクセス！
    
    これで、Nginxコンテナが http://\[VPSのIPアドレス\] (または http://archive.totototo0526.site) へのアクセスをイイ感じに捌いてくれるはずであります！
    
    - `/` → SolidJSの画面
        
    - `/api/` → GoのAPI
        

## 📡 APIのエンドポイントであります！

このPodが提供するAPIはこんな感じであります。

| **メソッド** | **エンドポイント** | **概要** |
| --- | --- | --- |
| `GET` | `/api/infographics` | 全コンテンツの一覧を取得 |
| `POST` | `/api/infographics` | 新しいコンテンツを1件登録 |
| `DELETE` | `/api/infographics/:id` | 指定IDのコンテンツを1件削除 |

## 📜 ライセンスであります！

このプロジェクトは MIT License で公開されてるであります！


## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)
