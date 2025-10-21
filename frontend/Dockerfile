# Node.js 20 の環境からスタートであります！
FROM node:20-alpine

# コンテナの中の /app という場所で作業します
WORKDIR /app

# まず package.json たちだけコピーします
# これで npm install がキャッシュされて速くなるであります！
COPY package*.json ./

# 必要なライブラリを全部インストール！
RUN npm install

# 残りの全部をコピーします (あとでマウントされます)
COPY . .

# 起動コマンドは「npm run dev」！
# 「--host 0.0.0.0」は、コンテナの外(Nginx)からアクセスできるようにする呪文であります！
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--force"]
