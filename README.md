# kintone Difyチャット埋め込みプラグイン

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/r3-yamauchi/kintone-dify-chat-embed-plugin)

このプラグインは、kintoneアプリの各画面に [Dify](https://dify.ai/) のチャットボットを埋め込む機能を提供するプラグインです。

## 機能

1.  **Difyチャット埋め込み**:
    *   レコード一覧、詳細・編集、追加・再利用の各画面にDifyのチャットボットを埋め込むことができます。
    *   画面ごとに異なるチャットボット（Token）を設定可能です。
    *   チャットウィンドウの幅を画面ごとに調整できます。

2.  **キーボードショートカット制御**:
    *   チャットを埋め込むことで誤操作の原因になる可能性のある kintone標準のショートカットキー（`j`, `k`, `c`, `e`, `/` など）を個別に無効にできます。

## 設定方法

プラグインの設定画面から以下の項目を設定してください。

### Dify 全体設定
*   **Dify Base URL**: DifyのベースURLを入力します（未指定時は `https://udify.app` が使用されます）。
*   **Default Token**: デフォルトで使用するチャットボットのAPI Tokenを入力します。
*   **Default Width**: チャットウィンドウのデフォルトの幅を入力します（例: `600px`）。

### 各画面の設定
以下の画面ごとに設定が可能です：
*   レコード一覧画面
*   レコード詳細／編集画面
*   レコード追加／再利用画面

各画面で以下の設定を行えます：
*   **ショートカット**: 各操作のショートカットキーを有効にするか無効にするかを選択します。
*   **Difyチャット**:
    *   **Difyチャットを埋め込む**: チェックを入れると、その画面にチャットボットを表示します。
    *   **Token (Optional)**: 全体設定とは異なるチャットボットを使用したい場合にTokenを入力します。
    *   **Width (Optional)**: 全体設定とは異なる幅にしたい場合に入力します。

## インストール

1.  `dist/plugin.zip` をkintoneシステム管理画面から読み込みます。
2.  アプリの設定 > プラグイン から「Difyチャット埋め込み」を追加します。
3.  プラグインの設定画面を開き、必要な設定を行って保存します。
4.  アプリの設定を更新します。

## 開発

### ビルド
```bash
npm install
npm run build
```
`dist/plugin.zip` が生成されます。

## ライセンス

MIT License

Copyright (c) 2025 r3-yamauchi

本プラグインは cybozu developer network で公開されている [ローコードでAI × kintone連携！Difyプラグインの紹介](https://cybozu.dev/ja/kintone/ai/kintone-dify-plugin/) 内に掲載されている「Difyで作成したチャットボットをkintone上に表示するサンプルコード」を元に作成しました。

Original Code:
Copyright (c) 2025 Cybozu
Licensed under the MIT License
https://opensource.org/license/mit/
