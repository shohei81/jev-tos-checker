# Jev ToS Checker

English | [日本語](README.ja.md) | [Website](https://shohei81.github.io/jev-tos-checker/)

A Chrome extension that reads the terms of service on the page you are viewing and points out clauses that may work against you, using TypeSafe's [Jev](https://docs.typesafe.ai) model.

<p>
  <img src="docs/images/popup-en.png" alt="Analysis results in the extension popup" width="380">
</p>

## About

Terms of service are long, and an abusive clause is easy to miss. Jev ToS Checker splits a terms page into clauses and checks each one for eight kinds of abusive terms. It marks only clauses that go well beyond what is common among major services, so it does not alarm you about ordinary terms. Every match is shown next to the original text, so you can judge it yourself.

- **Works on any site.** It analyzes the page in front of you on the spot, so it does not depend on a database of pre-reviewed services.
- **Shows its evidence.** Click a result to scroll to that clause on the page and highlight it.
- **Works in any language.** The extension's interface is in English or Japanese, following your browser. The terms you analyze can be in any language.
- **Reads the page only when you ask.** The extension reads the page only when you click its button, and sends only the text of the clauses.

This tool helps you find clauses worth a closer look. It does not decide whether a service is "safe", and it is not legal advice.

### What it checks

| Category | Marked, for example | Not marked, for example |
| --- | --- | --- |
| Personal data | Selling your data or giving it to third parties without consent | Sharing with vendors that work for the service, or when the law requires it |
| Changes to the terms | Changing the terms with no notice, or retroactively | Changes announced in advance |
| Liability | No liability even for the provider's intentional misconduct | Capping liability at the fees you paid |
| Accounts | Deleting your account and data for no reason, keeping your balance | Suspending accounts for serious violations, with notice |
| Disputes | Forced arbitration, class action waivers, banning lawsuits | The provider's home courts, while your local courts stay available |
| Auto-renewal | Cancellation only by mail, or cancellation penalties | Renewal you can cancel online at any time |
| Your content | Taking ownership of your content, or the right to sell it | A license only to run and improve the service |
| Fees | Charging you or raising prices without consent or notice | Price changes announced in advance, with the option to cancel |

Each clause is judged together with the paragraphs around it, so an exception in the next paragraph is taken into account. A clause is marked as **Caution** when the probability that it is abusive is 70% or higher.

## Installation

The extension is not on the Chrome Web Store yet, so you install it from a downloaded folder. It takes about two minutes.

1. **Download** [jev-tos-checker.zip](https://github.com/shohei81/jev-tos-checker/releases/latest/download/jev-tos-checker.zip) (the latest version from the [Releases](https://github.com/shohei81/jev-tos-checker/releases) page).
2. **Unzip it.** You get a folder named `jev-tos-checker`. Move it somewhere you will keep it, such as your Documents folder. If you delete or move the folder later, the extension stops working.
3. In Chrome, type `chrome://extensions` in the address bar and press Enter.
4. Turn on **Developer mode** in the top-right corner.
5. Click **Load unpacked** and select the `jev-tos-checker` folder from step 2.
6. To keep the extension handy, click the puzzle-piece icon in the toolbar and pin **Jev ToS Checker**.

### Check that the download is genuine (optional)

Release files are built by GitHub Actions in this repository, and GitHub keeps a signed record of each build. If you use the [GitHub CLI](https://cli.github.com), you can confirm that your zip came from this repository and has not been modified:

```sh
gh attestation verify jev-tos-checker.zip --repo shohei81/jev-tos-checker
```

This works for releases published after v0.3.0.

### Set up a connection

After installation, the settings page opens automatically. Choose one option and click **Save and test connection**.

- **Use my own API key**: paste an API key from your TypeSafe account ([how to get one](https://docs.typesafe.ai/introduction/quickstart)). The key is stored only in your browser.
- **Use an analysis server**: if someone runs a server for you, enter the URL they gave you.

<p>
  <img src="docs/images/options-en.png" alt="Connection settings page" width="480">
</p>

To change these settings later, open the extension and click the gear icon in the top-right corner.

## Usage

1. Open a terms of service or privacy policy page.
2. Click the extension icon, then **Analyze terms on this page**.
3. Results are grouped by category. Click a clause to jump to it on the page.

## For developers

```
core/       Jev requests and category definitions (shared by the extension and the server)
extension/  Chrome extension (Manifest V3)
worker/     Analysis server (Cloudflare Worker), for offering the extension without handing out an API key
```

```sh
npm install
npm run build      # build extension/dist; load extension/ as an unpacked extension
npm run package    # create jev-tos-checker.zip
npm test
npm run typecheck
```

- The questions sent to Jev are in `core/categories.ts`, and the thresholds are in `extension/src/classify.ts`.
- The UI text is in `extension/_locales/{en,ja}/messages.json`. To add a language, add a file with the same keys.
- Pushing a `v*` tag runs `.github/workflows/release.yml`, which builds the zip and attaches it to a GitHub release.

### Running the analysis server

```sh
npm install-scripts approve workerd   # required by wrangler dev
echo 'TYPESAFE_API_KEY=<your key>' > .dev.vars
npm run dev:worker                    # http://localhost:8787

npx wrangler secret put TYPESAFE_API_KEY
npm run deploy:worker
```

The server has no access control yet. Anyone with the URL can use it, and their requests are billed to your API key.

## License

[MIT](LICENSE)
