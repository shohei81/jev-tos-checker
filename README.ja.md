# Jev ToS Checker

[English](README.md) | 日本語 | [Web サイト](https://shohei81.github.io/jev-tos-checker/ja/)

閲覧中のページの利用規約を読み取り、あなたにとって不利になりうる条項を TypeSafe の [Jev](https://docs.typesafe.ai) モデルで見つけて示す Chrome 拡張機能です。

<p>
  <img src="docs/images/popup-ja.png" alt="拡張機能のポップアップに表示された解析結果" width="380">
</p>

## About

利用規約は長く、悪質な条項が紛れていても見落としがちです。Jev ToS Checker は規約のページを条項ごとに分け、8種類の悪質な条項に当たるかを1つずつ判定します。印を付けるのは、大手サービスで一般的な範囲を大きく超える条項だけなので、ありふれた条項で不安にさせることはありません。該当した条項は原文と一緒に表示するので、最終的な判断はご自身で行えます。

- **どのサイトでも使える**: 開いているページをその場で解析します。事前に評価済みのサービスに限られません。
- **根拠を示す**: 結果を押すと、ページ内の該当する条項までスクロールして枠で示します。
- **言語を問わない**: 画面はブラウザの言語に合わせて日本語か英語で表示します。解析する規約はどの言語でもかまいません。
- **頼んだときだけ読む**: ページを読み取るのはボタンを押したときだけで、送信するのは条項のテキストだけです。

このツールは、確認すべき条項を見つけるための補助です。サービスが「安全」かどうかを判定するものではなく、法的助言でもありません。

### 判定する内容

| カテゴリ | 印を付ける例 | 印を付けない例 |
| --- | --- | --- |
| 個人情報 | 同意なく個人情報を販売・提供する | 業務委託先への提供、法令に基づく開示 |
| 規約変更 | 予告なく、または遡って規約を変更する | 事前に通知したうえでの変更 |
| 責任制限 | 事業者の故意による損害まで免責する | 支払額を上限とする責任制限 |
| アカウント | 理由なくアカウントやデータを削除し、残高も返さない | 重大な違反時の、通知つきの停止 |
| 紛争解決 | 強制仲裁、集団訴訟の放棄、訴訟の禁止 | 本社所在地の裁判所(居住地の裁判所も使える場合) |
| 自動更新 | 郵送でしか解約できない、解約の違約金 | いつでもオンラインで解約できる自動更新 |
| 投稿コンテンツ | 著作権を取り上げる、販売する権利を得る | サービスの運営と改善に限った利用許諾 |
| 料金 | 同意や通知なしの請求・値上げ | 事前に通知し、解約も選べる値上げ |

各条項は前後の段落と一緒に判定するので、直後の但し書きも考慮されます。悪質である確率が 70% 以上の条項に **要注意** の印を付けます。

## インストール

まだ Chrome ウェブストアには公開していないため、ダウンロードしたフォルダから読み込みます。2分ほどで終わります。

1. [jev-tos-checker.zip](https://github.com/shohei81/jev-tos-checker/releases/latest/download/jev-tos-checker.zip) を**ダウンロード**します([Releases](https://github.com/shohei81/jev-tos-checker/releases) ページにある最新版です)。
2. **zip を展開**すると `jev-tos-checker` フォルダができます。書類フォルダなど、残しておく場所に移してください。あとでフォルダを削除・移動すると拡張機能が動かなくなります。
3. Chrome のアドレスバーに `chrome://extensions` と入力して Enter を押します。
4. 右上の **デベロッパー モード** をオンにします。
5. **パッケージ化されていない拡張機能を読み込む** を押し、手順 2 の `jev-tos-checker` フォルダを選びます。
6. ツールバーのパズルのアイコンから **Jev ToS Checker** をピン留めしておくと、すぐに使えます。

### ダウンロードしたファイルの確認(任意)

リリースのファイルはこのリポジトリの GitHub Actions で作られ、GitHub がビルドごとに署名付きの記録を残しています。[GitHub CLI](https://cli.github.com) を使っている場合は、zip がこのリポジトリで作られ、改ざんされていないことを確認できます。

```sh
gh attestation verify jev-tos-checker.zip --repo shohei81/jev-tos-checker
```

v0.3.0 より後に公開したリリースが対象です。

### 接続の設定

インストールすると設定画面が自動で開きます。どちらかを選んで **保存して接続を確認** を押してください。

- **自分の APIキーを使う**: TypeSafe のアカウントで発行した APIキーを貼り付けます([取得方法](https://docs.typesafe.ai/introduction/quickstart))。キーはこのブラウザ内にだけ保存されます。
- **解析サーバーを使う**: 解析サーバーを用意してくれた人がいる場合は、案内された URL を入力します。

<p>
  <img src="docs/images/options-ja.png" alt="接続設定の画面" width="480">
</p>

あとから設定を変えるときは、拡張機能を開いて右上の歯車のアイコンを押します。

## 使い方

1. 利用規約やプライバシーポリシーのページを開きます。
2. 拡張機能のアイコンを押し、**このページの規約を解析** を押します。
3. 結果はカテゴリごとにまとめて表示されます。条項を押すと、ページ内のその箇所に移動します。

## 開発者向け

```
core/       Jev への問い合わせとカテゴリ定義(拡張機能とサーバーで共有)
extension/  Chrome 拡張 (Manifest V3)
worker/     解析サーバー (Cloudflare Worker)。APIキーを配らずに拡張機能を提供したい場合に使う
```

```sh
npm install
npm run build      # extension/dist を生成。extension/ をパッケージ化されていない拡張機能として読み込む
npm run package    # jev-tos-checker.zip を生成
npm test
npm run typecheck
```

- Jev への質問文は `core/categories.ts`、しきい値は `extension/src/classify.ts` にあります。
- 画面の文言は `extension/_locales/{en,ja}/messages.json` にあります。言語を追加するときは同じキーを持つファイルを追加します。
- `v*` のタグを push すると `.github/workflows/release.yml` が zip を作り、GitHub のリリースに添付します。

### 解析サーバーの起動

```sh
npm install-scripts approve workerd   # wrangler dev に必要
echo 'TYPESAFE_API_KEY=<your key>' > .dev.vars
npm run dev:worker                    # http://localhost:8787

npx wrangler secret put TYPESAFE_API_KEY
npm run deploy:worker
```

サーバーにはまだアクセス制限がありません。URL を知っていれば誰でも使え、その利用料はあなたの APIキーに請求されます。

## ライセンス

[MIT](LICENSE)
