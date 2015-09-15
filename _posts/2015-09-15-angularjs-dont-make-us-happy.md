---
layout: post
title: WordpressのRest APIを使ったサイト構築
permalink: /post/angularjs-dont-make-us-happy/
tags: [wordpress, frontend, backend, javascript]
---

予め言っておくと、筆者は偉そうなことばかり抜かしていますが、仕事では圧倒的にWordpressを弄っていることが多い。そうすると、本当に簡単にルーチンワークの罠に陥るわけです。

で、そういうのいい加減厭なので、WP案件をいくつかパターン化して、プロジェクトテンプレートみたいな形でパッケージ化することにしてます。まだ上手く出来てないんだけど。

1. よく使う構成でプロジェクトテンプレートを作り、ディレクターレベルで情報設計（カテゴリの置き方とか、サイトマップの再現とか）が出来るようにする
1. Wordpressを外部API化する

今、丁度この二番目を試しています。実際に表示されるHTMLは（ほぼ）完全な静的HTMLで、コンテンツは外部Wordpressで管理。HTMLにWordpressの内容を表示する際は、Javascriptで取得してきましょう、というソリューションですね。

#### メリット

- フロントエンドの作業だけでサイト制作が完結するので、バックエンドの手が足りない or スキル的に不安がある場合に有効
- すべてのページでWordpressを通す必要がなくなるので、（特にATFの）パフォーマンスが改善する

#### デメリット

- フロントの負荷が大きくなる：ある程度、JSの処理を定型化して回避できるが、そんなことやってるんだったらAngularJSで構築しちゃえば…などの無茶が勃発するおそれがある
- 改修に当たる場合、ちょっとした修正にあたる技術者にも、ある程度の技術レベルが要求される
- プレビューをどうするか
- 投稿詳細ページなどの表示に、`mod_rewrite`などの知識が必要になる

…と、一見デメリットは多いんですが、パフォーマンスを重視する向きには、フロントで作業が完結してしまう点、またアウトプットのパターンがある程度限定されるので、キャッシングしやすい、などのなかなか捨てがたい魅力もあるのは事実。まだ、本当に上手くいくのか模索中ではあります。

## WP REST API

その際に大変役に立つプラグインがこの「WP REST API」。これを使うと、実に手軽にWordpressにREST APIを実装できます。噂に依ると、コアに取り込まれるって話もあるみたいっすね。真偽の程は調べておりません。

[WP REST API](http://wp-api.org/)

<img src="/i/wp-rest-api-v2.png" >

※ ver 2のドキュメントはあまりに制作途中なので、ver 1のものと併せて参照するのが吉。

これを仕込んだWordpressをどこかに置いて、実際の読み込みには以下の様な単純なAjax処理を書いてやれば動きます。（Vue.js使っています）

```js
var app,
    isInitialized;

$.ajax({
  url: '/wp-json/wp/v2/posts',
  data: {
    filter: {
      category_name: 'news'
    }
  },
  type: 'get',
  dataType: 'json',
  success: function(json) {
    Vue.component("post", {
      template: "#tpl"
    });

    if (!isInitialized) {
      app = new Vue({
        el: '#posts',
        data: {
          posts: json
        }
      });
      isInitialized = true;
    } else {
      app.$set( 'posts', json );
    }
  }
})
```

```html
<div id="posts">

  <div v-repeat="posts" v-component="post"></div>

  <script id="tpl" type="text/template">
    <li><a href="{ link }}">{ title.rendered }}</a></li>
  </script>

</div>
```

httpメソッドを、`POST`にすれば投稿、`DELETE`にすれば削除処理が走りますが、別途OAuthでの認証が必要になります。

## しかし…

多くの案件では、ここまで多くのメソッドを実装してある必要がないのですよね。単純にGET系の処理が走ればイイ。なので、自作のAPIを作ることにしました…（続くかも…）。