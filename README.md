# jev-tos-checker

閲覧中の利用規約を条項ごとに TypeSafe の [Jev](https://docs.typesafe.ai) で判定し、ユーザーに不利な可能性のある条項を原文つきで示す Chrome 拡張機能です。
「このサイトは安全」と断定するものではなく、確認すべき条項を見つけるための補助ツールです。

画面はブラウザの言語に合わせて日本語または英語で表示されます。解析する規約の言語は問いません。

## 使い方

1. `jev-tos-checker.zip` を受け取り、展開します。
2. Chrome で `chrome://extensions` を開き、右上の「デベロッパー モード」をオンにします。
3. 「パッケージ化されていない拡張機能を読み込む」を押し、展開したフォルダを選びます。
4. 設定画面が自動で開くので、次のどちらかを入力して「保存して接続を確認」を押します。
   - **自分の APIキーを使う**: TypeSafe で発行した APIキー
   - **解析サーバーを使う**: 管理者から案内されたサーバーの URL
5. 利用規約のページを開き、ツールバーの拡張機能ボタンから「このページの規約を解析」を押します。

結果の条項を押すと、ページ内の該当箇所までスクロールして赤枠で示します。設定はポップアップ右上の「設定」からいつでも変更できます。

## 判定するカテゴリ

各条項について、次の 5 つを Noul 質問として個別に判定します(`core/categories.ts`)。

| カテゴリ | 内容 |
| --- | --- |
| 個人情報 | データの第三者提供や目的外利用 |
| 規約変更 | 事前通知のない一方的な変更 |
| 責任制限 | 事業者の責任を広く免除する条項 |
| アカウント | 不明確な理由による停止・削除 |
| 紛争解決 | 強制仲裁や不利な裁判管轄 |

Noul が 0.7 以上なら「要注意」、0.3 以上 0.7 未満なら「要確認」と表示します(`extension/src/classify.ts`)。

## 構成

```
core/       Jev への問い合わせとカテゴリ定義(拡張機能と Worker で共有)
extension/  Chrome 拡張 (Manifest V3)
worker/     解析サーバー (Cloudflare Worker)。APIキーを利用者に配らずに提供したい場合に使う
```

拡張機能はボタンを押したときだけページを読み取り(`activeTab`)、条項のテキストだけを送信します。
APIキーを使う設定では Jev に直接、解析サーバーを使う設定では Worker 経由で問い合わせます。

## 開発

```sh
npm install
npm run build      # extension/dist を生成
npm run package    # 配布用の jev-tos-checker.zip を生成
npm test
npm run typecheck
```

文言は `extension/_locales/{ja,en}/messages.json` にあります。言語を追加するときは同じキーを持つファイルを追加します。

### 解析サーバー

```sh
npm install-scripts approve workerd   # wrangler dev に必要
echo 'TYPESAFE_API_KEY=<your key>' > .dev.vars
npm run dev:worker                    # http://localhost:8787

npx wrangler secret put TYPESAFE_API_KEY
npm run deploy:worker
```

デプロイした URL を利用者に伝え、設定画面の「解析サーバーを使う」に入力してもらいます。
