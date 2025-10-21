# Go言語 1.22 の環境からスタートであります！
FROM golang:1.25-alpine

# ホットリロードツール「Air」をインストールします！
RUN go install github.com/air-verse/air@latest

# コンテナの中の /app という場所で作業します
WORKDIR /app

# (↓本当は go.mod を先にコピーすると速いけど、VPS直接編集ならこれでOKであります！)
# とりあえず、全部コピーします (あとでマウントされて上書きされます)
COPY . .

# 起動コマンドは「Air」を実行！
# これで Go のコードが変わったら自動で再起動してくれます！
CMD ["air"]
