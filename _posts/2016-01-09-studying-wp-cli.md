---
layout: post
title: WP-CLIを試してみた
permalink: /post/studying-wp-cli/
tags: [wordpress]
---

Wordpressをコンソールで操作できる**「WP-CLI」**を試してみました。管理画面開いてのろのろやってた諸々の作業が、コマンド一発で完了できるのは非常に魅力的！

### インストール

まずはpharファイルをcURLで落としてきます。

```
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
```

パーミッションを実行可能なものに変更してから、`/usr/local/bin`に移動。（OS X El CapitanでHomebrew使ってなかった人とかは、`/usr/`以下使えないかもしれないですね。であれば適当にPATH通してください）

```
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
```

これで、`$ wp`が実行可能になります

### 使い方

```
wp core download
```

Wordpressのコアファイルをダウンロードしてきます。デフォルトではロケールが`en_US`になっています。

```
wp core download --locale=ja
```

これで、ロケールが`ja`になるはずなんだけど、何故かダウンロード出来ない。（`ja_jp`でも同様だった…）
まあ、最新のバージョンのWPの場合、そこまで問題にならないので`en_US`をダウンロード

```
wp core config --dbname={DBNAME} --dbuser={DBUSER} --dbpass={DBPASS}
```

`wp-config.php`ファイルを作成出来ます。`CONTENT_DIR`とかを別途設定したり、`WP_DEBUG`を変更したりすることがあると思うんですけど、そうしたコードも追記できます。（でも、使い勝手悪いのでそんなに使わないかな…）

```
wp plugin install advanced-custom-fields
```

Advanced Custom Fieldsをインストールするのもこんな感じ。`wp plugin install {プラグインのslug}`でインストール可能です。プラグインを探すには、`wp plugin search {クエリ}`といった感じ。プラグインを有効化するときも、`wp plugin activate {プラグインのslug}`で一発です。

```
wp theme install {テーマのslug}
wp theme activate {テーマのslug}
```

テーマをインストールしたり、有効化したりするのも、この通り、非常に簡単です。

```
wp scaffold _s {テーマ名}
```

Scaffoldも充実していて、上記の`wp scaffold _s`は、空のテーマを生成します。試してみたんですが、余計なコード（Jetpackの機能をいくつか有効化してたり）が多かったので使わないとは思うんですが、一般的なテーマの作り方が一通り記述してあるので、テーマ制作初心者には嬉しいかもしれないですね。

---

### ユニットテスト／BDD

しかし今までのは序章…。本当に僕が試したかったのは、ユニットテスト用のファイルを生成出来るScaffoldの方だったんですね。

下記コマンドで、プラグインユニットテスト用のファイルを吐けます。

```
wp scaffold plugin-tests {プラグインのslug}
```

まあ、プラグインについては今までもテストしたりしていたんですけど、WPの場合はプラグイン以外は構造上ユニットで割りにくい（テーマで割るとかはあるのかな…？）ので、アプリケーション全体でテストしたいときは、BDDの手法を採用する必要があります。WP-CLIでは、BeHat用のファイルを吐くことも可能です。

```
wp scaffold package-tests {テストファイルのPATH}
```

BDDについては、また別途まとめたいと思います。今回はこんなところで。

---

##### 参考リンク

- [Command line interface for WordPress | WP-CLI](http://wp-cli.org/)
- [WP-CLIの使い方 - Qiita](http://qiita.com/IK12_info/items/4a9190119be2a0f347a0)
- [WP-CLI+PHPUnitを使ったWordPressプラグインのユニットテスト（１） | Firegoby](https://firegoby.jp/archives/5498)
- [WP-CLI+PHPUnitを使ったWordPressプラグインのユニットテスト（２） | Firegoby](https://firegoby.jp/archives/5511)