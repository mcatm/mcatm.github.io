---
layout: post
title: Wordpress Multisiteで多言語展開する特殊なやり方
permalink: /post/i18n-on-wp-multisite/
tags: [wordpress, backend]
---

WordpressのMultisite機能を使って構築したサイトで、多言語展開したいという話がありまして。

想定しているURLは

```
http://example.com/
http://example.com/site/ ← WP Multisiteで「blog」と言われるサイト
```

という日本語版に対して、

```
http://example.com/en/
http://example.com/en/site/
```

となる、という与件。

## プラグインを使わないという前提

WPMLなどのマルチリンガルプラグインを使う。これも勿論正統な解決策なんですが、これではURLの問題は解決しない場合も多い。また、多言語化のために、大仰なプラグインを使うのは避けたいという事情もあり、今回は却下。言語ごとのパラメータの出し分けは、カスタムフィールドなどを使ってなんとかする（この辺のソリューションもつつくと蛇が出る）

## Redirect Urlを書き換える

```php
function redirect_rules( $urls )
{
  $new_urls = array();
  foreach ($urls as $k => $v) $new_urls['en/' . $k] = $v;
  $urls = array_merge($new_urls, $urls);
  return $urls;
}
add_filter( 'rewrite_rules_array', 'redirect_rules' );
```

こういう感じで、全てのRewrite Rulesに対して、`en/`を頭につけてやるフィルターを`functions.php`などに置いてやると、`en`で始まるURLへのアクセスも、通常通りにさばいてくれる。普通のWPサイトであればこれで問題ない。

しかしながら、これはマルチサイトでは役に立たない。何故なら、`en/site`へのアクセスも、ルート（`http://example.com`）へのアクセスとみなされて、404を吐くから。これはいかん。

## 固定ページで無理やり構築すると

要するに、各サイト（blog）で、slugが`en`であるページを作って、英語のページは全てその子ページとするというソリューションも考えられる。

でもその場合は、

```
http://example.com/en/
http://example.com/site/en/
http://example.com/site/en/page
```

こんなURLになってしまって、すこぶるカッコ悪い。また、カテゴリアーカイブをどうするかという問題もある。

## で、どうしたか

結論から言うと、`/en/index.php`を新規作成（.htaccessもコピー）。内容は、通常のWPの`index.php`と変わらないんだが、中で`$_SERVER['REQUEST_URI']`を書き換えてやる。

```php
define('WP_USE_THEMES', true);

$_SERVER['LANG'] = 'en';
$_SERVER['REQUEST_URI'] = str_replace('/' . $_SERVER['LANG'], '', $_SERVER['REQUEST_URI']);

/** Loads the WordPress Environment and Template */
require( dirname( __FILE__ ) . '/../wp-blog-header.php' );
```

これで、`/en`でアクセスした時も、`/`へのアクセスと同様の内容を返してくれる。`$_SERVER['LANG']`も設定しているので、それを参照すれば、現在何語のコンテンツを見ているのか明示できる。

`$_SERVER['REQUEST_URI']`を書き換えるので、決してお行儀の良いソリューションではないんだが、ちょっとこれで様子を観てみようかなと思ってます。